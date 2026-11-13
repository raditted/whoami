import { inject, onBeforeUnmount, onMounted, provide, ref } from 'vue'
import { profile } from '../data/portfolio'

const GITHUB_PROFILE_KEY = Symbol('github-profile')
const FRESH_TTL_MS = 5 * 60 * 1000
const STALE_TTL_MS = 24 * 60 * 60 * 1000

const FALLBACK_USER = {
  login: profile.handle,
  name: 'Radithya M.S',
  avatarUrl: profile.avatar.src,
  htmlUrl: 'https://github.com/raditted',
  company: 'Politeknik Negeri Bandung',
  location: profile.location,
  blog: 'https://raditted.dev',
  bio: 'some repos are private :)',
  publicRepos: 43,
  publicGists: 2,
  followers: 32,
  following: 37,
  createdAt: '2022-08-15T09:44:23Z',
  updatedAt: null
}

let markedPromise

function loadMarked() {
  // Lazy-load marked only if the GitHub REST API hits rate limits and raw fallback is used.
  markedPromise ??= import('marked').then((mod) => mod.marked ?? mod.default ?? mod)
  return markedPromise
}

function normalizeBlogUrl(rawBlog) {
  if (!rawBlog || typeof rawBlog !== 'string') return ''
  const trimmed = rawBlog.trim()
  if (!trimmed) return ''
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const parsed = new URL(candidate)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : ''
  } catch {
    return ''
  }
}

function mapGitHubUser(raw) {
  return {
    login: raw.login || FALLBACK_USER.login,
    name: raw.name || raw.login || FALLBACK_USER.name,
    avatarUrl: raw.avatar_url || FALLBACK_USER.avatarUrl,
    htmlUrl: raw.html_url || FALLBACK_USER.htmlUrl,
    company: raw.company || FALLBACK_USER.company,
    location: raw.location || FALLBACK_USER.location,
    blog: normalizeBlogUrl(raw.blog) || FALLBACK_USER.blog,
    bio: raw.bio ?? '',
    publicRepos: Number.isFinite(raw.public_repos) ? raw.public_repos : FALLBACK_USER.publicRepos,
    publicGists: Number.isFinite(raw.public_gists) ? raw.public_gists : FALLBACK_USER.publicGists,
    followers: Number.isFinite(raw.followers) ? raw.followers : FALLBACK_USER.followers,
    following: Number.isFinite(raw.following) ? raw.following : FALLBACK_USER.following,
    createdAt: raw.created_at || FALLBACK_USER.createdAt,
    updatedAt: raw.updated_at || null
  }
}

function readCache(cacheKey, maxAgeMs) {
  try {
    const raw = localStorage.getItem(cacheKey)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed.fetchedAt !== 'number') return null
    if (Date.now() - parsed.fetchedAt > maxAgeMs) return null
    return parsed
  } catch {
    return null
  }
}

function writeCache(cacheKey, payload) {
  try {
    localStorage.setItem(cacheKey, JSON.stringify(payload))
  } catch {
    // Ignore storage quota or private browsing errors.
  }
}

function describeHttpError(status, headers) {
  if (status === 403 || status === 429) {
    const remaining = headers?.get('X-RateLimit-Remaining')
    const resetEpoch = headers?.get('X-RateLimit-Reset')
    if (remaining === '0' && resetEpoch) {
      const resetTime = new Date(Number(resetEpoch) * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
      return `GitHub API rate limit reached for this IP. Try again around ${resetTime}.`
    }
    return 'GitHub API temporarily rate-limited unauthenticated requests.'
  }
  return `GitHub API responded with status ${status}.`
}

async function fetchRawReadmeFallback(username, signal) {
  const rawUrl = `https://raw.githubusercontent.com/${encodeURIComponent(username)}/${encodeURIComponent(username)}/HEAD/README.md`
  const res = await fetch(rawUrl, { signal })
  if (res.status === 404) {
    return { status: 'empty', html: '' }
  }
  if (!res.ok) {
    return { status: 'error', html: '' }
  }
  const markdown = await res.text()
  if (!markdown.trim()) {
    return { status: 'empty', html: '' }
  }
  const marked = await loadMarked()
  const html = await marked.parse(markdown, { gfm: true, breaks: false })
  return { status: 'ready', html: String(html) }
}

/**
 * Provide reactive GitHub user identity and live profile README state fetched from GitHub REST API.
 */
export function provideGitHubProfile(username = 'raditted') {
  const cacheKey = `gh_live_profile_v1_${username}`
  const ghUser = ref({ ...FALLBACK_USER })
  const userStatus = ref('fallback')
  const readmeStatus = ref('loading')
  const readmeSource = ref('none')
  const readmeHtml = ref('')
  const errorMessage = ref('')
  const lastSyncedAt = ref(null)

  let activeController = null

  async function refresh({ force = false } = {}) {
    if (!force) {
      const fresh = readCache(cacheKey, FRESH_TTL_MS)
      if (fresh?.user && typeof fresh.readmeHtml === 'string') {
        ghUser.value = fresh.user
        userStatus.value = 'cache'
        readmeHtml.value = fresh.readmeHtml
        readmeStatus.value = fresh.readmeHtml.trim() ? 'ready' : 'empty'
        readmeSource.value = fresh.source || 'cache'
        lastSyncedAt.value = fresh.fetchedAt
        errorMessage.value = ''
        return
      }
    }

    activeController?.abort()
    const controller = new AbortController()
    activeController = controller

    readmeStatus.value = 'loading'
    errorMessage.value = ''

    const userEndpoint = `https://api.github.com/users/${encodeURIComponent(username)}`
    const readmeEndpoint = `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(username)}/readme`

    try {
      const [userRes, readmeRes] = await Promise.all([
        fetch(userEndpoint, {
          signal: controller.signal,
          headers: { Accept: 'application/vnd.github+json' }
        }),
        fetch(readmeEndpoint, {
          signal: controller.signal,
          headers: { Accept: 'application/vnd.github.html+json' }
        })
      ])

      if (controller.signal.aborted) return

      let nextUser = ghUser.value
      if (userRes.ok) {
        const userJson = await userRes.json()
        nextUser = mapGitHubUser(userJson)
        ghUser.value = nextUser
        userStatus.value = 'live'
      } else {
        const stale = readCache(cacheKey, STALE_TTL_MS)
        if (stale?.user) {
          nextUser = stale.user
          ghUser.value = stale.user
          userStatus.value = 'cache'
        }
      }

      if (readmeRes.status === 404) {
        readmeHtml.value = ''
        readmeStatus.value = 'empty'
        readmeSource.value = 'api'
        return
      }

      if (readmeRes.ok) {
        const html = await readmeRes.text()
        if (controller.signal.aborted) return

        const now = Date.now()
        readmeHtml.value = html
        readmeStatus.value = html.trim() ? 'ready' : 'empty'
        readmeSource.value = 'api'
        lastSyncedAt.value = now

        writeCache(cacheKey, {
          fetchedAt: now,
          source: 'api',
          user: nextUser,
          readmeHtml: html
        })
        return
      }

      // If REST API hits unauthenticated rate limit or server error, fetch live raw Markdown fallback.
      const rawFallback = await fetchRawReadmeFallback(username, controller.signal)
      if (controller.signal.aborted) return

      if (rawFallback.status === 'ready') {
        const now = Date.now()
        readmeHtml.value = rawFallback.html
        readmeStatus.value = 'ready'
        readmeSource.value = 'raw'
        lastSyncedAt.value = now

        writeCache(cacheKey, {
          fetchedAt: now,
          source: 'raw',
          user: nextUser,
          readmeHtml: rawFallback.html
        })
        return
      }

      if (rawFallback.status === 'empty') {
        readmeHtml.value = ''
        readmeStatus.value = 'empty'
        readmeSource.value = 'raw'
        return
      }

      // If both REST API and raw fallback fail (e.g. offline), fallback to stale cache.
      const stale = readCache(cacheKey, STALE_TTL_MS)
      if (stale?.readmeHtml?.trim()) {
        ghUser.value = stale.user ?? nextUser
        userStatus.value = 'cache'
        readmeHtml.value = stale.readmeHtml
        readmeStatus.value = 'ready'
        readmeSource.value = 'cache'
        lastSyncedAt.value = stale.fetchedAt
        return
      }

      readmeStatus.value = 'error'
      readmeSource.value = 'none'
      errorMessage.value = describeHttpError(readmeRes.status, readmeRes.headers)
    } catch (err) {
      if (controller.signal.aborted || err?.name === 'AbortError') return

      const stale = readCache(cacheKey, STALE_TTL_MS)
      if (stale?.readmeHtml?.trim()) {
        ghUser.value = stale.user ?? ghUser.value
        userStatus.value = 'cache'
        readmeHtml.value = stale.readmeHtml
        readmeStatus.value = 'ready'
        readmeSource.value = 'cache'
        lastSyncedAt.value = stale.fetchedAt
        return
      }

      readmeStatus.value = 'error'
      readmeSource.value = 'none'
      errorMessage.value = 'Unable to reach GitHub right now. Check your connection and retry.'
    }
  }

  onMounted(() => {
    refresh({ force: false })
  })

  onBeforeUnmount(() => {
    activeController?.abort()
    activeController = null
  })

  const context = {
    username,
    ghUser,
    userStatus,
    readmeStatus,
    readmeSource,
    readmeHtml,
    errorMessage,
    lastSyncedAt,
    refresh
  }

  provide(GITHUB_PROFILE_KEY, context)
  return context
}

/**
 * Consume the shared GitHub profile identity and live README state.
 */
export function useGitHubProfile() {
  const context = inject(GITHUB_PROFILE_KEY, null)
  if (!context) {
    throw new Error('useGitHubProfile() must be used under provideGitHubProfile()')
  }
  return context
}

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useGitHubProfile } from '../../composables/useGitHubProfile'
import { useLenis } from '../../composables/useLenis'
import { profile } from '../../data/portfolio'
import { hydrateGitHubReadmeDom, safeSetHTML } from '../../utils/sanitizeHtml'
import FadeInOnScroll from '../animations/FadeInOnScroll.vue'

const { lenis } = useLenis()
const {
  username,
  ghUser,
  userStatus,
  readmeStatus,
  readmeSource,
  readmeHtml,
  errorMessage,
  lastSyncedAt,
  refresh
} = useGitHubProfile()

const readmeHostRef = ref(null)
const avatarSrcOverride = ref('')
let cleanupDomListeners = null
let renderGeneration = 0

const activeAvatarSrc = computed(() => avatarSrcOverride.value || ghUser.value.avatarUrl)

const blogDisplayHost = computed(() => {
  if (!ghUser.value.blog) return ''
  return ghUser.value.blog.replace(/^https?:\/\//i, '').replace(/\/$/, '')
})

const syncLabel = computed(() => {
  if (readmeStatus.value === 'loading') return 'Syncing with GitHub...'
  if (readmeStatus.value === 'error') return 'API unavailable'
  if (readmeSource.value === 'api') return 'GitHub API'
  if (readmeSource.value === 'raw') return 'GitHub README (API rate-limited)'
  if (readmeSource.value === 'cache' || userStatus.value === 'cache') return 'Cached from GitHub API'
  return 'GitHub snapshot'
})

const formattedSyncTime = computed(() => {
  if (!lastSyncedAt.value) return ''
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(lastSyncedAt.value))
})

function handleAvatarError() {
  if (avatarSrcOverride.value !== profile.avatar.src) {
    avatarSrcOverride.value = profile.avatar.src
  }
}

async function renderReadme() {
  const host = readmeHostRef.value
  const html = readmeHtml.value
  const currentGen = ++renderGeneration

  cleanupDomListeners?.()
  cleanupDomListeners = null

  if (!host || readmeStatus.value !== 'ready' || !html) {
    return
  }

  await safeSetHTML(host, html)
  if (currentGen !== renderGeneration || readmeHostRef.value !== host) return

  cleanupDomListeners = hydrateGitHubReadmeDom(host, {
    owner: username,
    repo: username,
    branch: 'HEAD'
  })

  await nextTick()
  lenis.value?.resize()
}

watch([readmeHtml, readmeStatus, readmeHostRef], () => {
  renderReadme()
})

watch(
  () => ghUser.value.avatarUrl,
  () => {
    avatarSrcOverride.value = ''
  }
)

onBeforeUnmount(() => {
  renderGeneration++
  cleanupDomListeners?.()
  cleanupDomListeners = null
})
</script>

<template>
  <section id="github" class="section-band section-padding">
    <div class="container">
      <FadeInOnScroll>
        <p class="section-eyebrow">03 / github profile</p>
        <h2 class="section-title">GitHub Profile</h2>
        <p class="section-lead">
          Identity fields and the profile README below are fetched from the GitHub REST API for
          <code>@{{ ghUser.login }}</code> and sanitized before rendering.
        </p>
      </FadeInOnScroll>

      <article class="gh-profile-shell" aria-label="GitHub Profile and README">
        <header class="gh-identity-header">
          <div class="gh-identity-main">
            <img
              :src="activeAvatarSrc"
              :alt="`GitHub avatar for ${ghUser.name}`"
              width="64"
              height="64"
              loading="lazy"
              decoding="async"
              referrerpolicy="no-referrer"
              class="gh-avatar"
              @error="handleAvatarError"
            />
            <div class="gh-identity-text">
              <div class="gh-name-row">
                <h3 class="gh-display-name">{{ ghUser.name }}</h3>
                <a
                  :href="ghUser.htmlUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="gh-handle-link"
                >
                  @{{ ghUser.login }}
                </a>
              </div>
              <p v-if="ghUser.bio" class="gh-bio">{{ ghUser.bio }}</p>
              <ul class="gh-meta-list" aria-label="GitHub profile details">
                <li v-if="ghUser.company">{{ ghUser.company }}</li>
                <li v-if="ghUser.location">{{ ghUser.location }}</li>
                <li v-if="ghUser.blog">
                  <a
                    :href="ghUser.blog"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="gh-meta-link"
                  >
                    {{ blogDisplayHost }}
                  </a>
                </li>
                <li>{{ ghUser.publicRepos }} public repos</li>
                <li>{{ ghUser.followers }} followers</li>
                <li>{{ ghUser.following }} following</li>
              </ul>
            </div>
          </div>
        </header>

        <div class="gh-file-bar">
          <span class="gh-file-path">{{ ghUser.login }}/{{ ghUser.login }} · README.md</span>
          <span class="gh-sync-pill" :class="`is-${readmeStatus}`">
            {{ syncLabel }}
            <template v-if="formattedSyncTime && readmeStatus === 'ready'">
              · {{ formattedSyncTime }}
            </template>
          </span>
        </div>

        <div class="gh-readme-stage" :aria-busy="String(readmeStatus === 'loading')">
          <div v-if="readmeStatus === 'loading' && !readmeHtml" class="gh-state-panel" aria-live="polite">
            <progress aria-label="Loading GitHub profile README" class="loading-spinner"></progress>
            <p class="gh-state-title">Loading profile README from GitHub...</p>
            <p class="gh-state-desc">
              Fetching <code>GET /repos/{{ username }}/{{ username }}/readme</code>
            </p>
          </div>

          <div v-else-if="readmeStatus === 'error'" class="gh-state-panel" role="status">
            <p class="gh-state-title">Could not load README from GitHub API</p>
            <p class="gh-state-desc">{{ errorMessage }}</p>
            <button type="button" class="btn-key btn-key--primary gh-retry-btn" @click="refresh({ force: true })">
              Retry Fetch
            </button>
          </div>

          <div v-else-if="readmeStatus === 'empty'" class="gh-state-panel">
            <p class="gh-state-title">Profile README is currently empty</p>
            <p class="gh-state-desc">
              No rendered content was returned for <code>{{ username }}/{{ username }}/README.md</code>.
            </p>
          </div>

          <div
            v-else
            ref="readmeHostRef"
            class="gh-readme-body"
          ></div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
@property --arc-start {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

@property --arc-end {
  syntax: "<angle>";
  inherits: false;
  initial-value: 145deg;
}

.section-lead {
  margin-top: 0.65rem;
  max-width: 62ch;
  color: var(--color-ink-secondary);
}

.section-lead code,
.gh-state-desc code {
  font-family: var(--font-mono);
  font-size: 0.88em;
  padding: 0.12rem 0.4rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: 6px;
}

.gh-profile-shell {
  container-type: inline-size;
  margin-top: 2rem;
  background-color: var(--color-surface);
  border: 1.5px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.gh-identity-header {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.35rem 1.5rem;
  border-bottom: 1px solid var(--color-border-subtle);
}

.gh-identity-main {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.gh-avatar {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border-subtle);
  flex-shrink: 0;
}

.gh-identity-text {
  min-width: 0;
}

.gh-name-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.35rem 0.75rem;
}

.gh-display-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-ink);
}

.gh-handle-link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding-inline: 0.25rem;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-accent);
  text-decoration: none;
}

.gh-handle-link:hover {
  text-decoration: underline;
}

.gh-bio {
  margin-top: 0.25rem;
  color: var(--color-ink-secondary);
  font-size: 0.96rem;
}

.gh-meta-list {
  margin-top: 0.45rem;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 1rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--color-ink-muted);
}

.gh-meta-link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding-inline: 0.25rem;
  color: var(--color-ink-secondary);
  text-decoration: underline;
}

.gh-meta-link:hover {
  color: var(--color-accent);
}

@container (min-width: 640px) {
  .gh-identity-main {
    gap: 1.25rem;
  }

  .gh-avatar {
    width: 72px;
    height: 72px;
  }
}

.gh-file-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  padding: 0.65rem 1.5rem;
  background-color: var(--color-bg-band);
  border-bottom: 1px solid var(--color-border-subtle);
  font-family: var(--font-mono);
  font-size: 0.8rem;
}

.gh-file-path {
  color: var(--color-ink-secondary);
}

.gh-sync-pill {
  color: var(--color-accent);
  font-weight: 500;
}

.gh-sync-pill.is-error {
  color: var(--color-ink);
}

.gh-readme-stage {
  min-height: 360px;
  padding: clamp(1.25rem, 3vw, 2.25rem);
}

.gh-state-panel {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.75rem;
}

.gh-state-title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--color-ink);
}

.gh-state-desc {
  max-width: 48ch;
  font-size: 0.94rem;
  color: var(--color-ink-secondary);
}

/* Native indeterminate <progress> spinner per Modern Web Guidance */
progress.loading-spinner:indeterminate::-webkit-progress-bar {
  display: none;
  background: none;
}
progress.loading-spinner:indeterminate::-webkit-progress-value {
  display: none;
  background: none;
}
progress.loading-spinner:indeterminate::-moz-progress-bar {
  display: none;
  background: none;
}

progress.loading-spinner:indeterminate {
  --_from: calc(90deg + var(--arc-start, 0deg));
  --_to: calc(90deg + var(--arc-end, 158deg));
  --size: 38px;
  --thickness: 3px;
  --spinner-color: var(--color-accent);
  --track-color: var(--color-border-subtle);
  --spinner-duration: 1.4s;
  --_used-spinner-duration: var(--spinner-duration);

  position: relative;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  appearance: none;
  background: conic-gradient(
      from var(--_from),
      var(--spinner-color) calc(var(--_to) - var(--_from)),
      transparent 0
    )
    var(--track-color);

  @supports (background-clip: border-area) {
    background-clip: border-area;
    border: var(--thickness) solid transparent;
    background-origin: border-box;
  }

  @supports not (background-clip: border-area) {
    --clip-boundary: calc(100% - var(--thickness));
    mask-image: radial-gradient(
      farthest-side,
      transparent var(--clip-boundary),
      black var(--clip-boundary)
    );
    border: 0;
  }

  @media (forced-colors: active) {
    forced-color-adjust: none;
    --spinner-color: CanvasText;
    --track-color: Canvas;
  }

  animation:
    progress-spin var(--_used-spinner-duration) linear infinite,
    progress-dash 2.6s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  progress.loading-spinner:indeterminate {
    --_used-spinner-duration: 6s;
    --arc-start: 0deg;
    --arc-end: 158deg;
    animation: progress-spin var(--_used-spinner-duration) linear infinite;
  }
}

@keyframes progress-spin {
  to {
    rotate: 1turn;
  }
}

@keyframes progress-dash {
  from {
    --arc-start: 0deg;
    --arc-end: 3deg;
  }
  50% {
    --arc-start: 100deg;
    --arc-end: 358deg;
  }
  to {
    --arc-start: 360deg;
    --arc-end: 363deg;
  }
}

/* Sanitized GitHub README content styling */
.gh-readme-body {
  color: var(--color-ink);
  font-size: 0.98rem;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.gh-readme-body :deep(h1),
.gh-readme-body :deep(h2),
.gh-readme-body :deep(h3),
.gh-readme-body :deep(h4) {
  font-family: var(--font-display);
  color: var(--color-ink);
  line-height: 1.25;
  margin-top: 1.35rem;
  margin-bottom: 0.65rem;
}

.gh-readme-body :deep(.markdown-heading:first-child h1),
.gh-readme-body :deep(.markdown-heading:first-child h2),
.gh-readme-body :deep(.markdown-heading:first-child h3),
.gh-readme-body :deep(h1:first-child),
.gh-readme-body :deep(h2:first-child),
.gh-readme-body :deep(h3:first-child) {
  margin-top: 0;
}

.gh-readme-body :deep(h3) {
  font-size: 1.22rem;
}

.gh-readme-body :deep(p) {
  margin-bottom: 0.85rem;
  color: var(--color-ink-secondary);
}

.gh-readme-body :deep(ul),
.gh-readme-body :deep(ol) {
  margin-block: 0.65rem 1.1rem;
  padding-left: 1.4rem;
  color: var(--color-ink-secondary);
}

.gh-readme-body :deep(li + li) {
  margin-top: 0.35rem;
}

.gh-readme-body :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.86em;
  padding: 0.14rem 0.42rem;
  background-color: var(--color-bg-band);
  color: var(--color-ink);
  border: 1px solid var(--color-border-subtle);
  border-radius: 6px;
}

.gh-readme-body :deep(pre) {
  margin-block: 1rem;
  padding: 1rem;
  background-color: var(--color-bg-band);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  overflow-x: auto;
}

.gh-readme-body :deep(pre code) {
  padding: 0;
  border: 0;
  background: transparent;
}

.gh-readme-body :deep(blockquote) {
  margin-block: 1rem;
  padding-left: 1rem;
  border-left: 3px solid var(--color-accent);
  color: var(--color-ink-secondary);
}

.gh-readme-body :deep(a) {
  display: inline-block;
  max-width: 100%;
  border-radius: 6px;
}

.gh-readme-body :deep(a:has(h1, h2, h3, h4, ul, div)),
.gh-readme-body :deep(a:has(> img.gh-readme-fullwidth)) {
  display: block;
  width: 100%;
  text-decoration: none;
  color: inherit;
}

.gh-readme-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-sm);
}

.gh-readme-body :deep(img.gh-readme-fullwidth) {
  width: 100%;
}

.gh-readme-body :deep(img.gh-readme-divider) {
  width: 100%;
  height: 3px;
  object-fit: cover;
  margin-block: 0.9rem;
  border-radius: 999px;
}

.gh-readme-body :deep(div[align="center"]) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 0.9rem;
}

.gh-readme-body :deep(div[align="left"]:has(> a > img):not(:has(> h1, > h2, > h3, > p, > ul))) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem;
  margin-block: 0.65rem 1rem;
}

.gh-readme-body :deep(.gh-readme-img-fallback) {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.7rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--color-ink-secondary);
  background-color: var(--color-bg-band);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-sm);
}
</style>

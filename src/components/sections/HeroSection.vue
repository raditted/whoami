<script setup>
import { computed } from 'vue'
import { useGitHubProfile } from '../../composables/useGitHubProfile'
import { useLenis } from '../../composables/useLenis'
import { profile } from '../../data/portfolio'
import DecryptedText from '../ui/DecryptedText.vue'
import TextType from '../ui/TextType.vue'

const { scrollTo } = useLenis()
const { ghUser, userStatus, readmeStatus } = useGitHubProfile()

const apiStatusText = computed(() => {
  if (readmeStatus.value === 'loading') return 'Syncing'
  if (userStatus.value === 'live') return 'GitHub API'
  if (userStatus.value === 'cache') return 'Cached'
  return 'Snapshot'
})

const greetings = [
  'Hey',
  'Halo',
  'こんにちは',
  '你好',
  '안녕하세요',
  'Hola',
  'Bonjour',
  'Hallo'
]

const profileJson = computed(() =>
  JSON.stringify(
    {
      login: ghUser.value.login,
      name: ghUser.value.name,
      location: ghUser.value.location,
      company: ghUser.value.company,
      blog: ghUser.value.blog,
      bio: ghUser.value.bio,
      public_repos: ghUser.value.publicRepos,
      followers: ghUser.value.followers,
      following: ghUser.value.following
    },
    null,
    2
  )
)
</script>

<template>
  <section id="home" class="hero-section">
    <div class="container hero-grid">
      <div class="hero-content">
        <p class="hero-location">{{ ghUser.location || profile.location }} · {{ profile.role }}</p>
        <h1 class="hero-title" aria-label="Hey, I'm Radithya.">
          <span class="hero-greeting-line">
            <TextType
              :text="greetings"
              :typing-speed="90"
              :deleting-speed="50"
              :pause-duration="3800"
              :show-cursor="true"
              cursor-character="|"
              class="hero-typed-greeting"
            />
          </span>
          <span class="hero-name-line">
            I'm
            <DecryptedText
              text="Radithya"
              :speed="45"
              :max-iterations="12"
              :sequential="true"
              reveal-direction="start"
              animate-on="inViewHover"
              class="hero-decrypted-name"
              encrypted-class-name="hero-cipher-char"
            />.
          </span>
        </h1>
        <p class="hero-fullname">{{ profile.name }}</p>
        <p class="hero-summary">{{ profile.summary }}</p>

        <div class="hero-actions">
          <a
            href="#projects"
            class="btn-key btn-key--primary"
            @click.prevent="scrollTo('#projects')"
          >
            View Projects
          </a>
          <a
            href="#contact"
            class="btn-key"
            @click.prevent="scrollTo('#contact')"
          >
            Say Hello
          </a>
        </div>
      </div>

      <aside class="hero-card" aria-label="Developer profile summary">
        <div class="portrait-row">
          <img
            :src="profile.avatar.src"
            :alt="profile.avatar.alt"
            :width="profile.avatar.width"
            :height="profile.avatar.height"
            fetchpriority="high"
            class="portrait-img"
          />
          <div class="portrait-meta">
            <div class="handle-status-row">
              <a
                :href="ghUser.htmlUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="card-handle"
              >
                @{{ ghUser.login }}
              </a>
              <span class="card-source-tag">{{ apiStatusText }}</span>
            </div>
            <p class="card-school">{{ ghUser.company }}</p>
          </div>
        </div>

        <div class="json-wrap">
          <p class="json-label">GET https://api.github.com/users/{{ ghUser.login }}</p>
          <pre class="json-code"><code>{{ profileJson }}</code></pre>
        </div>

        <div class="hero-card-footer">
          <a
            href="#github"
            class="action-link-row readme-jump-link"
            @click.prevent="scrollTo('#github')"
          >
            <span>View Profile README</span>
            <svg
              aria-hidden="true"
              class="action-arrow"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  padding-block: clamp(2.75rem, 7vw, 5.5rem) clamp(3.25rem, 7vw, 5.5rem);
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.25rem;
  align-items: center;
}

.hero-location {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: var(--color-accent);
  margin-bottom: 0.65rem;
}

.hero-title {
  font-size: clamp(2.25rem, 5.4vw, 3.75rem);
  font-weight: 700;
  line-height: 1.1;
  color: var(--color-ink);
}

.hero-greeting-line {
  display: block;
  min-height: 1.18em;
  color: var(--color-ink);
}

.hero-name-line {
  display: block;
  margin-top: 0.15rem;
  color: var(--color-ink);
}

.hero-decrypted-name {
  color: var(--color-ink);
  font-family: inherit;
  font-weight: inherit;
}

:deep(.hero-cipher-char) {
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-weight: 700;
}

.hero-fullname {
  margin-top: 0.4rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-ink-muted);
}

.hero-summary {
  margin-top: 1rem;
  max-width: 52ch;
  font-size: clamp(1.02rem, 1.8vw, 1.15rem);
  color: var(--color-ink-secondary);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.75rem;
}

.hero-card {
  background-color: var(--color-surface);
  border: 1.5px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: 1.35rem;
}

.portrait-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border-subtle);
}

.portrait-img {
  width: 72px;
  height: 74px;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border-subtle);
  flex-shrink: 0;
}

.portrait-meta {
  min-width: 0;
  flex: 1;
}

.handle-status-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem 0.6rem;
}

.card-handle {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-family: var(--font-mono);
  font-weight: 500;
  color: var(--color-ink);
  text-decoration: none;
}

.card-handle:hover {
  color: var(--color-accent);
  text-decoration: underline;
}

.card-source-tag {
  font-family: var(--font-mono);
  font-size: 0.74rem;
  font-weight: 500;
  color: var(--color-accent);
  padding: 0.14rem 0.5rem;
  background-color: var(--color-bg-band);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
}

.card-school {
  font-size: 0.92rem;
  color: var(--color-ink-secondary);
}

.json-wrap {
  margin-top: 1rem;
}

.json-label {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--color-ink-muted);
  margin-bottom: 0.45rem;
  overflow-wrap: anywhere;
}

.json-code {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--color-ink-secondary);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.hero-card-footer {
  margin-top: 1rem;
  padding-top: 0.65rem;
  border-top: 1px solid var(--color-border-subtle);
}

@media (min-width: 900px) {
  .hero-section {
    min-height: calc(100dvh - var(--header-height));
    display: flex;
    align-items: center;
  }

  .hero-grid {
    grid-template-columns: 1.15fr 0.85fr;
    gap: 3rem;
  }
}
</style>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useLenis } from '../../composables/useLenis'
import { useTheme } from '../../composables/useTheme'
import { useFractalControl } from '../../composables/useFractal'
import { useGitHubProfile } from '../../composables/useGitHubProfile'
import { navLinks } from '../../data/portfolio'

const { activeSection, scrollProgress, scrollTo } = useLenis()
const { resolvedTheme, toggleTheme } = useTheme()
const { isPaused, togglePause } = useFractalControl()
const { ghUser } = useGitHubProfile()

const supportsScrollTimeline =
  typeof CSS !== 'undefined' && CSS.supports?.('animation-timeline', 'scroll()')

const progressFallbackStyle = computed(() =>
  supportsScrollTimeline ? undefined : { transform: `scaleX(${scrollProgress.value})` }
)

const isMenuOpen = ref(false)
const headerRef = ref(null)
const menuButtonRef = ref(null)

function navigateTo(href) {
  isMenuOpen.value = false
  scrollTo(href)
  if (window.location.hash !== href) {
    history.replaceState(null, '', href)
  }
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu(restoreFocus = false) {
  if (!isMenuOpen.value) return
  isMenuOpen.value = false
  if (restoreFocus) {
    menuButtonRef.value?.focus()
  }
}

function onKeydown(event) {
  if (event.key === 'Escape' && isMenuOpen.value) {
    closeMenu(true)
  }
}

function onPointerDown(event) {
  if (!isMenuOpen.value) return
  if (headerRef.value && !headerRef.value.contains(event.target)) {
    closeMenu(false)
  }
}

function onResize() {
  if (window.innerWidth >= 768 && isMenuOpen.value) {
    isMenuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('pointerdown', onPointerDown)
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <header ref="headerRef" class="site-header">
    <div
      class="scroll-progress"
      aria-hidden="true"
      :style="progressFallbackStyle"
    ></div>
    <div class="container header-inner">
      <a href="#home" class="brand-link" @click.prevent="navigateTo('#home')">
        <span class="brand-brace" aria-hidden="true">{&nbsp;</span>
        <span>{{ ghUser.login }}</span>
        <span class="brand-brace" aria-hidden="true">&nbsp;}</span>
      </a>

      <nav class="desktop-nav" aria-label="Primary">
        <ul>
          <li v-for="item in navLinks" :key="item.id">
            <a
              :href="item.href"
              :aria-current="activeSection === item.id ? 'location' : undefined"
              @click.prevent="navigateTo(item.href)"
            >
              {{ item.label }}
            </a>
          </li>
        </ul>
      </nav>

      <div class="header-actions">
        <button
          type="button"
          class="icon-toggle-btn"
          :aria-label="isPaused ? 'Play background fractal' : 'Pause background fractal'"
          :title="isPaused ? 'Play background fractal' : 'Pause background fractal'"
          :aria-pressed="String(isPaused)"
          @click="togglePause"
        >
          <svg
            v-if="isPaused"
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polygon points="6 3 20 12 6 21 6 3" />
          </svg>
          <svg
            v-else
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        </button>

        <button
          type="button"
          class="icon-toggle-btn"
          :aria-label="resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
          :title="resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
          @click="toggleTheme"
        >
          <svg
            v-if="resolvedTheme === 'dark'"
            aria-hidden="true"
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
          <svg
            v-else
            aria-hidden="true"
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        </button>

        <button
          ref="menuButtonRef"
          type="button"
          class="icon-toggle-btn menu-toggle"
          aria-controls="mobile-nav-drawer"
          :aria-expanded="String(isMenuOpen)"
          :aria-label="isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'"
          :title="isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'"
          @click="toggleMenu"
        >
          <svg
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <template v-if="isMenuOpen">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </template>
            <template v-else>
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </template>
          </svg>
        </button>
      </div>
    </div>

    <nav
      v-if="isMenuOpen"
      id="mobile-nav-drawer"
      class="mobile-nav"
      aria-label="Mobile"
    >
      <ul class="container">
        <li v-for="item in navLinks" :key="item.id">
          <a
            :href="item.href"
            :aria-current="activeSection === item.id ? 'location' : undefined"
            @click.prevent="navigateTo(item.href)"
          >
            {{ item.label }}
          </a>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--color-header-bg);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--color-border-subtle);
}

.scroll-progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background-color: var(--color-accent);
  transform-origin: 0 50%;
  transform: scaleX(0);
  pointer-events: none;
}

@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: scroll()) {
    @keyframes grow-scroll-progress {
      from {
        transform: scaleX(0);
      }
      to {
        transform: scaleX(1);
      }
    }

    .scroll-progress {
      animation: grow-scroll-progress auto linear;
      animation-timeline: scroll(root block);
    }
  }
}

.header-inner {
  min-height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding-inline: 0.25rem;
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: 1rem;
  color: var(--color-ink);
  text-decoration: none;
  white-space: nowrap;
}

.brand-brace {
  color: var(--color-accent);
  font-weight: 700;
}

.desktop-nav {
  display: none;
}

.desktop-nav ul {
  list-style: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.desktop-nav a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding-inline: 0.85rem;
  color: var(--color-ink-secondary);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  border-bottom: 2px solid transparent;
  transition: border-color 0.15s ease;
}

.desktop-nav a:hover {
  color: var(--color-ink);
}

.desktop-nav a[aria-current="location"] {
  color: var(--color-ink);
  font-weight: 600;
  border-bottom-color: var(--color-accent);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.icon-toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  inline-size: 44px;
  block-size: 44px;
  padding: 0;
  background: transparent;
  color: var(--color-ink-secondary);
  border: 1px solid transparent;
  border-radius: 50%;
}

@media (prefers-reduced-motion: no-preference) {
  .icon-toggle-btn {
    transition: background-color 140ms ease, color 140ms ease, transform 110ms ease-out;
  }
}

@media (hover: hover) {
  .icon-toggle-btn:hover {
    background-color: var(--color-bg-band);
    color: var(--color-accent);
  }
}

.icon-toggle-btn[aria-pressed="true"] {
  background-color: var(--color-bg-band);
  color: var(--color-accent);
}

.icon-toggle-btn:active {
  transform: scale(0.92);
}

@media (forced-colors: active) {
  .icon-toggle-btn {
    border-color: ButtonText;
  }

  .icon-toggle-btn[aria-pressed="true"] {
    background-color: Highlight;
    color: HighlightText;
    border-color: Highlight;
  }
}

.mobile-nav {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-overlay);
  padding-block: 0.75rem;
}

.mobile-nav ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mobile-nav a {
  display: flex;
  align-items: center;
  min-height: 44px;
  padding: 0.5rem 0.75rem;
  color: var(--color-ink);
  text-decoration: none;
  font-weight: 500;
  border-left: 3px solid transparent;
  border-radius: var(--radius-sm);
}

.mobile-nav a:hover {
  background-color: var(--color-bg-band);
}

.mobile-nav a[aria-current="location"] {
  border-left-color: var(--color-accent);
  background-color: var(--color-bg-band);
  font-weight: 600;
}

@media (min-width: 768px) {
  .desktop-nav {
    display: block;
  }

  .menu-toggle {
    display: none;
  }

  .mobile-nav {
    display: none;
  }
}
</style>

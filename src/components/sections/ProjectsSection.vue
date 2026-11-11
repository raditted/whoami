<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useLenis, useLenisScroll } from '../../composables/useLenis'
import FadeInOnScroll from '../animations/FadeInOnScroll.vue'
import ProjectCard from '../ui/ProjectCard.vue'
import { archiveProjects, featuredProjects, projectCategories } from '../../data/portfolio'

const HEADER_CLEARANCE = 68

const { lenis, scrollTo } = useLenis()

const selectedCategory = ref('all')
const searchQuery = ref('')

const runwayRef = ref(null)
const stageRef = ref(null)
const viewportRef = ref(null)
const trackRef = ref(null)

const isDesktopViewport = ref(false)
const prefersReducedMotion = ref(false)
const runwayHeightPx = ref(null)
const maxTranslatePx = ref(0)
const translateXPx = ref(0)
const horizontalProgress = ref(0)
const activeCardIndex = ref(0)

let resizeObserver = null
let desktopMediaQuery = null
let reducedMotionQuery = null

const allProjects = computed(() => [...featuredProjects, ...archiveProjects])

function matchesFilter(project) {
  const categoryOk =
    selectedCategory.value === 'all' ||
    (Array.isArray(project.category)
      ? project.category.includes(selectedCategory.value)
      : project.category === selectedCategory.value)
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return categoryOk
  const haystack = [project.title, project.context, project.description, ...project.stack]
    .join(' ')
    .toLowerCase()
  return categoryOk && haystack.includes(q)
}

const filteredProjects = computed(() => allProjects.value.filter(matchesFilter))

const INITIAL_PROJECT_LIMIT = 6
const showAllProjects = ref(false)

const hasMoreProjects = computed(() => filteredProjects.value.length > INITIAL_PROJECT_LIMIT)
const remainingProjectsCount = computed(() =>
  Math.max(0, filteredProjects.value.length - INITIAL_PROJECT_LIMIT)
)

const displayedProjects = computed(() => {
  if (showAllProjects.value || !hasMoreProjects.value) {
    return filteredProjects.value
  }
  return filteredProjects.value.slice(0, INITIAL_PROJECT_LIMIT)
})

const totalMatches = computed(() => {
  return displayedProjects.value.length + (hasMoreProjects.value && !showAllProjects.value ? 1 : 0)
})

const activeCategoryLabel = computed(
  () => projectCategories.find((c) => c.id === selectedCategory.value)?.label ?? 'All'
)

const isHorizontalMode = computed(
  () => isDesktopViewport.value && !prefersReducedMotion.value && totalMatches.value > 1
)

function padIndex(i) {
  return String(i + 1).padStart(2, '0')
}

function resetFilters() {
  selectedCategory.value = 'all'
  searchQuery.value = ''
  showAllProjects.value = false
}

watch(selectedCategory, () => {
  showAllProjects.value = false
})

watch(searchQuery, (q) => {
  if (q.trim()) {
    showAllProjects.value = true
  }
})

function updateHorizontalScroll() {
  if (!isHorizontalMode.value || !runwayRef.value || !stageRef.value) {
    translateXPx.value = 0
    horizontalProgress.value = 0
    activeCardIndex.value = 0
    return
  }

  const runwayRect = runwayRef.value.getBoundingClientRect()
  const scrollableDistance = Math.max(1, runwayRef.value.offsetHeight - stageRef.value.offsetHeight)
  const traveled = HEADER_CLEARANCE - runwayRect.top
  const progress = Math.min(1, Math.max(0, traveled / scrollableDistance))

  horizontalProgress.value = progress
  translateXPx.value = progress * maxTranslatePx.value
  if (totalMatches.value > 1) {
    activeCardIndex.value = Math.min(
      totalMatches.value - 1,
      Math.round(progress * (totalMatches.value - 1))
    )
  } else {
    activeCardIndex.value = 0
  }
}

async function measureTrack() {
  await nextTick()

  if (!isHorizontalMode.value || !trackRef.value || !viewportRef.value || !stageRef.value) {
    maxTranslatePx.value = 0
    runwayHeightPx.value = null
    translateXPx.value = 0
    horizontalProgress.value = 0
    lenis.value?.resize()
    return
  }

  const vpStyle = getComputedStyle(viewportRef.value)
  const padLeft = Number.parseFloat(vpStyle.paddingLeft) || 0
  const padRight = Number.parseFloat(vpStyle.paddingRight) || 0
  const contentWidth = Math.max(1, viewportRef.value.clientWidth - padLeft - padRight)
  const overflow = Math.max(0, trackRef.value.scrollWidth - contentWidth)
  maxTranslatePx.value = overflow
  runwayHeightPx.value = overflow > 0 ? stageRef.value.offsetHeight + overflow : null
  await nextTick()
  updateHorizontalScroll()
  lenis.value?.resize()
}

function goToCard(index) {
  const clamped = Math.max(0, Math.min(totalMatches.value - 1, index))
  if (!isHorizontalMode.value || !runwayRef.value || !stageRef.value || totalMatches.value <= 1) {
    return
  }

  const scrollableDistance = Math.max(1, runwayRef.value.offsetHeight - stageRef.value.offsetHeight)
  const targetProgress = clamped / (totalMatches.value - 1)
  const runwayTop = runwayRef.value.getBoundingClientRect().top + window.scrollY
  const targetScrollY = runwayTop - HEADER_CLEARANCE + targetProgress * scrollableDistance

  scrollTo(targetScrollY, { offset: 0, duration: 0.7 })
}

function handleCardFocusIn(event, index) {
  if (!isHorizontalMode.value || !viewportRef.value) return
  const cardEl = event.currentTarget
  if (!(cardEl instanceof HTMLElement)) return
  const vpRect = viewportRef.value.getBoundingClientRect()
  const cardRect = cardEl.getBoundingClientRect()
  if (cardRect.left < vpRect.left || cardRect.right > vpRect.right) {
    goToCard(index)
  }
}

function syncMediaQueries() {
  isDesktopViewport.value = desktopMediaQuery?.matches ?? false
  prefersReducedMotion.value = reducedMotionQuery?.matches ?? false
  measureTrack()
}

useLenisScroll(updateHorizontalScroll)

watch([displayedProjects, isHorizontalMode, showAllProjects], () => {
  measureTrack()
})

onMounted(() => {
  desktopMediaQuery = window.matchMedia('(min-width: 960px) and (min-height: 600px)')
  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  syncMediaQueries()

  desktopMediaQuery.addEventListener('change', syncMediaQueries)
  reducedMotionQuery.addEventListener('change', syncMediaQueries)

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      measureTrack()
    })
    if (viewportRef.value) resizeObserver.observe(viewportRef.value)
    if (trackRef.value) resizeObserver.observe(trackRef.value)
  }
})

onBeforeUnmount(() => {
  desktopMediaQuery?.removeEventListener('change', syncMediaQueries)
  reducedMotionQuery?.removeEventListener('change', syncMediaQueries)
  resizeObserver?.disconnect()
})
</script>

<template>
  <section id="projects" class="projects-section">
    <div class="container projects-intro">
      <FadeInOnScroll>
        <div class="projects-header">
          <div>
            <p class="section-eyebrow">04 / projects</p>
            <h2 class="section-title">Selected Projects</h2>
          </div>

          <div class="header-count-meta">
            <p class="projects-count" aria-live="polite">
              Showing {{ displayedProjects.length }} of {{ filteredProjects.length }} repositories
            </p>
            <button
              v-if="hasMoreProjects"
              type="button"
              class="btn-key more-toggle-btn"
              :aria-expanded="String(showAllProjects)"
              @click="showAllProjects = !showAllProjects"
            >
              <span>{{ showAllProjects ? 'Show top 6' : `More (+${remainingProjectsCount})` }}</span>
            </button>
          </div>
        </div>

        <div class="controls-bar">
          <div class="category-group" role="group" aria-label="Filter projects by category">
            <button
              v-for="cat in projectCategories"
              :key="cat.id"
              type="button"
              class="filter-btn"
              :aria-pressed="String(selectedCategory === cat.id)"
              @click="selectedCategory = cat.id"
            >
              {{ cat.label }}
            </button>
          </div>

          <div class="search-field">
            <label for="project-search" class="search-label">Search</label>
            <input
              id="project-search"
              v-model="searchQuery"
              type="search"
              placeholder="Title or stack..."
              class="search-input"
            />
          </div>
        </div>
      </FadeInOnScroll>
    </div>

    <div v-if="totalMatches === 0" class="container empty-wrap">
      <div class="empty-state" role="status">
        <p class="empty-title">No projects matched your current filter.</p>
        <p class="empty-detail">
          No entries found in "{{ activeCategoryLabel }}"
          <template v-if="searchQuery.trim()"> matching "{{ searchQuery.trim() }}"</template>.
        </p>
        <button type="button" class="btn-key btn-key--primary reset-btn" @click="resetFilters">
          Reset filters
        </button>
      </div>
    </div>

    <div
      v-else
      ref="runwayRef"
      class="showcase-runway"
      :class="{ 'is-horizontal': isHorizontalMode }"
      :style="runwayHeightPx ? { height: `${runwayHeightPx}px` } : undefined"
    >
      <div ref="stageRef" class="showcase-stage">
        <div v-if="isHorizontalMode" class="container stage-toolbar">
          <div class="stage-meta">
            <span class="stage-counter">
              {{ padIndex(activeCardIndex) }} / {{ padIndex(totalMatches - 1) }}
            </span>
            <div class="stage-progress-track" aria-hidden="true">
              <div
                class="stage-progress-fill"
                :style="{ transform: `scaleX(${horizontalProgress})` }"
              ></div>
            </div>
          </div>

          <div class="stage-step-controls">
            <button
              type="button"
              class="btn-key btn-key--compact step-btn"
              aria-label="Previous project card"
              :disabled="activeCardIndex <= 0"
              @click="goToCard(activeCardIndex - 1)"
            >
              Prev
            </button>
            <button
              type="button"
              class="btn-key btn-key--compact step-btn"
              aria-label="Next project card"
              :disabled="activeCardIndex >= totalMatches - 1"
              @click="goToCard(activeCardIndex + 1)"
            >
              Next
            </button>
          </div>
        </div>

        <div ref="viewportRef" class="cards-viewport">
          <div
            ref="trackRef"
            class="cards-track"
            :style="
              isHorizontalMode
                ? { transform: `translate3d(${-translateXPx}px, 0, 0)` }
                : undefined
            "
          >
            <div
              v-for="(project, index) in displayedProjects"
              :key="project.id"
              class="track-item"
              @focusin="handleCardFocusIn($event, index)"
            >
              <ProjectCard
                :project="project"
                :index-label="padIndex(index)"
                :is-active="isHorizontalMode && activeCardIndex === index"
              />
            </div>

            <div
              v-if="hasMoreProjects && !showAllProjects"
              class="track-item more-card-item"
            >
              <article class="project-card more-card">
                <div class="more-card-inner">
                  <span class="more-badge">+{{ remainingProjectsCount }}</span>
                  <h3 class="more-title">More Repositories</h3>
                  <button
                    type="button"
                    class="btn-key btn-key--primary more-expand-btn"
                    @click="showAllProjects = true"
                  >
                    <span>Open All ({{ filteredProjects.length }})</span>
                    <svg
                      aria-hidden="true"
                      width="15"
                      height="15"
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
                  </button>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.projects-section {
  padding-top: clamp(3.5rem, 6vw, 5.5rem);
  padding-bottom: clamp(3.5rem, 6vw, 5.5rem);
}

.projects-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.projects-count {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--color-ink-muted);
}

.controls-bar {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.category-group {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  padding: 0.25rem;
  background-color: var(--color-bg-band);
  border: 1.5px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
}

.filter-btn {
  min-height: 44px;
  padding: 0.4rem 0.9rem;
  background: transparent;
  color: var(--color-ink-secondary);
  border: 1.5px solid transparent;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.84rem;
  font-weight: 500;
}

@media (prefers-reduced-motion: no-preference) {
  .filter-btn {
    transition: background-color 140ms ease, color 140ms ease, border-color 140ms ease;
  }
}

@media (hover: hover) {
  .filter-btn:hover:not([aria-pressed="true"]) {
    background-color: var(--color-surface);
    color: var(--color-ink);
  }
}

.filter-btn[aria-pressed="true"] {
  background-color: var(--color-accent-bg);
  color: var(--color-accent-ink);
  border-color: var(--btn-border-primary);
  font-weight: 600;
  box-shadow: 0 2px 0 var(--btn-ledge-primary);
}

@media (forced-colors: active) {
  .filter-btn[aria-pressed="true"] {
    background-color: Highlight;
    color: HighlightText;
    border-color: Highlight;
    box-shadow: none;
  }
}

.search-field {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
}

.search-label {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--color-ink-secondary);
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  min-height: 44px;
  padding: 0.5rem 0.85rem;
  background-color: var(--color-surface);
  color: var(--color-ink);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.95rem;
}

.search-input::placeholder {
  color: var(--color-ink-muted);
}

.empty-wrap {
  margin-top: 2rem;
}

.empty-state {
  padding: 2rem 1.5rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  text-align: center;
}

.empty-title {
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--color-ink);
}

.empty-detail {
  margin-top: 0.35rem;
  color: var(--color-ink-secondary);
}

.reset-btn {
  margin-top: 1.15rem;
}

/* Mobile and reduced-motion default: clean stacked grid */
.showcase-runway {
  margin-top: 2rem;
}

.cards-viewport {
  width: min(100% - 2rem, var(--container-max));
  margin-inline: auto;
}

.cards-track {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .cards-viewport {
    width: min(100% - 3rem, var(--container-max));
  }

  .cards-track {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 1.5rem;
  }
}

@media (min-width: 768px) {
  .projects-header {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }

  .controls-bar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .search-field {
    max-width: 340px;
  }
}

/* Desktop sticky horizontal Lenis showcase */
.showcase-runway.is-horizontal {
  position: relative;
  margin-top: 1.5rem;
}

.showcase-runway.is-horizontal .showcase-stage {
  position: sticky;
  top: var(--header-height);
  height: calc(100dvh - var(--header-height));
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.25rem;
  overflow: hidden;
  padding-block: 1rem;
}

.stage-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.stage-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  max-width: 320px;
}

.stage-counter {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--color-ink);
  white-space: nowrap;
}

.stage-progress-track {
  flex: 1;
  height: 2px;
  background-color: var(--color-border-subtle);
  overflow: hidden;
}

.stage-progress-fill {
  width: 100%;
  height: 100%;
  background-color: var(--color-accent);
  transform-origin: 0 50%;
  transform: scaleX(0);
}

.stage-step-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.step-btn {
  min-width: 64px;
}

.header-count-meta {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.more-toggle-btn {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  padding: 0.35rem 0.85rem;
  min-height: 36px;
}

.more-card-item {
  display: flex;
}

.more-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 2.5rem 2rem;
  background-color: var(--color-surface);
  border: 1.5px dashed var(--color-border);
  border-radius: var(--radius-lg);
  text-align: center;
  box-sizing: border-box;
}

.more-card-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  max-width: 320px;
}

.more-badge {
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-accent);
  background-color: var(--color-bg-band);
  padding: 0.4rem 1.15rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-subtle);
}

.more-title {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-ink);
}

.more-expand-btn {
  margin-top: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.showcase-runway.is-horizontal .cards-viewport {
  width: 100%;
  margin-inline: 0;
  overflow: hidden;
  padding-inline: max(1.5rem, calc((100vw - var(--container-max)) / 2));
}

.showcase-runway.is-horizontal .cards-track {
  display: flex;
  gap: 1.5rem;
  width: max-content;
  will-change: transform;
}

.showcase-runway.is-horizontal .track-item {
  flex: 0 0 clamp(400px, 38vw, 520px);
}
</style>

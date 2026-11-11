<script setup>
import { onMounted, ref } from 'vue'
import { useLenis, useLenisScroll } from '../../composables/useLenis'
import { aboutCopy, aboutPillars, techGroups } from '../../data/portfolio'
import FadeInOnScroll from '../animations/FadeInOnScroll.vue'

const { scrollTo } = useLenis()
const pillarRefs = ref([])
const activePillar = ref(0)

function syncActivePillar() {
  const focusY = window.innerHeight * 0.42
  let closestIdx = 0
  let minDist = Number.POSITIVE_INFINITY

  pillarRefs.value.forEach((el, idx) => {
    if (!el) return
    const rect = el.getBoundingClientRect()
    const center = rect.top + rect.height * 0.5
    const dist = Math.abs(center - focusY)
    if (dist < minDist) {
      minDist = dist
      closestIdx = idx
    }
  })

  activePillar.value = closestIdx
}

function jumpToPillar(index) {
  const el = pillarRefs.value[index]
  if (el) {
    scrollTo(el, { offset: -120 })
  }
}

let isPillarTicking = false
function handleScroll() {
  if (!isPillarTicking) {
    isPillarTicking = true
    requestAnimationFrame(() => {
      syncActivePillar()
      isPillarTicking = false
    })
  }
}

useLenisScroll(handleScroll)

onMounted(() => {
  syncActivePillar()
})
</script>

<template>
  <section id="about" class="section-band section-padding">
    <div class="container about-story-grid">
      <div class="about-sticky-col">
        <p class="section-eyebrow">01 / about</p>
        <h2 class="section-title">About Me</h2>

        <p v-for="(paragraph, idx) in aboutCopy" :key="idx" class="bio-paragraph">
          {{ paragraph }}
        </p>

        <nav class="pillar-index" aria-label="Engineering focus areas">
          <button
            v-for="(pillar, idx) in aboutPillars"
            :key="pillar.index"
            type="button"
            class="pillar-step"
            :class="{ 'is-active': activePillar === idx }"
            @click="jumpToPillar(idx)"
          >
            <span class="step-num">{{ pillar.index }}</span>
            <span class="step-title">{{ pillar.title }}</span>
          </button>
        </nav>
      </div>

      <div class="about-narrative-col">
        <div class="pillars-stack">
          <article
            v-for="(pillar, idx) in aboutPillars"
            :key="pillar.index"
            :ref="(el) => (pillarRefs[idx] = el)"
            class="pillar-block"
            :class="{ 'is-active': activePillar === idx }"
          >
            <FadeInOnScroll>
              <p class="pillar-num">{{ pillar.index }}</p>
              <h3 class="pillar-heading">{{ pillar.title }}</h3>
              <p class="pillar-desc">{{ pillar.description }}</p>
            </FadeInOnScroll>
          </article>
        </div>

        <FadeInOnScroll>
          <div class="stack-panel">
            <h3 class="stack-heading">Tools &amp; Tech Stack</h3>
            <div class="stack-groups">
              <div v-for="group in techGroups" :key="group.label" class="stack-group">
                <h4 class="group-title">{{ group.label }}</h4>
                <ul class="group-list">
                  <li v-for="item in group.items" :key="item.name" class="stack-chip">
                    <span class="chip-icon-wrap" aria-hidden="true">
                      <img
                        :src="item.icon"
                        alt=""
                        width="20"
                        height="20"
                        loading="lazy"
                        class="chip-icon"
                      />
                    </span>
                    <span>{{ item.name }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </FadeInOnScroll>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-story-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
}

.bio-paragraph {
  margin-top: 1rem;
  color: var(--color-ink-secondary);
  max-width: 52ch;
}

.pillar-index {
  display: none;
}

.about-narrative-col {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.pillars-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.pillar-block {
  padding: 1.45rem 1.55rem;
  background-color: var(--color-surface);
  border: 1.5px solid var(--color-border-subtle);
  border-left: 4px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  transition: border-color 0.25s ease;
}

.pillar-block.is-active {
  border-left-color: var(--color-accent);
}

.pillar-num {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--color-accent);
  font-weight: 500;
  margin-bottom: 0.35rem;
}

.pillar-heading {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-ink);
}

.pillar-desc {
  margin-top: 0.55rem;
  color: var(--color-ink-secondary);
  max-width: 56ch;
}

.stack-panel {
  padding: 1.55rem;
  background-color: var(--color-surface);
  border: 1.5px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
}

.stack-heading {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.15rem;
}

.stack-groups {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

.stack-group {
  padding-top: 0.85rem;
  border-top: 1px solid var(--color-border-subtle);
}

.group-title {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--color-accent);
  margin-bottom: 0.65rem;
}

.group-list {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.stack-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.3rem 0.65rem 0.3rem 0.4rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-ink);
  background-color: var(--color-bg-band);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
}

.chip-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 3px;
  background-color: #FAF8F3;
  border-radius: 6px;
  flex-shrink: 0;
}

.chip-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

@media (min-width: 600px) {
  .stack-groups {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 900px) {
  .about-story-grid {
    grid-template-columns: 0.92fr 1.08fr;
    gap: 4rem;
    align-items: start;
  }

  .about-sticky-col {
    position: sticky;
    top: calc(var(--header-height) + 2.5rem);
  }

  .pillar-index {
    margin-top: 1.35rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    border-left: 2px solid var(--color-border-subtle);
    padding-left: 0.75rem;
  }

  .pillar-step {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    min-height: 44px;
    padding: 0.35rem 0.75rem;
    background: transparent;
    border: 0;
    border-radius: var(--radius-md);
    text-align: left;
    color: var(--color-ink-muted);
    font-size: 0.92rem;
    transition: color 0.15s ease, background-color 0.15s ease;
  }

  .pillar-step:hover {
    color: var(--color-ink);
    background-color: var(--color-surface);
  }

  .pillar-step.is-active {
    color: var(--color-ink);
    font-weight: 700;
    background-color: var(--color-surface);
  }

  .step-num {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--color-accent);
  }

  .pillars-stack {
    gap: 4.5rem;
    padding-block: 1rem 3rem;
  }
}
</style>

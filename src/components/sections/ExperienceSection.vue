<script setup>
import FadeInOnScroll from '../animations/FadeInOnScroll.vue'
import { education, workExperience } from '../../data/portfolio'

const groups = [
  {
    id: 'work',
    code: '01 / work',
    title: 'Work Experience',
    span: '2024 - Present',
    items: workExperience
  },
  {
    id: 'education',
    code: '02 / education',
    title: 'Education',
    span: '2022 - Present',
    items: education
  }
]

function isOngoing(period) {
  return period.includes('Present')
}
</script>

<template>
  <section id="experience" class="section-padding">
    <div class="container">
      <FadeInOnScroll>
        <p class="section-eyebrow">02 / background</p>
        <h2 class="section-title">Experience &amp; Education</h2>
      </FadeInOnScroll>

      <div class="ledger-chapters">
        <section
          v-for="group in groups"
          :key="group.id"
          class="ledger-chapter"
          :aria-labelledby="`bg-${group.id}-heading`"
        >
          <div class="chapter-meta">
            <p class="chapter-code">{{ group.code }}</p>
            <h3 :id="`bg-${group.id}-heading`" class="chapter-title">
              {{ group.title }}
            </h3>
            <p class="chapter-span">{{ group.span }}</p>
          </div>

          <ol class="ledger-rows">
            <li
              v-for="item in group.items"
              :key="`${item.period}-${item.title}`"
              class="ledger-row"
            >
              <FadeInOnScroll class="ledger-row-fade">
                <div class="ledger-row-inner">
                  <time
                    class="ledger-period"
                    :class="{ 'is-ongoing': isOngoing(item.period) }"
                  >
                    {{ item.period }}
                  </time>
                  <div class="ledger-detail">
                    <h4 class="ledger-role">{{ item.title }}</h4>
                    <p class="ledger-org">{{ item.organization }}</p>
                  </div>
                </div>
              </FadeInOnScroll>
            </li>
          </ol>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-title {
  text-wrap: balance;
}

.ledger-chapters {
  margin-top: 2.5rem;
  border-block-start: 1px solid color-mix(in oklab, var(--color-border) 55%, transparent);
}

.ledger-chapter {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.35rem 3rem;
  padding-block: 2.25rem;
  border-block-end: 1px solid color-mix(in oklab, var(--color-border) 55%, transparent);
}

.chapter-code {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-accent);
}

.chapter-title {
  margin-top: 0.35rem;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-ink);
  text-wrap: balance;
}

.chapter-span {
  margin-top: 0.25rem;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--color-ink-muted);
}

.ledger-rows {
  list-style: none;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-inline-size: 0;
}

.ledger-row {
  grid-column: 1 / -1;
  border-block-start: 1px solid color-mix(in oklab, var(--color-border) 38%, transparent);
}

.ledger-row:first-child {
  border-block-start: 0;
}

.ledger-row-fade {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}

.ledger-row-inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.3rem 1.75rem;
  padding-block: 1.05rem;
}

.ledger-row:first-child .ledger-row-inner {
  padding-block-start: 0.15rem;
}

.ledger-row:last-child .ledger-row-inner {
  padding-block-end: 0.25rem;
}

.ledger-period {
  font-family: var(--font-mono);
  font-size: 0.86rem;
  color: var(--color-ink-muted);
  white-space: nowrap;
  padding-block-start: 0.14rem;
}

.ledger-period.is-ongoing {
  color: var(--color-accent);
  font-weight: 500;
}

.ledger-detail {
  min-inline-size: 0;
}

.ledger-role {
  font-size: 1.08rem;
  font-weight: 700;
  line-height: 1.35;
  color: var(--color-ink);
  text-wrap: balance;
}

.ledger-org {
  margin-top: 0.2rem;
  font-size: 0.95rem;
  color: var(--color-ink-secondary);
}

@media (min-width: 600px) {
  .ledger-rows {
    grid-template-columns: 12.5rem minmax(0, 1fr);
  }

  .ledger-row {
    display: grid;
    grid-template-columns: 12.5rem minmax(0, 1fr);
    grid-template-columns: subgrid;
  }

  .ledger-row-fade {
    grid-column: 1 / -1;
    grid-template-columns: 12.5rem minmax(0, 1fr);
    grid-template-columns: subgrid;
  }

  .ledger-row-inner {
    grid-column: 1 / -1;
    grid-template-columns: 12.5rem minmax(0, 1fr);
    grid-template-columns: subgrid;
    align-items: baseline;
  }
}

@media (min-width: 860px) {
  .ledger-chapter {
    grid-template-columns: 14.5rem minmax(0, 1fr);
    align-items: start;
  }
}
</style>

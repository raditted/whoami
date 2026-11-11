<script setup>
import { computed } from 'vue'

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  indexLabel: {
    type: String,
    default: '01'
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

const githubRepoInfo = computed(() => {
  if (!props.project.repoUrl || !props.project.repoUrl.includes('github.com/')) {
    return null
  }
  const match = props.project.repoUrl.match(/github\.com\/([^/]+)\/([^/.]+)/)
  if (!match) return null
  return {
    owner: match[1],
    repo: match[2],
    liveSrc: `https://opengraph.githubassets.com/1/${match[1]}/${match[2]}`
  }
})

const cardVisual = computed(() => {
  if (props.project.image) {
    return props.project.image
  }
  if (githubRepoInfo.value) {
    return {
      src: githubRepoInfo.value.liveSrc,
      alt: `GitHub repository preview for ${githubRepoInfo.value.owner}/${githubRepoInfo.value.repo}`,
      width: 1200,
      height: 600,
      fit: 'contain'
    }
  }
  return null
})

function handleImageError(event) {
  if (event.target) {
    event.target.style.display = 'none'
  }
}
</script>

<template>
  <article class="project-card" :class="{ 'is-active': isActive, 'no-media': !cardVisual }">
    <div v-if="cardVisual" class="media-wrap" :class="{ 'is-contain': cardVisual.fit === 'contain' }">
      <img
        :src="cardVisual.src"
        :alt="cardVisual.alt"
        :width="cardVisual.width || 1200"
        :height="cardVisual.height || 600"
        loading="lazy"
        @error="handleImageError"
      />
    </div>
    <div v-else class="spec-visual">
      <div class="spec-visual-top">
        <span class="spec-index">{{ indexLabel }}</span>
        <span class="spec-kind">{{ project.context }}</span>
      </div>
    </div>

    <div class="card-body">
      <p class="project-context">
        <span>{{ indexLabel }}</span>
        <span aria-hidden="true"> / </span>
        <span>{{ project.context }}</span>
      </p>
      <h3 class="project-title">{{ project.title }}</h3>
      <p class="project-description">{{ project.description }}</p>

      <ul class="stack-list" aria-label="Technologies used">
        <li v-for="tech in project.stack" :key="tech" class="stack-tag">
          {{ tech }}
        </li>
      </ul>

      <div class="card-actions">
        <a
          :href="project.repoUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="action-link-row repo-link"
        >
          <span>
            {{ project.repoUrl?.includes('github.com') ? 'View on GitHub' : 'Open Website' }}
            <span class="visually-hidden"> for {{ project.title }}</span>
          </span>
          <svg
            aria-hidden="true"
            class="action-arrow"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M7 17 17 7" />
            <path d="M7 7h10v10" />
          </svg>
        </a>
      </div>
    </div>
  </article>
</template>

<style scoped>
.project-card {
  display: flex;
  flex-direction: column;
  background-color: var(--color-surface);
  border: 1.5px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
  height: 100%;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

@media (prefers-reduced-motion: no-preference) {
  .project-card:hover {
    transform: translateY(-2px);
  }
}

.project-card.is-active {
  border-color: var(--color-accent);
}

.media-wrap {
  background-color: var(--color-bg-band);
  border-bottom: 1px solid var(--color-border-subtle);
  aspect-ratio: 2 / 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-wrap img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

.media-wrap.is-contain {
  padding: 0.5rem;
}

.media-wrap.is-contain img {
  object-fit: contain;
  object-position: center;
}

.spec-visual {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.15rem;
  aspect-ratio: 16 / 10;
  padding: 1.25rem 1.35rem;
  background-color: var(--color-bg-band);
  border-bottom: 1px solid var(--color-border-subtle);
}

.spec-visual-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.spec-index {
  font-family: var(--font-mono);
  font-size: 1.45rem;
  font-weight: 500;
  color: var(--color-accent);
  line-height: 1;
}

.spec-kind {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--color-ink-muted);
}


.card-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 1.35rem;
}

.project-context {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--color-ink-muted);
  margin-bottom: 0.35rem;
}

.project-title {
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--color-ink);
}

.project-description {
  margin-top: 0.6rem;
  color: var(--color-ink-secondary);
  font-size: 0.94rem;
}

.stack-list {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 1rem;
}

.stack-tag {
  padding: 0.2rem 0.55rem;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--color-ink);
  background-color: var(--color-bg-band);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
}

.card-actions {
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border-subtle);
}
</style>

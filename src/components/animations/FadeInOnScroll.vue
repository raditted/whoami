<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  thresholdOffset: {
    type: Number,
    default: 80
  }
})

const containerRef = ref(null)
const isVisible = ref(false)
let observer = null

onMounted(() => {
  const el = containerRef.value
  if (!el) return

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    isVisible.value = true
    return
  }

  const margin = Math.min(props.thresholdOffset, Math.floor(window.innerHeight * 0.2))

  if (el.getBoundingClientRect().top < window.innerHeight - margin) {
    isVisible.value = true
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight - margin) {
          isVisible.value = true
          observer?.disconnect()
          observer = null
          break
        }
      }
    },
    {
      rootMargin: `0px 0px -${margin}px 0px`,
      threshold: 0
    }
  )

  observer.observe(el)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <div ref="containerRef" class="fadeIn" :class="{ onScreen: isVisible }">
    <slot />
  </div>
</template>

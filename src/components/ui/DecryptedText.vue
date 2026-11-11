<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  speed: {
    type: Number,
    default: 45
  },
  maxIterations: {
    type: Number,
    default: 10
  },
  sequential: {
    type: Boolean,
    default: true
  },
  revealDirection: {
    type: String,
    default: 'start'
  },
  useOriginalCharsOnly: {
    type: Boolean,
    default: false
  },
  characters: {
    type: String,
    default: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+'
  },
  className: {
    type: String,
    default: ''
  },
  encryptedClassName: {
    type: String,
    default: ''
  },
  parentClassName: {
    type: String,
    default: ''
  },
  animateOn: {
    type: String,
    default: 'inViewHover'
  },
  clickMode: {
    type: String,
    default: 'once'
  }
})

const containerRef = ref(null)
const displayText = ref(props.text)
const isAnimating = ref(false)
const revealedIndices = ref(new Set())
const hasAnimated = ref(false)
const isDecrypted = ref(props.animateOn !== 'click')
const direction = ref('forward')
const prefersReducedMotion = ref(false)

const orderRef = ref([])
const pointerRef = ref(0)
let intervalId = null
let motionMedia = null

const availableChars = computed(() => {
  return props.useOriginalCharsOnly
    ? Array.from(new Set(props.text.split(''))).filter((char) => char !== ' ')
    : props.characters.split('')
})

function shuffleText(originalText, currentRevealed) {
  return originalText
    .split('')
    .map((char, i) => {
      if (char === ' ') return ' '
      if (currentRevealed.has(i)) return originalText[i]
      return availableChars.value[Math.floor(Math.random() * availableChars.value.length)]
    })
    .join('')
}

function computeOrder(len) {
  const order = []
  if (len <= 0) return order
  if (props.revealDirection === 'start') {
    for (let i = 0; i < len; i++) order.push(i)
    return order
  }
  if (props.revealDirection === 'end') {
    for (let i = len - 1; i >= 0; i--) order.push(i)
    return order
  }
  const middle = Math.floor(len / 2)
  let offset = 0
  while (order.length < len) {
    if (offset % 2 === 0) {
      const idx = middle + offset / 2
      if (idx >= 0 && idx < len) order.push(idx)
    } else {
      const idx = middle - Math.ceil(offset / 2)
      if (idx >= 0 && idx < len) order.push(idx)
    }
    offset++
  }
  return order.slice(0, len)
}

function fillAllIndices() {
  const s = new Set()
  for (let i = 0; i < props.text.length; i++) s.add(i)
  return s
}

function triggerDecrypt() {
  if (prefersReducedMotion.value) {
    displayText.value = props.text
    isDecrypted.value = true
    isAnimating.value = false
    return
  }

  if (props.sequential) {
    orderRef.value = computeOrder(props.text.length)
    pointerRef.value = 0
    revealedIndices.value = new Set()
  } else {
    revealedIndices.value = new Set()
  }
  direction.value = 'forward'
  isAnimating.value = true
}

function stopInterval() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

function startInterval() {
  stopInterval()
  if (prefersReducedMotion.value) {
    displayText.value = props.text
    isAnimating.value = false
    isDecrypted.value = true
    return
  }

  let currentIteration = 0

  intervalId = setInterval(() => {
    if (props.sequential) {
      if (direction.value === 'forward') {
        if (pointerRef.value < orderRef.value.length) {
          const nextIndex = orderRef.value[pointerRef.value++]
          const newRevealed = new Set(revealedIndices.value)
          newRevealed.add(nextIndex)
          revealedIndices.value = newRevealed
          displayText.value = shuffleText(props.text, newRevealed)
        } else {
          stopInterval()
          isAnimating.value = false
          isDecrypted.value = true
          displayText.value = props.text
        }
      }
    } else {
      if (direction.value === 'forward') {
        displayText.value = shuffleText(props.text, revealedIndices.value)
        currentIteration++
        if (currentIteration >= props.maxIterations) {
          stopInterval()
          isAnimating.value = false
          displayText.value = props.text
          isDecrypted.value = true
        }
      }
    }
  }, props.speed)
}

watch(isAnimating, (val) => {
  if (val) startInterval()
  else stopInterval()
})

function triggerHoverDecrypt() {
  if (isAnimating.value || prefersReducedMotion.value) return
  revealedIndices.value = new Set()
  isDecrypted.value = false
  direction.value = 'forward'
  if (props.sequential) {
    orderRef.value = computeOrder(props.text.length)
    pointerRef.value = 0
  }
  isAnimating.value = true
}

function resetToPlainText() {
  stopInterval()
  isAnimating.value = false
  revealedIndices.value = fillAllIndices()
  displayText.value = props.text
  isDecrypted.value = true
  direction.value = 'forward'
}

const animateListeners = computed(() => {
  if (props.animateOn === 'hover' || props.animateOn === 'inViewHover') {
    return {
      onMouseenter: triggerHoverDecrypt,
      onMouseleave: resetToPlainText
    }
  }
  return {}
})

function isRevealedOrDone(index) {
  return revealedIndices.value.has(index) || (!isAnimating.value && isDecrypted.value)
}

let intersectionObserver = null

onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = motionMedia.matches
    const updateMotion = () => {
      prefersReducedMotion.value = motionMedia.matches
      if (prefersReducedMotion.value) resetToPlainText()
    }
    motionMedia.addEventListener?.('change', updateMotion)
  }

  if ((props.animateOn === 'view' || props.animateOn === 'inViewHover') && !prefersReducedMotion.value) {
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasAnimated.value) {
              triggerDecrypt()
              hasAnimated.value = true
            }
          })
        },
        { threshold: 0.1 }
      )
      if (containerRef.value) intersectionObserver.observe(containerRef.value)
    } else {
      triggerDecrypt()
    }
  } else {
    displayText.value = props.text
    isDecrypted.value = true
  }
})

onUnmounted(() => {
  stopInterval()
  intersectionObserver?.disconnect()
})

watch(
  () => props.text,
  (newText) => {
    displayText.value = newText
    isDecrypted.value = true
    revealedIndices.value = new Set()
  }
)
</script>

<template>
  <span
    ref="containerRef"
    class="decrypted-text-root"
    :class="parentClassName"
    :aria-label="text"
    v-bind="animateListeners"
  >
    <span
      v-for="(char, index) in displayText.split('')"
      :key="index"
      :class="[
        'decrypted-char',
        isRevealedOrDone(index) ? (className || 'char--revealed') : (encryptedClassName || 'char--encrypted')
      ]"
    >{{ char }}</span>
  </span>
</template>

<style scoped>
.decrypted-text-root {
  display: inline-block;
  white-space: pre-wrap;
  cursor: default;
}

.decrypted-chars-wrap {
  display: inline;
}

.decrypted-char {
  display: inline;
}

.char--revealed {
  color: inherit;
}

.char--encrypted {
  color: var(--color-accent);
  opacity: 0.88;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>

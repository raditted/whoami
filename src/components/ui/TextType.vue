<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed, useTemplateRef } from 'vue'
import { gsap } from 'gsap'

const props = defineProps({
  text: {
    type: [String, Array],
    required: true
  },
  as: {
    type: String,
    default: 'span'
  },
  typingSpeed: {
    type: Number,
    default: 50
  },
  initialDelay: {
    type: Number,
    default: 0
  },
  pauseDuration: {
    type: Number,
    default: 3800
  },
  deletingSpeed: {
    type: Number,
    default: 30
  },
  loop: {
    type: Boolean,
    default: true
  },
  className: {
    type: String,
    default: ''
  },
  showCursor: {
    type: Boolean,
    default: true
  },
  hideCursorWhileTyping: {
    type: Boolean,
    default: false
  },
  cursorCharacter: {
    type: String,
    default: '|'
  },
  cursorBlinkDuration: {
    type: Number,
    default: 0.5
  },
  textColors: {
    type: Array,
    default: () => []
  },
  variableSpeed: {
    type: Object,
    default: null
  },
  startOnVisible: {
    type: Boolean,
    default: false
  },
  reverseMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['sentenceComplete'])

const textArray = computed(() => (Array.isArray(props.text) ? props.text : [props.text]))
const initialText = computed(() => textArray.value[0] || '')

const displayedText = ref(initialText.value)
const currentCharIndex = ref(initialText.value.length)
const isDeleting = ref(false)
const currentTextIndex = ref(0)
const isVisible = ref(!props.startOnVisible)
const prefersReducedMotion = ref(false)

const cursorRef = useTemplateRef('cursorRef')
const containerRef = useTemplateRef('containerRef')

let timeout = null
let gsapTween = null

const clearTimeoutIfNeeded = () => {
  if (timeout) {
    clearTimeout(timeout)
    timeout = null
  }
}

const getRandomSpeed = () => {
  if (!props.variableSpeed) return props.typingSpeed
  const { min, max } = props.variableSpeed
  return Math.random() * (max - min) + min
}

const getCurrentTextColor = () => {
  if (!props.textColors.length) return 'inherit'
  return props.textColors[currentTextIndex.value % props.textColors.length]
}

const executeTypingAnimation = () => {
  if (prefersReducedMotion.value) {
    displayedText.value = textArray.value[0] || ''
    return
  }

  const currentText = textArray.value[currentTextIndex.value] || ''
  const processedText = props.reverseMode ? currentText.split('').reverse().join('') : currentText

  if (isDeleting.value) {
    if (displayedText.value === '') {
      isDeleting.value = false
      if (currentTextIndex.value === textArray.value.length - 1 && !props.loop) return

      emit('sentenceComplete', textArray.value[currentTextIndex.value], currentTextIndex.value)

      currentTextIndex.value = (currentTextIndex.value + 1) % textArray.value.length
      currentCharIndex.value = 0
      timeout = setTimeout(() => {
        executeTypingAnimation()
      }, 450)
    } else {
      timeout = setTimeout(() => {
        displayedText.value = displayedText.value.slice(0, -1)
      }, props.deletingSpeed)
    }
  } else {
    if (currentCharIndex.value < processedText.length) {
      timeout = setTimeout(
        () => {
          displayedText.value += processedText[currentCharIndex.value]
          currentCharIndex.value += 1
        },
        props.variableSpeed ? getRandomSpeed() : props.typingSpeed
      )
    } else if (textArray.value.length > 1) {
      timeout = setTimeout(() => {
        isDeleting.value = true
      }, props.pauseDuration)
    }
  }
}

watch(
  [displayedText, currentCharIndex, isDeleting, isVisible],
  () => {
    if (!isVisible.value || prefersReducedMotion.value) return
    clearTimeoutIfNeeded()

    if (currentCharIndex.value === 0 && !isDeleting.value && displayedText.value === '') {
      timeout = setTimeout(() => {
        executeTypingAnimation()
      }, props.initialDelay)
    } else {
      executeTypingAnimation()
    }
  }
)

let motionMedia = null
const updateMotionPreference = () => {
  prefersReducedMotion.value = !!motionMedia?.matches
  if (prefersReducedMotion.value) {
    clearTimeoutIfNeeded()
    displayedText.value = textArray.value[0] || ''
  }
}

onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)')
    updateMotionPreference()
    motionMedia.addEventListener?.('change', updateMotionPreference)
  }

  if (props.showCursor && cursorRef.value && !prefersReducedMotion.value) {
    gsap.set(cursorRef.value, { opacity: 1 })
    gsapTween = gsap.to(cursorRef.value, {
      opacity: 0,
      duration: props.cursorBlinkDuration,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut'
    })
  }

  if (props.startOnVisible && containerRef.value && typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) isVisible.value = true
        })
      },
      { threshold: 0.1 }
    )
    if (containerRef.value instanceof Element) {
      observer.observe(containerRef.value)
    }
    onBeforeUnmount(() => observer.disconnect())
  }

  // Kick off the initial pause timer before first delete
  if (!prefersReducedMotion.value && textArray.value.length > 1) {
    timeout = setTimeout(() => {
      isDeleting.value = true
    }, props.pauseDuration)
  }
})

onBeforeUnmount(() => {
  clearTimeoutIfNeeded()
  if (gsapTween) {
    gsapTween.kill()
    gsapTween = null
  }
  if (motionMedia && updateMotionPreference) {
    motionMedia.removeEventListener?.('change', updateMotionPreference)
  }
})
</script>

<template>
  <component
    :is="as"
    ref="containerRef"
    class="text-type-root"
    :class="className"
    v-bind="$attrs"
  >
    <span class="text-type-text" :style="{ color: getCurrentTextColor() }">
      {{ displayedText }}
    </span>
    <span
      v-if="showCursor"
      ref="cursorRef"
      class="text-type-cursor"
      :class="{
        'is-hidden': hideCursorWhileTyping && (currentCharIndex < (textArray[currentTextIndex]?.length || 0) || isDeleting)
      }"
      aria-hidden="true"
    >
      {{ cursorCharacter }}
    </span>
  </component>
</template>

<style scoped>
.text-type-root {
  display: inline-block;
  white-space: pre-wrap;
  letter-spacing: -0.02em;
}

.text-type-text {
  display: inline;
}

.text-type-cursor {
  display: inline-block;
  margin-left: 0.08em;
  color: var(--color-accent);
  font-weight: 300;
  user-select: none;
}

.text-type-cursor.is-hidden {
  opacity: 0;
}
</style>

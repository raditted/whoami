<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: 'Motion Echo'
  },
  echoes: {
    type: Number,
    default: 8
  },
  lag: {
    type: Number,
    default: 0.24
  },
  offset: {
    type: Number,
    default: 24
  },
  direction: {
    type: String,
    default: 'right'
  },
  fade: {
    type: Number,
    default: 0.72
  },
  blur: {
    type: Number,
    default: 2
  },
  tint: {
    type: [String, Boolean],
    default: false
  },
  mode: {
    type: String,
    default: 'both'
  },
  cursorRadius: {
    type: Number,
    default: 320
  },
  duration: {
    type: Number,
    default: 900
  },
  ease: {
    type: String,
    default: 'ease-out'
  },
  fontSize: {
    type: [String, Number],
    default: null
  },
  fontWeight: {
    type: [String, Number],
    default: null
  },
  color: {
    type: String,
    default: null
  }
})

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const directionVectors = {
  right: { x: 1, y: 0 },
  left: { x: -1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  diagonal: { x: 0.72, y: 0.72 }
}

const easing = {
  linear: (t) => t,
  'ease-out': (t) => 1 - Math.pow(1 - t, 3),
  'ease-in-out': (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  snappy: (t) => 1 - Math.pow(1 - t, 5)
}

const rootRef = ref(null)
const copyRefs = ref([])

const setCopyRef = (el, index) => {
  copyRefs.value[index] = el
}

const prefersReducedMotion = ref(false)

const echoCount = computed(() =>
  prefersReducedMotion.value ? 0 : clamp(Math.round(props.echoes), 0, 24)
)
const copyIndexes = computed(() =>
  Array.from({ length: echoCount.value + 1 }, (_, index) => index)
)
const reversedEchoIndexes = computed(() => copyIndexes.value.slice(1).reverse())

const rootStyle = computed(() => {
  const style = {}
  if (props.fontSize) style.fontSize = typeof props.fontSize === 'number' ? `${props.fontSize}px` : props.fontSize
  if (props.fontWeight) style.fontWeight = String(props.fontWeight)
  if (props.color) style.color = props.color
  return style
})

let frame = null
let state = null
let stopAnimation = null
let media = null
let updateMotionPreference = null

const setupAnimation = () => {
  const root = rootRef.value
  if (!root || prefersReducedMotion.value) return

  const vector = directionVectors[props.direction] || directionVectors.right
  const safeOffset = clamp(Number(props.offset) || 0, 0, 120)
  const safeCursorRadius = clamp(Number(props.cursorRadius) || 320, 40, 1200)
  const safeLag = clamp(Number(props.lag) || 0.16, 0.02, 0.5)
  const safeFade = clamp(Number(props.fade) || 0.64, 0.1, 0.95)
  const safeBlur = clamp(Number(props.blur) || 0, 0, 16)
  const safeDuration = Math.max(0, Number(props.duration) || 0)
  const easeFn = easing[props.ease] || easing['ease-out']
  const entranceEnabled = props.mode === 'entrance' || props.mode === 'both'
  const pointerEnabled = props.mode === 'pointer' || props.mode === 'both'
  const positions = Array.from({ length: echoCount.value + 1 }, (_, index) => {
    const entranceAmount = entranceEnabled ? safeOffset * (index + 0.35) : 0
    return { x: vector.x * entranceAmount, y: vector.y * entranceAmount }
  })

  const animState = {
    targetX: 0,
    targetY: 0,
    lastTargetX: 0,
    lastTargetY: 0,
    activity: entranceEnabled ? 1 : 0,
    positions,
    startTime: performance.now()
  }
  state = animState

  let canHover = false
  let cleanupPointer = () => {}

  if (pointerEnabled && typeof window !== 'undefined' && window.matchMedia) {
    const hoverMedia = window.matchMedia('(hover: hover) and (pointer: fine)')
    canHover = hoverMedia.matches
  }

  const handlePointerMove = (event) => {
    if (!state) return

    const rect = root.getBoundingClientRect()
    if (!rect.width || !rect.height) return

    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const deltaX = event.clientX - centerX
    const deltaY = event.clientY - centerY
    const distance = Math.hypot(deltaX, deltaY)
    const reach = distance > 0 ? clamp(distance / safeCursorRadius, 0, 1) : 0
    const pull = Math.pow(1 - reach, 1.8)

    state.targetX = pull > 0.001 ? (deltaX / safeCursorRadius) * safeOffset * pull * 1.5 : 0
    state.targetY = pull > 0.001 ? (deltaY / safeCursorRadius) * safeOffset * pull * 1.5 : 0

    if (!frame) {
      frame = requestAnimationFrame(renderFrame)
    }
  }

  const handlePointerLeave = () => {
    if (!state) return
    state.targetX = 0
    state.targetY = 0
    if (!frame) {
      frame = requestAnimationFrame(renderFrame)
    }
  }

  if (pointerEnabled && canHover) {
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    document.addEventListener('pointerleave', handlePointerLeave, { passive: true })
    cleanupPointer = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerleave', handlePointerLeave)
    }
  }

  const renderFrame = (now) => {
    if (!state) return

    const elapsed = now - state.startTime
    const entranceProgress =
      entranceEnabled && safeDuration > 0 ? clamp(elapsed / safeDuration, 0, 1) : 1
    const easedEntrance = easeFn(entranceProgress)
    const entranceRest = entranceEnabled ? 1 - easedEntrance : 0
    const targetVelocity = Math.hypot(
      state.targetX - state.lastTargetX,
      state.targetY - state.lastTargetY
    )

    state.lastTargetX = state.targetX
    state.lastTargetY = state.targetY

    let maxSeparation = 0

    for (let index = 0; index <= echoCount.value; index += 1) {
      const copy = copyRefs.value[index]
      const current = state.positions[index]
      if (!copy || !current) continue

      const entranceAmount = entranceRest * safeOffset * (index + 0.35)
      const desiredX = state.targetX + vector.x * entranceAmount
      const desiredY = state.targetY + vector.y * entranceAmount
      const lerp = clamp(0.34 / (1 + index * safeLag * 4.2), 0.018, 0.36)

      current.x += (desiredX - current.x) * lerp
      current.y += (desiredY - current.y) * lerp

      copy.style.transform = `translate3d(${current.x.toFixed(3)}px, ${current.y.toFixed(3)}px, 0)`

      if (index > 0) {
        const front = state.positions[0]
        const separation = front ? Math.hypot(current.x - front.x, current.y - front.y) : 0
        maxSeparation = Math.max(maxSeparation, separation)
        const depth = echoCount.value ? index / echoCount.value : 0
        copy.style.filter = safeBlur > 0 ? `blur(${(safeBlur * depth).toFixed(2)}px)` : 'none'
      }
    }

    const separationActivity =
      safeOffset > 0 ? clamp(maxSeparation / (safeOffset * 2.25), 0, 1) : 0
    const targetActivity = safeOffset > 0 ? clamp(targetVelocity / (safeOffset * 0.35), 0, 1) : 0
    const nextActivity = Math.max(entranceRest, separationActivity, targetActivity)
    state.activity += (nextActivity - state.activity) * 0.18

    for (let index = 1; index <= echoCount.value; index += 1) {
      const copy = copyRefs.value[index]
      if (!copy) continue
      copy.style.opacity = String(Math.pow(safeFade, index) * state.activity)
    }

    const stillMoving =
      state.activity > 0.002 ||
      Math.abs(state.targetX) > 0.01 ||
      Math.abs(state.targetY) > 0.01 ||
      entranceProgress < 1 ||
      canHover

    if (stillMoving) {
      frame = requestAnimationFrame(renderFrame)
    } else {
      frame = null
    }
  }

  frame = requestAnimationFrame(renderFrame)

  stopAnimation = () => {
    cleanupPointer()
    if (frame) cancelAnimationFrame(frame)
    frame = null
    state = null
  }
}

onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    media = window.matchMedia('(prefers-reduced-motion: reduce)')
    updateMotionPreference = () => {
      prefersReducedMotion.value = media.matches
    }
    updateMotionPreference()
    media.addEventListener?.('change', updateMotionPreference)
  }

  setupAnimation()
})

onUnmounted(() => {
  stopAnimation?.()
  stopAnimation = null
  if (media && updateMotionPreference) media.removeEventListener?.('change', updateMotionPreference)
})

watch(
  () => [
    props.blur,
    props.cursorRadius,
    props.direction,
    props.duration,
    props.ease,
    echoCount.value,
    props.fade,
    props.lag,
    props.mode,
    props.offset,
    prefersReducedMotion.value
  ],
  () => {
    stopAnimation?.()
    stopAnimation = null
    setupAnimation()
  }
)
</script>

<template>
  <span
    ref="rootRef"
    class="echo-text-root"
    :style="rootStyle"
  >
    <span
      v-for="index in reversedEchoIndexes"
      :key="`echo-${index}`"
      :ref="(el) => setCopyRef(el, index)"
      aria-hidden="true"
      class="echo-copy"
      :data-echo-index="index"
      :data-text="text"
      :style="{
        color: tint ? `color-mix(in srgb, ${tint} ${Math.min(72, 18 + index * 5)}%, ${color || 'currentColor'})` : (color || 'currentColor'),
        opacity: 0
      }"
    ></span>
    <span
      :ref="(el) => setCopyRef(el, 0)"
      class="echo-front"
      data-echo-index="0"
    >
      {{ text }}
    </span>
  </span>
</template>

<style scoped>
.echo-text-root {
  display: inline-block;
  position: relative;
  line-height: inherit;
  white-space: nowrap;
  user-select: none;
  font-kerning: normal;
  text-rendering: geometricPrecision;
}

.echo-copy {
  display: block;
  position: absolute;
  inset: 0;
  transform-origin: center;
  backface-visibility: hidden;
  pointer-events: none;
  will-change: transform, opacity;
}

.echo-copy::before {
  content: attr(data-text);
  display: inline-block;
}

.echo-front {
  display: block;
  position: relative;
  z-index: 2;
  pointer-events: none;
  will-change: transform;
}
</style>

import { inject, nextTick, onBeforeUnmount, onMounted, provide, ref, shallowRef, watch } from 'vue'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

const LENIS_KEY = Symbol('lenis')
const SECTION_IDS = ['home', 'about', 'experience', 'github', 'projects', 'contact']

function easeOutQuint(t) {
  return 1 - Math.pow(1 - t, 5)
}

export function provideLenis(options = {}) {
  const lenis = shallowRef(null)
  const scrollY = ref(0)
  const scrollProgress = ref(0)
  const activeSection = ref('home')
  let unsubscribeScroll = null
  let scrollRequestId = 0

  function updateActiveSection() {
    const offsetMarker = window.innerHeight * 0.35
    let current = 'home'

    for (const id of SECTION_IDS) {
      const el = document.getElementById(id)
      if (!el) continue
      const rect = el.getBoundingClientRect()
      if (rect.top <= offsetMarker) {
        current = id
      }
    }

    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24) {
      current = 'contact'
    }

    activeSection.value = current
  }

  function scrollTo(target, scrollOptions = {}) {
    if (!lenis.value) return

    const requestId = ++scrollRequestId
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    lenis.value.scrollTo(target, {
      offset: -68,
      duration: 1.0,
      easing: easeOutQuint,
      immediate: prefersReduced,
      ...scrollOptions,
      onComplete: (instance) => {
        scrollOptions.onComplete?.(instance)
        if (requestId !== scrollRequestId) return

        if (typeof target === 'string' && target.startsWith('#')) {
          const section = document.getElementById(target.slice(1))
          const focusTarget = section?.querySelector('h1, h2') || section
          if (focusTarget instanceof HTMLElement) {
            if (!focusTarget.hasAttribute('tabindex')) {
              focusTarget.setAttribute('tabindex', '-1')
            }
            focusTarget.focus({ preventScroll: true })
          }
        }
      }
    })
  }

  onMounted(async () => {
    const instance = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      autoRaf: true,
      respectReducedMotion: true,
      ...options
    })

    lenis.value = instance
    scrollY.value = instance.scroll
    scrollProgress.value = instance.limit > 0 ? instance.scroll / instance.limit : 0
    updateActiveSection()

    unsubscribeScroll = instance.on('scroll', ({ scroll, progress }) => {
      scrollY.value = scroll
      scrollProgress.value = progress
      updateActiveSection()
    })

    await nextTick()
    instance.resize()

    if (window.location.hash) {
      const target = document.getElementById(window.location.hash.slice(1))
      if (target) {
        scrollTo(window.location.hash)
      }
    }
  })

  onBeforeUnmount(() => {
    unsubscribeScroll?.()
    lenis.value?.destroy()
    lenis.value = null
  })

  const context = {
    lenis,
    scrollY,
    scrollProgress,
    activeSection,
    scrollTo
  }

  provide(LENIS_KEY, context)
  return context
}

export function useLenis() {
  const context = inject(LENIS_KEY, null)
  if (!context) {
    throw new Error('useLenis() must be called inside a component tree where provideLenis() was called.')
  }
  return context
}

export function useLenisScroll(callback) {
  const { lenis } = useLenis()
  let unsubscribe = null

  const stopWatch = watch(
    lenis,
    (instance) => {
      unsubscribe?.()
      unsubscribe = null
      if (instance) {
        unsubscribe = instance.on('scroll', callback)
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    stopWatch()
    unsubscribe?.()
  })
}

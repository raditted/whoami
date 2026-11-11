import { computed, inject, onBeforeUnmount, onMounted, provide, ref } from 'vue'

const THEME_KEY = Symbol('theme')
const STORAGE_KEY = 'color-scheme'

function readStoredScheme() {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

export function provideTheme() {
  const storedScheme = ref(readStoredScheme())
  const osDark = ref(false)
  let darkMediaQuery = null

  const resolvedTheme = computed(() => {
    if (storedScheme.value) return storedScheme.value
    return osDark.value ? 'dark' : 'light'
  })

  function syncMetaTag(value) {
    const meta = document.querySelector('meta[name="color-scheme"]')
    if (meta) {
      meta.setAttribute('content', value ?? 'light dark')
    }
  }

  function onOsChange(event) {
    osDark.value = event.matches
  }

  function onStorageChange(event) {
    if (event.key !== STORAGE_KEY) return
    storedScheme.value = readStoredScheme()
    syncMetaTag(storedScheme.value)
  }

  function toggleTheme() {
    const currentRendered = resolvedTheme.value
    const target = currentRendered === 'dark' ? 'light' : 'dark'
    const osScheme = osDark.value ? 'dark' : 'light'

    if (target === osScheme) {
      storedScheme.value = null
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {}
    } else {
      storedScheme.value = target
      try {
        localStorage.setItem(STORAGE_KEY, target)
      } catch {}
    }

    const root = document.documentElement
    root.classList.add('theme-switching')
    syncMetaTag(storedScheme.value)
    // Flush theme token repaint before re-enabling hover transitions.
    void root.offsetHeight
    requestAnimationFrame(() => {
      root.classList.remove('theme-switching')
    })
  }

  onMounted(() => {
    darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    osDark.value = darkMediaQuery.matches
    syncMetaTag(storedScheme.value)

    darkMediaQuery.addEventListener('change', onOsChange)
    window.addEventListener('storage', onStorageChange)
  })

  onBeforeUnmount(() => {
    darkMediaQuery?.removeEventListener('change', onOsChange)
    window.removeEventListener('storage', onStorageChange)
  })

  const context = {
    resolvedTheme,
    toggleTheme
  }

  provide(THEME_KEY, context)
  return context
}

export function useTheme() {
  const context = inject(THEME_KEY, null)
  if (!context) {
    throw new Error('useTheme() must be called inside a component tree where provideTheme() was called.')
  }
  return context
}

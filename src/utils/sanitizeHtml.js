const ALLOWED_ELEMENTS = [
  'div',
  'article',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'ul',
  'ol',
  'li',
  'a',
  'img',
  'picture',
  'code',
  'pre',
  'blockquote',
  'strong',
  'em',
  'b',
  'i',
  'del',
  's',
  'hr',
  'br',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'details',
  'summary',
  'span',
  'kbd',
  'sup',
  'sub'
]

const ALLOWED_ATTRIBUTES = [
  'href',
  'src',
  'alt',
  'title',
  'width',
  'height',
  'align',
  'dir',
  'id',
  'class',
  'rel',
  'colspan',
  'rowspan'
]

let domPurifyPromise

function loadDOMPurify() {
  // Code-split DOMPurify so browsers with native Sanitizer API avoid downloading it.
  domPurifyPromise ??= import('dompurify').then((mod) => mod.default ?? mod)
  return domPurifyPromise
}

/**
 * Safely parse and insert untrusted HTML into an element using native
 * Element.setHTML() when available, falling back to DOMPurify.
 */
export async function safeSetHTML(el, html) {
  if (!el) return

  if ('setHTML' in Element.prototype) {
    el.setHTML(html, {
      sanitizer: {
        elements: ALLOWED_ELEMENTS,
        attributes: ALLOWED_ATTRIBUTES
      }
    })
    return
  }

  const DOMPurify = await loadDOMPurify()
  el.innerHTML = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [...ALLOWED_ELEMENTS, '#text'],
    ALLOWED_ATTR: ALLOWED_ATTRIBUTES,
    ALLOW_ARIA_ATTR: false,
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: false
  })
}

function isSafeHttpUrl(rawUrl, baseUrl) {
  try {
    const resolved = new URL(rawUrl, baseUrl)
    return resolved.protocol === 'https:' || resolved.protocol === 'http:' ? resolved.href : null
  } catch {
    return null
  }
}

/**
 * Normalize links and images inside an already-sanitized GitHub README subtree
 * without re-parsing HTML strings via innerHTML.
 */
export function hydrateGitHubReadmeDom(
  rootEl,
  { owner = 'raditted', repo = 'raditted', branch = 'HEAD' } = {}
) {
  if (!rootEl) return () => {}

  const cleanups = []
  const rawBaseUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/`
  const blobBaseUrl = `https://github.com/${owner}/${repo}/blob/${branch}/`

  // Remove empty GitHub heading permalink anchors after SVG octicons are stripped.
  for (const anchor of rootEl.querySelectorAll('a.anchor')) {
    if (!anchor.textContent.trim()) {
      anchor.remove()
    }
  }

  // Validate link URLs and apply safe external navigation attributes.
  for (const link of rootEl.querySelectorAll('a')) {
    const rawHref = link.getAttribute('href')?.trim()
    if (!rawHref) {
      link.removeAttribute('href')
      continue
    }

    if (rawHref.startsWith('#')) {
      continue
    }

    const safeHref = isSafeHttpUrl(rawHref, blobBaseUrl)
    if (!safeHref) {
      link.removeAttribute('href')
      continue
    }

    link.setAttribute('href', safeHref)
    link.setAttribute('target', '_blank')
    link.setAttribute('rel', 'noopener noreferrer')
    link.setAttribute('referrerpolicy', 'no-referrer')
  }

  // Normalize image URLs, dimensions, lazy loading, and graceful error fallback.
  for (const img of rootEl.querySelectorAll('img')) {
    const rawSrc = img.getAttribute('src')?.trim()
    const safeSrc = rawSrc ? isSafeHttpUrl(rawSrc, rawBaseUrl) : null

    if (!safeSrc) {
      img.remove()
      continue
    }

    const rawWidth = img.getAttribute('width')?.trim()
    const rawHeight = img.getAttribute('height')?.trim()

    if (rawWidth === '100%') {
      img.classList.add('gh-readme-fullwidth')
    }

    if (rawHeight === '3px' || rawHeight === '3') {
      img.classList.add('gh-readme-divider')
      img.setAttribute('width', '1200')
      img.setAttribute('height', '3')
    }

    if (!img.hasAttribute('alt')) {
      img.setAttribute('alt', '')
    }

    img.setAttribute('src', safeSrc)
    img.loading = 'lazy'
    img.decoding = 'async'
    img.referrerPolicy = 'no-referrer'

    const syncNaturalDimensions = () => {
      if (img.classList.contains('gh-readme-divider')) return
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        const wAttr = img.getAttribute('width')
        const hAttr = img.getAttribute('height')
        if (!wAttr || wAttr.includes('%')) {
          img.setAttribute('width', String(img.naturalWidth))
        }
        if (!hAttr || hAttr.includes('%')) {
          img.setAttribute('height', String(img.naturalHeight))
        }
      }
    }

    const handleError = () => {
      const altText = img.getAttribute('alt')?.trim()
      if (!altText) {
        img.remove()
        return
      }
      const badge = document.createElement('span')
      badge.className = 'gh-readme-img-fallback'
      badge.textContent = altText
      img.replaceWith(badge)
    }

    if (img.complete) {
      if (img.naturalWidth === 0) {
        handleError()
      } else {
        syncNaturalDimensions()
      }
    } else {
      img.addEventListener('load', syncNaturalDimensions, { once: true })
      img.addEventListener('error', handleError, { once: true })
      cleanups.push(() => {
        img.removeEventListener('load', syncNaturalDimensions)
        img.removeEventListener('error', handleError)
      })
    }
  }

  return () => {
    for (const cleanup of cleanups) {
      cleanup()
    }
  }
}

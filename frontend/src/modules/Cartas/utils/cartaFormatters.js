const LONG_DATE_FORMATTER = new Intl.DateTimeFormat('es-BO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const HISTORY_DATE_FORMATTER = new Intl.DateTimeFormat('es-BO', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatLetterDate(value, city = '') {
  if (!value) return city
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return city
  const formatted = LONG_DATE_FORMATTER.format(date)
  return city ? `${city}, ${formatted}` : formatted
}

export function formatHistoryDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : HISTORY_DATE_FORMATTER.format(date)
}

export function safeFileName(value, fallback = 'carta') {
  return String(value || fallback)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || fallback
}

export function plainTextFromHtml(html) {
  if (!html) return ''
  if (typeof document === 'undefined') return String(html).replace(/<[^>]*>/g, ' ')
  const container = document.createElement('div')
  container.innerHTML = html
  return (container.textContent || '').replace(/\s+/g, ' ').trim()
}

export function sanitizeCartaHtml(html) {
  if (!html || typeof document === 'undefined') return html || ''

  const allowedTags = new Set([
    'P', 'DIV', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S',
    'UL', 'OL', 'LI', 'H1', 'H2', 'H3', 'BLOCKQUOTE', 'SPAN',
  ])
  const parser = new DOMParser()
  const parsed = parser.parseFromString(`<div>${html}</div>`, 'text/html')
  const root = parsed.body.firstElementChild

  root.querySelectorAll('*').forEach((element) => {
    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(...element.childNodes)
      return
    }

    Array.from(element.attributes).forEach((attribute) => {
      if (attribute.name !== 'style') element.removeAttribute(attribute.name)
    })

    if (element.hasAttribute('style')) {
      const textAlign = element.style.textAlign
      element.removeAttribute('style')
      if (['left', 'right', 'center', 'justify'].includes(textAlign)) {
        element.style.textAlign = textAlign
      }
    }
  })

  return root.innerHTML
}


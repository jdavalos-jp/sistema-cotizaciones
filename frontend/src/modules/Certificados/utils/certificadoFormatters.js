export function formatCertificateDate(value) {
  if (!value) return '-'
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'long', year: 'numeric' })
    .format(date)
    .toUpperCase()
}

export function safeCertificateFileName(value) {
  return String(value || 'certificado-garantia')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase()
}

export function sanitizeCertificateHtml(html) {
  if (!html || typeof document === 'undefined') return html || ''
  const allowed = new Set(['P', 'DIV', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'UL', 'OL', 'LI', 'SPAN'])
  const parsed = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html')
  const root = parsed.body.firstElementChild
  root.querySelectorAll('*').forEach((element) => {
    if (!allowed.has(element.tagName)) {
      element.replaceWith(...element.childNodes)
      return
    }
    Array.from(element.attributes).forEach((attribute) => element.removeAttribute(attribute.name))
  })
  return root.innerHTML
}


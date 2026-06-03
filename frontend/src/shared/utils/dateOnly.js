import dayjs from 'dayjs'

/**
 * Normaliza una entrada a string date-only `YYYY-MM-DD`.
 * Acepta: Date, string (YYYY-MM-DD o ISO), dayjs, y objetos con `toDate()`.
 */
export function toDateOnlyString(value) {
  if (value === null || value === undefined || value === '') return ''

  if (typeof value === 'string') {
    const s = value.trim()
    const dateOnlyMatch = s.match(/^(\d{4}-\d{2}-\d{2})/)
    if (dateOnlyMatch) return dateOnlyMatch[1]
    const d = dayjs(s)
    return d.isValid() ? d.format('YYYY-MM-DD') : ''
  }

  // Date
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return ''
    const y = value.getUTCFullYear()
    const m = String(value.getUTCMonth() + 1).padStart(2, '0')
    const d = String(value.getUTCDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  // dayjs-like / moment-like
  if (typeof value === 'object') {
    if (typeof value.toDate === 'function') {
      const d = dayjs(value.toDate())
      return d.isValid() ? d.format('YYYY-MM-DD') : ''
    }
    if (value.$d instanceof Date) {
      const d = dayjs(value.$d)
      return d.isValid() ? d.format('YYYY-MM-DD') : ''
    }
  }

  return ''
}

export function formatDateDMY(value, fallback = '-') {
  const ymd = toDateOnlyString(value)
  if (!ymd) return fallback
  const [y, m, d] = ymd.split('-')
  return y && m && d ? `${d}/${m}/${y}` : fallback
}

import dayjs from 'dayjs'

/**
 * Normaliza una entrada a string date-only `YYYY-MM-DD`.
 * Acepta: Date, string (YYYY-MM-DD o ISO), dayjs, y objetos con `toDate()`.
 */
export function toDateOnlyString(value) {
  if (value === null || value === undefined || value === '') return ''

  if (typeof value === 'string') {
    const s = value.trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
    const d = dayjs(s)
    return d.isValid() ? d.format('YYYY-MM-DD') : ''
  }

  // Date
  if (value instanceof Date) {
    const d = dayjs(value)
    return d.isValid() ? d.format('YYYY-MM-DD') : ''
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
  const d = dayjs(`${ymd}T00:00:00Z`)
  return d.isValid() ? d.format('DD/MM/YYYY') : fallback
}

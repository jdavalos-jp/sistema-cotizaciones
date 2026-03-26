import { formatDateDMY } from './dateOnly'

/**
 * Evita renderizar objetos accidentalmente (ej. dayjs, Date, objetos API)
 * en componentes como Typography.Text.
 */
export function safeRender(value, fallback = '-') {
  if (value === null || value === undefined) return fallback

  const t = typeof value

  if (t === 'string') return value.trim() ? value : fallback
  if (t === 'number') return Number.isFinite(value) ? String(value) : fallback
  if (t === 'boolean') return value ? 'Sí' : 'No'

  // Date / dayjs -> mostrar como fecha legible
  if (value instanceof Date) {
    const formatted = formatDateDMY(value, '')
    return formatted || fallback
  }

  if (t === 'object') {
    // dayjs-like
    if (typeof value.toDate === 'function' || value.$d instanceof Date) {
      const formatted = formatDateDMY(value, '')
      return formatted || fallback
    }

    // objetos comunes
    if (typeof value.label === 'string' && value.label.trim()) return value.label
    if (typeof value.nombre === 'string' && value.nombre.trim()) return value.nombre
    if (typeof value.name === 'string' && value.name.trim()) return value.name

    // Evitar [object Object]
    return fallback
  }

  return fallback
}

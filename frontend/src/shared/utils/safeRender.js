/**
 * Renderiza de forma segura cualquier valor en un componente React,
 * evitando que objetos (dayjs, Date, respuestas API) se rendericen
 * como [object Object] en Typography.Text y similares.
 *
 * @param {*} value               - Valor a renderizar
 * @param {string} [fallback='-'] - Valor por defecto si no es representable
 * @param {Function} [formatDate] - Función opcional para formatear fechas.
 *                                  Recibe un Date nativo y retorna string.
 *                                  Desacopla safeRender de formatDateDMY.
 * @returns {string}
 *
 * @example
 * // Sin formateador de fecha personalizado
 * safeRender(clienteData.nombre)           // 'Juan Pérez'
 * safeRender(null)                         // '-'
 * safeRender(clienteData.activo)           // 'Sí' | 'No'
 *
 * @example
 * // Con formateador de fecha personalizado
 * import { formatDateDMY } from './dateOnly'
 * safeRender(clienteData.fechaNacimiento, '-', (d) => formatDateDMY(d, ''))
 */
export function safeRender(value, fallback = '-', formatDate = null) {
  if (value === null || value === undefined) return fallback

  const t = typeof value

  if (t === 'string') return value.trim() ? value : fallback
  if (t === 'number') return Number.isFinite(value) ? String(value) : fallback
  if (t === 'boolean') return value ? 'Sí' : 'No'

  // Arrays: no tienen representación visual útil como string
  if (Array.isArray(value)) return fallback

  // Date nativo
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return fallback
    if (formatDate) return formatDate(value) || fallback
    return value.toLocaleDateString('es-ES') // fallback legible sin dependencia
  }

  if (t === 'object') {
    // dayjs: usar API pública (isDayjs) en lugar de internals frágiles ($d, _d)
    // Se detecta por duck-typing seguro sin importar dayjs directamente
    if (
      typeof value.isValid === 'function' &&
      typeof value.toDate === 'function' &&
      value.isValid()
    ) {
      const date = value.toDate()
      if (formatDate) return formatDate(date) || fallback
      return date.toLocaleDateString('es-ES')
    }

    // Objetos con etiqueta legible (ej. opciones de select)
    if (typeof value.label === 'string' && value.label.trim()) return value.label

    // Objetos con nombre en convenciones comunes de APIs
    if (typeof value.nombre === 'string' && value.nombre.trim()) return value.nombre
    if (typeof value.name === 'string' && value.name.trim()) return value.name

    // Evitar [object Object]
    return fallback
  }

  return fallback
}
import { apiPost } from './http'

export async function previewCotizacion(payload, { signal } = {}) {
  const json = await apiPost('/api/cotizaciones/preview', payload, { signal })
  return json.data
}

export async function generarPdfCotizacion(payload, { signal } = {}) {
  // Devuelve ArrayBuffer del PDF
  return apiPost('/api/cotizaciones/pdf', payload, { signal })
}

import { apiPost, apiGet, apiPut, apiDelete, apiPatch } from './http'

const BASE_URL = '/cotizaciones'

/**
 * Listar todas las cotizaciones
 * @param {Object} options - { skip, take, estado, signal }
 */
export async function getCotizaciones(options = {}, fetchOptions = {}) {
  const { skip = 0, take = 50, estado = null, signal } = options
  const params = new URLSearchParams()
  params.append('skip', skip)
  params.append('take', take)
  if (estado) params.append('estado', estado)

  return apiGet(`${BASE_URL}?${params.toString()}`, { signal, ...fetchOptions })
}

/**
 * Obtener cotización específica
 * @param {BigInt|string|number} idCotizacion
 */
export async function getCotizacion(idCotizacion, fetchOptions = {}) {
  return apiGet(`${BASE_URL}/${idCotizacion}`, fetchOptions)
}

/**
 * Crear cotización (guardar en borrador)
 * @param {Object} data - { idCliente, productos, componentes, moneda, observaciones }
 */
export async function createCotizacion(payload, fetchOptions = {}) {
  return apiPost(BASE_URL, payload, fetchOptions)
}

/**
 * Actualizar cotización (agregar/quitar productos, etc.)
 * @param {BigInt|string|number} idCotizacion
 * @param {Object} data - { productos, componentes, moneda, observaciones, descuento, impuestos }
 */
export async function updateCotizacion(idCotizacion, payload, fetchOptions = {}) {
  return apiPut(`${BASE_URL}/${idCotizacion}`, payload, fetchOptions)
}

/**
 * Cambiar estado de cotización
 * @param {BigInt|string|number} idCotizacion
 * @param {string} estado - 'borrador', 'enviada', 'aceptada', 'rechazada', 'cancelada'
 */
export async function changeCotizacionStatus(idCotizacion, estado, fetchOptions = {}) {
  return apiPatch(`${BASE_URL}/${idCotizacion}/status`, { estado }, fetchOptions)
}

/**
 * Eliminar cotización (solo borradores)
 * @param {BigInt|string|number} idCotizacion
 */
export async function deleteCotizacion(idCotizacion, fetchOptions = {}) {
  return apiDelete(`${BASE_URL}/${idCotizacion}`, fetchOptions)
}

/**
 * Descargar PDF de una cotización existente
 * @param {BigInt|string|number} idCotizacion
 */
export async function downloadCotizacionPdf(idCotizacion, fetchOptions = {}) {
  return apiGet(`${BASE_URL}/${idCotizacion}/pdf`, {
    responseType: 'blob',
    ...fetchOptions,
  })
}

/**
 * Crear cotización y descargar PDF directamente
 * @param {Object} data - { idCliente, productos, componentes, moneda, observaciones }
 */
export async function createAndDownloadPdf(payload, fetchOptions = {}) {
  return apiPost(`${BASE_URL}/pdf/create`, payload, {
    responseType: 'blob',
    ...fetchOptions,
  })
}

/**
 * Preview de cotización (sin guardar cambios)
 * @param {Object} data - { idCliente, productos, componentes, moneda }
 */
export async function previewCotizacion(payload, fetchOptions = {}) {
  return apiPost(`${BASE_URL}/preview/data`, payload, fetchOptions)
}

/**
 * Generar PDF de cotización (legado - usar downloadCotizacionPdf o createAndDownloadPdf)
 */
export async function generarPdfCotizacion(payload, fetchOptions = {}) {
  // Devuelve ArrayBuffer del PDF
  return apiPost('/cotizaciones/pdf/create', payload, {
    responseType: 'blob',
    ...fetchOptions,
  })
}

export default {
  getCotizaciones,
  getCotizacion,
  createCotizacion,
  updateCotizacion,
  changeCotizacionStatus,
  deleteCotizacion,
  downloadCotizacionPdf,
  createAndDownloadPdf,
  previewCotizacion,
  generarPdfCotizacion,
}

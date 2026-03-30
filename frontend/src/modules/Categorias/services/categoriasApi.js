import { apiGet, apiPost, apiPut, apiDelete } from '../../../services/api/http'

const BASE_URL = '/categorias'

function unwrapData(response) {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data
  }
  return response
}

/**
 * Obtener todas las categorías
 */
export async function getCategorias(fetchOptions = {}) {
  return unwrapData(await apiGet(BASE_URL, fetchOptions))
}

/**
 * Obtener categoría por ID
 */
export async function getCategoria(idCategoria, fetchOptions = {}) {
  return unwrapData(await apiGet(`${BASE_URL}/${idCategoria}`, fetchOptions))
}

/**
 * Crear nueva categoría
 */
export async function createCategoria(payload, fetchOptions = {}) {
  return unwrapData(await apiPost(BASE_URL, payload, fetchOptions))
}

/**
 * Actualizar categoría
 */
export async function updateCategoria(idCategoria, payload, fetchOptions = {}) {
  return unwrapData(await apiPut(`${BASE_URL}/${idCategoria}`, payload, fetchOptions))
}

/**
 * Eliminar categoría
 */
export async function deleteCategoria(idCategoria, fetchOptions = {}) {
  return unwrapData(await apiDelete(`${BASE_URL}/${idCategoria}`, fetchOptions))
}

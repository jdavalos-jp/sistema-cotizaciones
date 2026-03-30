import { apiGet, apiPost, apiPut, apiDelete } from '../../../../services/api/http'

const BASE_URL = '/componentes'

/**
 * Desenvuelve la respuesta de la API
 * Si tiene estructura { data, ... } retorna solo data
 */
function unwrapData(response) {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data
  }
  return response
}

/**
 * Listar componentes con filtros y paginación
 */
export async function getComponentes(options = {}, fetchOptions = {}) {
  const { skip = 0, take = 50, search, signal } = options
  const params = new URLSearchParams()
  params.append('skip', skip)
  params.append('take', take)
  if (search) params.append('search', search)

  return unwrapData(await apiGet(`${BASE_URL}?${params.toString()}`, { signal, ...fetchOptions }))
}

/**
 * Obtener componente por ID
 */
export async function getComponente(idComponente, fetchOptions = {}) {
  return unwrapData(await apiGet(`${BASE_URL}/${idComponente}`, fetchOptions))
}

/**
 * Crear nuevo componente
 */
export async function createComponente(payload, fetchOptions = {}) {
  return unwrapData(await apiPost(BASE_URL, payload, fetchOptions))
}

/**
 * Actualizar componente
 */
export async function updateComponente(idComponente, payload, fetchOptions = {}) {
  return unwrapData(await apiPut(`${BASE_URL}/${idComponente}`, payload, fetchOptions))
}

/**
 * Eliminar componente
 */
export async function deleteComponente(idComponente, fetchOptions = {}) {
  return unwrapData(await apiDelete(`${BASE_URL}/${idComponente}`, fetchOptions))
}

export default {
  getComponentes,
  getComponente,
  createComponente,
  updateComponente,
  deleteComponente,
}

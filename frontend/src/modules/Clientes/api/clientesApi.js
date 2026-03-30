import { apiGet, apiPost, apiPut, apiDelete } from '../../../services/api/http'

const BASE_URL = '/clientes'

function unwrapData(response) {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data
  }
  return response
}

/**
 * Listar clientes con búsqueda
 */
export async function getClientes(options = {}, fetchOptions = {}) {
  const { search = '', take = 50, signal } = options
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  params.append('take', take)

  return unwrapData(await apiGet(`${BASE_URL}?${params.toString()}`, { signal, ...fetchOptions }))
}

/**
 * Obtener cliente por ID
 */
export async function getCliente(idCliente, fetchOptions = {}) {
  return unwrapData(await apiGet(`${BASE_URL}/${idCliente}`, fetchOptions))
}

/**
 * Crear nuevo cliente
 */
export async function createCliente(payload, fetchOptions = {}) {
  return unwrapData(await apiPost(BASE_URL, payload, fetchOptions))
}

/**
 * Actualizar cliente
 */
export async function updateCliente(idCliente, payload, fetchOptions = {}) {
  return unwrapData(await apiPut(`${BASE_URL}/${idCliente}`, payload, fetchOptions))
}

/**
 * Eliminar cliente
 */
export async function deleteCliente(idCliente, fetchOptions = {}) {
  return unwrapData(await apiDelete(`${BASE_URL}/${idCliente}`, fetchOptions))
}

export default {
  getClientes,
  getCliente,
  createCliente,
  updateCliente,
  deleteCliente,
}

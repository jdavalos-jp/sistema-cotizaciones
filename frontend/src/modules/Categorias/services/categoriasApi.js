import { apiGet, apiPost, apiPut, apiDelete } from '../../../services/api/http'

const BASE_URL = '/categorias'

function unwrapData(response) {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data
  }
  return response
}

export async function getCategorias(fetchOptions = {}) {
  return unwrapData(await apiGet(BASE_URL, fetchOptions))
}

export async function getCategoria(idCategoria, fetchOptions = {}) {
  return unwrapData(await apiGet(`${BASE_URL}/${idCategoria}`, fetchOptions))
}

export async function createCategoria(payload, fetchOptions = {}) {
  return unwrapData(await apiPost(BASE_URL, payload, fetchOptions))
}

export async function updateCategoria(idCategoria, payload, fetchOptions = {}) {
  return unwrapData(await apiPut(`${BASE_URL}/${idCategoria}`, payload, fetchOptions))
}

export async function deleteCategoria(idCategoria, fetchOptions = {}) {
  return unwrapData(await apiDelete(`${BASE_URL}/${idCategoria}`, fetchOptions))
}

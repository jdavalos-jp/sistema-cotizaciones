import { apiGet } from '../../../../services/api/http'

function unwrapData(response) {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data
  }
  return response
}

export async function getSubcategorias(idCategoria, fetchOptions = {}) {
  const params = new URLSearchParams()
  if (idCategoria) params.append('idCategoria', idCategoria)
  return unwrapData(await apiGet(`/subcategorias?${params.toString()}`, fetchOptions))
}
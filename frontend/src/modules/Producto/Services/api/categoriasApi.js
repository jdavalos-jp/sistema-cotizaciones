import { apiGet } from '../../../../services/api/http'

function unwrapData(response) {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data
  }
  return response
}

export async function getCategorias(fetchOptions = {}) {
  return unwrapData(await apiGet('/categorias', fetchOptions))
}

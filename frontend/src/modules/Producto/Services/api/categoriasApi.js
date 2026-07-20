import { apiGet, unwrapData } from '../../../../services/api/http'

export async function getCategorias(fetchOptions = {}) {
  return unwrapData(await apiGet('/categorias', fetchOptions))
}

import { apiGet, unwrapData } from '../../../../services/api/http'

export async function getSubcategorias(idCategoria, fetchOptions = {}) {
  const params = new URLSearchParams()
  if (idCategoria) params.append('idCategoria', idCategoria)
  return unwrapData(await apiGet(`/subcategorias?${params.toString()}`, fetchOptions))
}
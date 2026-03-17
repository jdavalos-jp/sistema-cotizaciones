import { apiGet } from './http'

export async function fetchProductos({ search = '', take = 50, signal } = {}) {
  const qs = new URLSearchParams()
  if (search) qs.set('search', search)
  if (take) qs.set('take', String(take))
  const json = await apiGet(`/api/productos?${qs.toString()}`, { signal })
  return json.data ?? []
}

export async function fetchComponentes({ search = '', take = 50, signal } = {}) {
  const qs = new URLSearchParams()
  if (search) qs.set('search', search)
  if (take) qs.set('take', String(take))
  const json = await apiGet(`/api/componentes?${qs.toString()}`, { signal })
  return json.data ?? []
}

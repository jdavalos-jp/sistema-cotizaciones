import { apiGet } from './http'

export async function fetchClientes({ search = '', take = 20, signal } = {}) {
  const qs = new URLSearchParams()
  if (search) qs.set('search', search)
  if (take) qs.set('take', String(take))
  const json = await apiGet(`/api/clientes?${qs.toString()}`, { signal })
  return json.data ?? []
}

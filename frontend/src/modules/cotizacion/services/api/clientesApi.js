import { apiGet } from '../../../../services/api/http'

export async function fetchClientes({ search = '', take = 20, signal } = {}) {
  const qs = new URLSearchParams()
  if (search) qs.set('search', search)
  if (take) qs.set('take', String(take))
  const json = await apiGet(`/clientes?${qs.toString()}`, { signal })
  return json.data ?? []
}

export async function fetchClienteById(idCliente, { signal } = {}) {
  const json = await apiGet(`/clientes/${idCliente}`, { signal })
  return json.data ?? null
}

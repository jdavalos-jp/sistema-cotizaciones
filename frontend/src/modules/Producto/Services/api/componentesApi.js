import { apiGet } from '../../../../services/api/http'

function unwrapData(response) {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data
  }
  return response
}

export async function getComponentes(options = {}, fetchOptions = {}) {
  const { search, take = 50, signal } = options
  const params = new URLSearchParams()

  params.set('take', String(take))
  if (search?.trim()) params.set('search', search.trim())

  return unwrapData(await apiGet(`/componentes?${params.toString()}`, { signal, ...fetchOptions }))
}

export async function getComponenteById(idComponente, fetchOptions = {}) {
  return unwrapData(await apiGet(`/componentes/${idComponente}`, fetchOptions))
}

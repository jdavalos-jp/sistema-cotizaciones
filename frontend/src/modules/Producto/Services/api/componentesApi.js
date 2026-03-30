import { apiGet } from '../../../../services/api/http'

function unwrapData(response) {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data
  }
  return response
}

export async function getComponentes(fetchOptions = {}) {
  return unwrapData(await apiGet('/componentes', fetchOptions))
}

export async function getComponenteById(idComponente, fetchOptions = {}) {
  return unwrapData(await apiGet(`/componentes/${idComponente}`, fetchOptions))
}

import { apiGet } from '../../../../services/api/http'

/**
 * Busca clientes con filtro de texto y paginación.
 *
 * @param {object} options
 * @param {string} [options.search='']  - Texto de búsqueda
 * @param {number} [options.take=20]    - Cantidad máxima de resultados
 * @param {AbortSignal} [options.signal] - Signal para cancelación
 * @returns {Promise<Array>}
 */
export async function fetchClientes({ search = '', take = 20, signal } = {}) {
  const qs = new URLSearchParams()

  if (search?.trim()) qs.set('search', search.trim())

  // Guard explícito: evita enviar take=0 o valores inválidos
  if (take != null && take > 0) qs.set('take', String(take))

  const json = await apiGet(`/clientes?${qs.toString()}`, { signal })

  // Validación defensiva: el backend podría devolver null o un objeto en error silencioso
  if (!Array.isArray(json.data)) {
    console.warn('[fetchClientes] Se esperaba un array en json.data, se recibió:', json.data)
    return []
  }

  return json.data
}

/**
 * Obtiene el detalle completo de un cliente por su ID.
 *
 * @param {string|number} idCliente     - ID del cliente (requerido)
 * @param {object} options
 * @param {AbortSignal} [options.signal] - Signal para cancelación
 * @returns {Promise<object|null>}
 */
export async function fetchClienteById(idCliente, { signal } = {}) {
  // Fail-fast: evita hacer GET /clientes/undefined o /clientes/null
  if (idCliente == null || idCliente === '') {
    throw new Error('[fetchClienteById] idCliente es requerido')
  }

  const json = await apiGet(`/clientes/${idCliente}`, { signal })

  return json.data ?? null
}
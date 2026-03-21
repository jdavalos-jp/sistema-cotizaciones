import { apiGet, apiPost, apiPut, apiDelete } from '../../../cotizacion/services/api/http'

const BASE_URL = '/api/productos'

function unwrapData(response) {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data
  }
  return response
}

/**
 * Obtener todas las categorías para filtros
 */
export async function getCategorias(fetchOptions = {}) {
  return unwrapData(await apiGet(`${BASE_URL}/categorias/list`, fetchOptions))
}

/**
 * Obtener subcategorías por categoría
 */
export async function getSubcategoriasByCategoria(idCategoria, fetchOptions = {}) {
  return unwrapData(await apiGet(`${BASE_URL}/subcategorias/${idCategoria}`, fetchOptions))
}

/**
 * Listar productos con filtros
 */
export async function getProductos(options = {}, fetchOptions = {}) {
  const { skip = 0, take = 50, search, idCategoria, idSubcategoria, signal } = options
  const params = new URLSearchParams()
  params.append('skip', skip)
  params.append('take', take)
  if (search) params.append('search', search)
  if (idCategoria) params.append('idCategoria', idCategoria)
  if (idSubcategoria) params.append('idSubcategoria', idSubcategoria)

  return unwrapData(await apiGet(`${BASE_URL}?${params.toString()}`, { signal, ...fetchOptions }))
}

/**
 * Obtener producto por ID
 */
export async function getProducto(idProducto, fetchOptions = {}) {
  return unwrapData(await apiGet(`${BASE_URL}/${idProducto}`, fetchOptions))
}

/**
 * Crear nuevo producto
 */
export async function createProducto(payload, fetchOptions = {}) {
  return unwrapData(await apiPost(BASE_URL, payload, fetchOptions))
}

/**
 * Actualizar producto
 */
export async function updateProducto(idProducto, payload, fetchOptions = {}) {
  return unwrapData(await apiPut(`${BASE_URL}/${idProducto}`, payload, fetchOptions))
}

/**
 * Eliminar producto
 */
export async function deleteProducto(idProducto, fetchOptions = {}) {
  return unwrapData(await apiDelete(`${BASE_URL}/${idProducto}`, fetchOptions))
}

/**
 * Agregar imagen a producto
 */
export async function addImagenToProducto(idProducto, payload, fetchOptions = {}) {
  return unwrapData(await apiPost(`${BASE_URL}/${idProducto}/imagenes`, payload, fetchOptions))
}

/**
 * Eliminar imagen de producto
 */
export async function deleteImagenFromProducto(idImagen, fetchOptions = {}) {
  return unwrapData(await apiDelete(`${BASE_URL}/imagenes/${idImagen}`, fetchOptions))
}

export default {
  getCategorias,
  getSubcategoriasByCategoria,
  getProductos,
  getProducto,
  createProducto,
  updateProducto,
  deleteProducto,
  addImagenToProducto,
  deleteImagenFromProducto,
}

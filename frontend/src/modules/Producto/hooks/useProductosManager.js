import { useState, useCallback, useEffect } from 'react'
import * as productosApi from '../services/api/productosApi'

/**
 * Hook para gestionar lista de productos con filtros
 */
export function useProductosList() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ skip: 0, take: 50, total: 0 })
  const [filters, setFilters] = useState({
    search: '',
    idCategoria: null,
    idSubcategoria: null,
  })

  const fetchProductos = useCallback(async (newFilters = null) => {
    try {
      setLoading(true)
      setError(null)
      
      const currentFilters = newFilters ? { ...filters, ...newFilters } : filters
      
      const response = await productosApi.getProductos({
        skip: pagination.skip,
        take: pagination.take,
        search: currentFilters.search,
        idCategoria: currentFilters.idCategoria,
        idSubcategoria: currentFilters.idSubcategoria,
      })

      const rows = Array.isArray(response) ? response : []
      setProductos(rows)
      setPagination(prev => ({
        ...prev,
        total: rows.length,
      }))
    } catch (err) {
      setError(err.message || 'Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.skip, pagination.take])

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPagination(prev => ({ ...prev, skip: 0 }))
  }, [])

  const handlePagination = useCallback((skip, take) => {
    setPagination(prev => ({ ...prev, skip, take }))
  }, [])

  const refresh = useCallback(() => {
    fetchProductos()
  }, [fetchProductos])

  // Fetch en useEffect cuando cambien filtros o paginación
  useEffect(() => {
    fetchProductos()
  }, [filters, pagination.skip, pagination.take])

  return {
    productos,
    loading,
    error,
    pagination,
    filters,
    handleFilterChange,
    handlePagination,
    refresh,
  }
}

/**
 * Hook para gestionar un producto individual
 */
export function useProducto(idProducto = null) {
  const [producto, setProducto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [imagenes, setImagenes] = useState([])

  const fetchProducto = useCallback(async (id) => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      const response = await productosApi.getProducto(id)
      setProducto(response)
      setImagenes(response?.imagenes || [])
    } catch (err) {
      setError(err.message || 'Error al cargar producto')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProducto = useCallback(async (payload) => {
    if (!producto?.idProducto) {
      setError('No hay producto cargado')
      return
    }
    try {
      setError(null)
      const response = await productosApi.updateProducto(producto.idProducto, payload)
      setProducto(response)
      return response
    } catch (err) {
      setError(err.message || 'Error al actualizar producto')
      throw err
    }
  }, [producto?.idProducto])

  const createProducto = useCallback(async (payload) => {
    try {
      setError(null)
      const response = await productosApi.createProducto(payload)
      setProducto(response)
      setImagenes(response?.imagenes || [])
      return response
    } catch (err) {
      setError(err.message || 'Error al crear producto')
      throw err
    }
  }, [])

  const deleteProducto = useCallback(async (id = null) => {
    const idDelete = id || producto?.idProducto
    if (!idDelete) {
      setError('No hay producto para eliminar')
      return
    }
    try {
      setError(null)
      await productosApi.deleteProducto(idDelete)
      setProducto(null)
      setImagenes([])
      return true
    } catch (err) {
      setError(err.message || 'Error al eliminar producto')
      throw err
    }
  }, [producto?.idProducto])

  const addImagen = useCallback(async (payload) => {
    if (!producto?.idProducto) {
      setError('No hay producto cargado')
      return
    }
    try {
      setError(null)
      const response = await productosApi.addImagenToProducto(producto.idProducto, payload)
      setImagenes(prev => [...prev, response])
      return response
    } catch (err) {
      setError(err.message || 'Error al agregar imagen')
      throw err
    }
  }, [producto?.idProducto])

  const deleteImagen = useCallback(async (idImagen) => {
    try {
      setError(null)
      await productosApi.deleteImagenFromProducto(idImagen)
      setImagenes(prev => prev.filter(img => img.idImagen !== idImagen))
      return true
    } catch (err) {
      setError(err.message || 'Error al eliminar imagen')
      throw err
    }
  }, [])

  // Fetch inicial si hay idProducto
  useEffect(() => {
    if (idProducto) {
      fetchProducto(idProducto)
    }
  }, [idProducto, fetchProducto])

  return {
    producto,
    imagenes,
    loading,
    error,
    fetchProducto,
    createProducto,
    updateProducto,
    deleteProducto,
    addImagen,
    deleteImagen,
  }
}

export default {
  useProductosList,
  useProducto,
}

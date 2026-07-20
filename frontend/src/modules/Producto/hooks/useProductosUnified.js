import { useState, useCallback, useEffect } from 'react'
import * as productosApi from '../Services/api/productosApi'

/**
 * Hook unificado para gestionar productos
 * Reemplaza useProductos y useProductosList con funcionalidad completa
 */
export function useProductos(idProductoSolo = null) {
  // Estado de lista
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ 
    skip: 0, 
    take: 10, 
    total: 0,
    current: 1,
    pageSize: 10 
  })
  const [filters, setFilters] = useState({
    search: '',
    idCategoria: null,
    idSubcategoria: null,
  })

  // Estado de producto individual
  const [producto, setProducto] = useState(null)
  const [loadingProducto, setLoadingProducto] = useState(false)

  /**
   * Cargar lista de productos con filtros
   */
  const fetchProductos = useCallback(
    async (newFilters = null, newPagination = null, options = {}) => {
      try {
        setLoading(true)
        setError(null)
        
        const currentFilters = newFilters ? { ...filters, ...newFilters } : filters
        const currentPagination = newPagination
          ? { skip: pagination.skip, take: pagination.take, ...newPagination }
          : { skip: pagination.skip, take: pagination.take }

        const response = await productosApi.getProductos({
          skip: currentPagination.skip,
          take: currentPagination.take,
          search: currentFilters.search,
          idCategoria: currentFilters.idCategoria,
          idSubcategoria: currentFilters.idSubcategoria,
          signal: options.signal,
        })

        const rows = Array.isArray(response) ? response : response?.data || []
        const total = Number.isFinite(response?.meta?.total)
          ? response.meta.total
          : Number.isFinite(response?.total)
            ? response.total
            : rows.length

        setProductos(rows)
        setPagination(prev => ({ ...prev, total }))
      } catch (err) {
        if (err.name === 'AbortError') return
        setError(err.message || 'Error al cargar productos')
        setProductos([])
      } finally {
        if (!options.signal?.aborted) setLoading(false)
      }
    },
    [filters, pagination.skip, pagination.take]
  )

  /**
   * Cargar un producto individual por ID
   */
  const fetchProducto = useCallback(async (id, options = {}) => {
    if (!id) return
    try {
      setLoadingProducto(true)
      setError(null)
      const response = await productosApi.getProducto(id, { signal: options.signal })
      setProducto(response)
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message || 'Error al cargar producto')
    } finally {
      if (!options.signal?.aborted) setLoadingProducto(false)
    }
  }, [])

  /**
   * Cambiar filtros y resetear paginación
   */
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPagination(prev => ({ ...prev, skip: 0, current: 1 }))
  }, [])

  /**
   * Cambiar paginación
   */
  const handlePagination = useCallback((skipOrPage, take = null) => {
    const isPage = typeof skipOrPage === 'number' && skipOrPage < 1000
    const effectiveTake = take || pagination.take
    const newSkip = isPage ? (skipOrPage - 1) * effectiveTake : skipOrPage

    setPagination(prev => ({ 
      ...prev, 
      skip: newSkip, 
      take: effectiveTake,
      pageSize: effectiveTake,
      current: isPage ? skipOrPage : Math.floor(newSkip / effectiveTake) + 1
    }))
  }, [pagination.take])

  /**
   * Refrescar datos actuales
   */
  const refresh = useCallback(() => {
    fetchProductos()
  }, [fetchProductos])

  /**
   * Eliminar producto de la lista
   */
  const deleteProductoLocal = useCallback((idProducto) => {
    setProductos((prev) => prev.filter((p) => String(p.idProducto) !== String(idProducto)))
    setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }))
  }, [])

  const deleteProducto = useCallback(async (idProducto) => {
    try {
      setLoading(true)
      setError(null)
      await productosApi.deleteProducto(idProducto)
      deleteProductoLocal(idProducto)
      return true
    } catch (err) {
      const errorMsg = err.message || 'Error al eliminar producto'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [deleteProductoLocal])

  /**
   * Crear nuevo producto
   */
  const createProducto = useCallback(async (payload) => {
    try {
      setLoading(true)
      setError(null)
      const response = await productosApi.createProducto(payload)
      setProducto(response)
      // Agregar a lista si existe
      if (response?.idProducto) {
        setProductos(prev => [response, ...prev])
      }
      return response
    } catch (err) {
      const errorMsg = err.message || 'Error al crear producto'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Actualizar producto existente
   * Flexible: updateProducto(id, payload) o updateProducto(payload) si está en modo edición
   */
  const updateProducto = useCallback(async (idOrPayload, payloadIfId) => {
    let idProducto, payload
    
    // Si el primer arg es un objeto y es un modo edición, usar idProductoSolo
    if (typeof idOrPayload === 'object' && idProductoSolo) {
      idProducto = idProductoSolo
      payload = idOrPayload
    } else {
      // Si no, esperar: updateProducto(id, payload)
      idProducto = idOrPayload
      payload = payloadIfId
    }
    
    if (!idProducto || !payload) {
      throw new Error('updateProducto requiere ID y payload')
    }

    try {
      setLoading(true)
      setError(null)
      const response = await productosApi.updateProducto(idProducto, payload)
      setProducto(response)
      // Actualizar en lista
      setProductos(prev => 
        prev.map(p => String(p.idProducto) === String(idProducto) ? response : p)
      )
      return response
    } catch (err) {
      const errorMsg = err.message || 'Error al actualizar producto'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [idProductoSolo])

  /**
   * Auto-fetch cuando cambian filtros o paginación
   */
  useEffect(() => {
    const controller = new AbortController()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProductos(null, null, { signal: controller.signal })
    return () => controller.abort()
  }, [fetchProductos])

  /**
   * Auto-fetch de producto individual si se proporciona ID
   */
  useEffect(() => {
    if (idProductoSolo) {
      const controller = new AbortController()
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchProducto(idProductoSolo, { signal: controller.signal })
      return () => controller.abort()
    }
  }, [idProductoSolo, fetchProducto])

  return {
    // Lista
    productos,
    loading,
    error,
    pagination,
    filters,
    fetchProductos,
    handleFilterChange,
    handlePagination,
    refresh,
    deleteProductoLocal,
    
    // Individual
    producto,
    loadingProducto,
    fetchProducto,
    setProducto,
    
    // CRUD
    createProducto,
    updateProducto,
    deleteProducto,
    
    // Setters directos
    setProductos,
    setPagination,
    setFilters,
  }
}

/**
 * Hook para gestionar un producto individual (mantener compatibilidad)
 */
export function useProducto(idProducto = null) {
  const hook = useProductos(idProducto)
  return {
    producto: hook.producto,
    loading: hook.loadingProducto,
    error: hook.error,
    fetchProducto: hook.fetchProducto,
    setProducto: hook.setProducto,
    createProducto: hook.createProducto,
    updateProducto: hook.updateProducto,
  }
}

/**
 * Hook para gestionar lista de productos (mantener compatibilidad)
 */
export function useProductosList() {
  const hook = useProductos()
  return {
    productos: hook.productos,
    loading: hook.loading,
    error: hook.error,
    pagination: hook.pagination,
    filters: hook.filters,
    fetchProductos: hook.fetchProductos,
    handleFilterChange: hook.handleFilterChange,
    handlePagination: hook.handlePagination,
    refresh: hook.refresh,
    deleteProductoLocal: hook.deleteProductoLocal,
    deleteProducto: hook.deleteProducto,
  }
}

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
    take: 50, 
    total: 0,
    current: 1,
    pageSize: 50 
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
    async (newFilters = null, newPagination = null) => {
      try {
        setLoading(true)
        setError(null)
        
        const currentFilters = newFilters ? { ...filters, ...newFilters } : filters
        const currentPagination = newPagination ? { ...pagination, ...newPagination } : pagination

        const response = await productosApi.getProductos({
          skip: currentPagination.skip,
          take: currentPagination.take,
          search: currentFilters.search,
          idCategoria: currentFilters.idCategoria,
          idSubcategoria: currentFilters.idSubcategoria,
        })

        const rows = Array.isArray(response) ? response : response?.data || []
        setProductos(rows)
        
        // Actualizar total si viene en respuesta
        if (response?.total !== undefined) {
          setPagination(prev => ({ ...prev, total: response.total }))
        }
      } catch (err) {
        setError(err.message || 'Error al cargar productos')
        setProductos([])
      } finally {
        setLoading(false)
      }
    },
    [filters, pagination]
  )

  /**
   * Cargar un producto individual por ID
   */
  const fetchProducto = useCallback(async (id) => {
    if (!id) return
    try {
      setLoadingProducto(true)
      setError(null)
      const response = await productosApi.getProducto(id)
      setProducto(response)
    } catch (err) {
      setError(err.message || 'Error al cargar producto')
    } finally {
      setLoadingProducto(false)
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
    // Soporta tanto skip absoluto como page number
    const isPage = typeof skipOrPage === 'number' && skipOrPage > 0 && take
    const newSkip = isPage ? (skipOrPage - 1) * take : skipOrPage
    const newTake = take || pagination.take

    setPagination(prev => ({ 
      ...prev, 
      skip: newSkip, 
      take: newTake,
      current: isPage ? skipOrPage : Math.floor(newSkip / newTake) + 1
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
  const deletProductoLocal = useCallback((idProducto) => {
    setProductos((prev) => prev.filter((p) => p.idProducto !== idProducto))
  }, [])

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
        prev.map(p => p.idProducto === idProducto ? response : p)
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
    fetchProductos()
  }, [filters, pagination.skip, pagination.take])

  /**
   * Auto-fetch de producto individual si se proporciona ID
   */
  useEffect(() => {
    if (idProductoSolo) {
      fetchProducto(idProductoSolo)
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
    deletProductoLocal,
    
    // Individual
    producto,
    loadingProducto,
    fetchProducto,
    setProducto,
    
    // CRUD
    createProducto,
    updateProducto,
    
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
    deletProductoLocal: hook.deletProductoLocal,
  }
}

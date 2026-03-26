import { useState, useCallback } from 'react'
import { apiGet, apiPut, apiDelete } from '../../cotizacion/services/api/http'

/**
 * Hook para gestionar la lista de productos
 */
export function useProductosList() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const loadProductos = useCallback(async (options = {}) => {
    setLoading(true)
    setError(null)
    try {
      const { skip = 0, take = 10, search = '', sortField, sortOrder, ...filters } = options
      const params = new URLSearchParams()
      params.append('skip', skip)
      params.append('take', take)
      if (search) params.append('search', search)
      if (sortField) params.append('sortField', sortField)
      if (sortOrder) params.append('sortOrder', sortOrder)
      
      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'skip' && key !== 'take' && key !== 'search' && key !== 'sortField' && key !== 'sortOrder') {
          params.append(key, value)
        }
      })

      const data = await apiGet(`/productos?${params.toString()}`)
      
      setProductos(data.data || [])
      setPagination({
        current: Math.floor(skip / take) + 1,
        pageSize: take,
        total: data.total || 0,
      })
      return data.data || []
    } catch (err) {
      const errorMsg = err.message || 'Error al cargar productos'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProducto = useCallback(async (idProducto, data) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiPut(`/productos/${idProducto}`, data)
      
      setProductos((prev) =>
        prev.map((p) =>
          String(p.idProducto) === String(idProducto) ? result.data : p
        )
      )
      return result.data
    } catch (err) {
      const errorMsg = err.message || 'Error al actualizar producto'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteProducto = useCallback(async (idProducto) => {
    setLoading(true)
    setError(null)
    try {
      await apiDelete(`/productos/${idProducto}`)
      setProductos((prev) =>
        prev.filter((p) => String(p.idProducto) !== String(idProducto))
      )
    } catch (err) {
      const errorMsg = err.message || 'Error al eliminar producto'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    productos,
    loading,
    error,
    pagination,
    loadProductos,
    updateProducto,
    deleteProducto,
    setPagination,
  }
}

/**
 * Hook para gestionar la lista de componentes
 */
export function useComponentesList() {
  const [componentes, setComponentes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const loadComponentes = useCallback(async (options = {}) => {
    setLoading(true)
    setError(null)
    try {
      const { skip = 0, take = 10, search = '', sortField, sortOrder, ...filters } = options
      const params = new URLSearchParams()
      params.append('skip', skip)
      params.append('take', take)
      if (search) params.append('search', search)
      if (sortField) params.append('sortField', sortField)
      if (sortOrder) params.append('sortOrder', sortOrder)
      
      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'skip' && key !== 'take' && key !== 'search' && key !== 'sortField' && key !== 'sortOrder') {
          params.append(key, value)
        }
      })

      const response = await fetch(`/api/componentes?${params.toString()}`)
      const data = await response.json()
      
      setComponentes(data.data || [])
      setPagination({
        current: Math.floor(skip / take) + 1,
        pageSize: take,
        total: data.total || 0,
      })
      return data.data || []
    } catch (err) {
      const errorMsg = err.message || 'Error al cargar componentes'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateComponente = useCallback(async (idComponente, data) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/componentes/${idComponente}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      
      setComponentes((prev) =>
        prev.map((c) =>
          String(c.idComponente) === String(idComponente) ? result.data : c
        )
      )
      return result.data
    } catch (err) {
      const errorMsg = err.message || 'Error al actualizar componente'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteComponente = useCallback(async (idComponente) => {
    setLoading(true)
    setError(null)
    try {
      await fetch(`/api/componentes/${idComponente}`, { method: 'DELETE' })
      setComponentes((prev) =>
        prev.filter((c) => String(c.idComponente) !== String(idComponente))
      )
    } catch (err) {
      const errorMsg = err.message || 'Error al eliminar componente'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    componentes,
    loading,
    error,
    pagination,
    loadComponentes,
    updateComponente,
    deleteComponente,
    setPagination,
  }
}

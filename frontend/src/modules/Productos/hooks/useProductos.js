import { useState, useCallback } from 'react'
import { getProductos } from '../../Producto/Services/api/productosApi'

/**
 * Hook para gestionar productos
 * - Carga de productos
 * - Búsqueda y filtros
 * - Paginación
 */
export function useProductos() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ total: 0, current: 1, pageSize: 10 })

  const loadProductos = useCallback(async (skip = 0, search = '') => {
    setLoading(true)
    try {
      const response = await getProductos({
        skip,
        take: pagination.pageSize,
        search: search || undefined,
      })

      const data = Array.isArray(response) ? response : response?.data || []
      setProductos(data)

      if (response?.total !== undefined) {
        setPagination((prev) => ({ ...prev, total: response.total }))
      }
    } catch (error) {
      console.error('Error cargando productos:', error)
      setProductos([])
      throw error
    } finally {
      setLoading(false)
    }
  }, [pagination.pageSize])

  const deleteProducto = useCallback((idProducto) => {
    setProductos((prev) => prev.filter((p) => p.idProducto !== idProducto))
  }, [])

  return {
    productos,
    loading,
    pagination,
    loadProductos,
    deleteProducto,
    setPagination,
  }
}

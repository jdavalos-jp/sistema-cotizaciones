import { useState, useCallback } from 'react'
import * as categoriasApi from '../services/categoriasApi'

/**
 * Hook para gestionar categorías con subcategorías
 */
export function useCategorias() {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ total: 0, current: 1, pageSize: 10 })

  const loadCategorias = useCallback(async (skip = 0, search = '') => {
    setLoading(true)
    try {
      const response = await categoriasApi.getCategorias()
      if (response) {
        const data = Array.isArray(response) ? response : response.data || []
        
        // Si hay búsqueda, filtrar categorías
        const filtered = search 
          ? data.filter(cat => cat.nombre.toLowerCase().includes(search.toLowerCase()))
          : data
        
        // Aplicar paginación
        const total = filtered.length
        const paginatedData = filtered.slice(skip, skip + pagination.pageSize)
        
        setCategorias(paginatedData)
        setPagination((prev) => ({ ...prev, total }))
      }
    } catch (error) {
      console.error('Error loading categorías:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [pagination.pageSize])

  const deleteCategoria = useCallback((idCategoria) => {
    setCategorias((prev) => prev.filter((c) => c.idCategoria !== idCategoria))
  }, [])

  return {
    categorias,
    loading,
    pagination,
    loadCategorias,
    deleteCategoria,
    setPagination,
  }
}

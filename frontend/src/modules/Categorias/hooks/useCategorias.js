import { useState, useCallback } from 'react'

/**
 * Hook para gestionar categorías
 */
export function useCategorias() {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ total: 0, current: 1, pageSize: 10 })

  const loadCategorias = useCallback(async (skip = 0, search = '') => {
    setLoading(true)
    try {
      // TODO: Conectar con API de categorías
      setCategorias([])
    } catch (error) {
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

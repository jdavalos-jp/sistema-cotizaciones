import { useState, useCallback } from 'react'

/**
 * Hook para gestionar componentes
 */
export function useComponentes() {
  const [componentes, setComponentes] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ total: 0, current: 1, pageSize: 10 })

  const loadComponentes = useCallback(async (skip = 0, search = '') => {
    setLoading(true)
    try {
      // TODO: Conectar con API de componentes
      setComponentes([])
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [pagination.pageSize])

  const deleteComponente = useCallback((idComponente) => {
    setComponentes((prev) => prev.filter((c) => c.idComponente !== idComponente))
  }, [])

  return {
    componentes,
    loading,
    pagination,
    loadComponentes,
    deleteComponente,
    setPagination,
  }
}

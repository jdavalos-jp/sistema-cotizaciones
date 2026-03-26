import { useState, useCallback } from 'react'

/**
 * Hook para gestionar proformas
 */
export function useProformas() {
  const [proformas, setProformas] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ total: 0, current: 1, pageSize: 10 })

  const loadProformas = useCallback(async (skip = 0, search = '') => {
    setLoading(true)
    try {
      // TODO: Conectar con API de proformas
      setProformas([])
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [pagination.pageSize])

  const deleteProforma = useCallback((idProforma) => {
    setProformas((prev) => prev.filter((p) => p.id !== idProforma))
  }, [])

  return {
    proformas,
    loading,
    pagination,
    loadProformas,
    deleteProforma,
    setPagination,
  }
}

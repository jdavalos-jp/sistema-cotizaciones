import { useState, useCallback, useEffect } from 'react'
import * as componentesApi from '../Services/api/componentesApi'

/**
 * Hook para gestionar componentes
 * Maneja lista, paginación y búsqueda
 */
export function useComponentes() {
  const [componentes, setComponentes] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ total: 0, current: 1, pageSize: 10 })

  const loadComponentes = useCallback(async (skip = 0, search = '') => {
    setLoading(true)
    try {
      const response = await componentesApi.getComponentes({
        skip,
        take: pagination.pageSize,
        search,
      })

      const data = Array.isArray(response) ? response : response?.data || []
      setComponentes(data)

      if (response?.total !== undefined) {
        setPagination((prev) => ({ ...prev, total: response.total }))
      }
    } catch (error) {
      console.error('Error loading componentes:', error)
      setComponentes([])
      throw error
    } finally {
      setLoading(false)
    }
  }, [pagination.pageSize])

  const deleteComponente = useCallback(async (idComponente) => {
    try {
      await componentesApi.deleteComponente(idComponente)
      setComponentes((prev) => prev.filter((c) => c.idComponente !== idComponente))
      return true
    } catch (error) {
      console.error('Error deleting componente:', error)
      throw error
    }
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

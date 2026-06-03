import { useState, useCallback } from 'react'
import * as componentesApi from '../Services/api/componentesApi'

/**
 * Hook para gestionar componentes
 * Maneja lista, paginación y búsqueda
 */
export function useComponentes() {
  const [componentes, setComponentes] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ total: 0, current: 1, pageSize: 10 })

  const loadComponentes = useCallback(async (skip = 0, search = '', options = {}) => {
    setLoading(true)
    try {
      const response = await componentesApi.getComponentes({
        skip,
        take: pagination.pageSize,
        search,
        signal: options.signal,
      })

      const data = Array.isArray(response) ? response : response?.data || []
      const total = Number.isFinite(response?.meta?.total)
        ? response.meta.total
        : Number.isFinite(response?.total)
          ? response.total
          : data.length

      setComponentes(data)
      setPagination((prev) => ({ ...prev, total }))
    } catch (error) {
      if (error.name === 'AbortError') return
      setComponentes([])
      throw error
    } finally {
      if (!options.signal?.aborted) setLoading(false)
    }
  }, [pagination.pageSize])

  const deleteComponente = useCallback(async (idComponente) => {
    await componentesApi.deleteComponente(idComponente)
    setComponentes((prev) => prev.filter((c) => String(c.idComponente) !== String(idComponente)))
    setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }))
    return true
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

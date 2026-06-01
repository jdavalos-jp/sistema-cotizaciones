import { useState, useCallback } from 'react'
import { apiGet } from '../../../services/api/http'

/**
 * Hook para gestionar clientes
 * - Carga de clientes
 * - Búsqueda y filtros
 * - Paginación
 */
export function useClientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ total: 0, current: 1, pageSize: 10 })

  const loadClientes = useCallback(async ({ page = 1, pageSize = 10, search = '', signal } = {}) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      const safePage = Number.isFinite(page) && page > 0 ? page : 1
      const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10
      const skip = (safePage - 1) * safePageSize

      if (search?.trim()) params.set('search', search.trim())
      params.set('take', String(safePageSize))
      params.set('skip', String(skip))

      const result = await apiGet(`/clientes?${params.toString()}`, { signal })
      const clientesData = Array.isArray(result?.data) ? result.data : []
      const total = Number.isFinite(result?.meta?.total) ? result.meta.total : clientesData.length

      setClientes(clientesData)
      setPagination((prev) => ({
        ...prev,
        current: safePage,
        pageSize: safePageSize,
        total,
      }))
    } catch (error) {
      if (error.name === 'AbortError') return
      setClientes([])
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteCliente = useCallback((idCliente) => {
    setClientes((prev) => prev.filter((c) => c.idCliente !== idCliente))
  }, [])

  return {
    clientes,
    loading,
    pagination,
    loadClientes,
    deleteCliente,
    setPagination,
  }
}

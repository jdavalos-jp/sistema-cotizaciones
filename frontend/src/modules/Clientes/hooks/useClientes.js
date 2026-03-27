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

  const loadClientes = useCallback(async (skip = 0, search = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      // Usar take grande para obtener todos los clientes disponibles
      params.set('take', '200')

      const result = await apiGet(`/clientes?${params.toString()}`)
      const clientesData = result.data ?? result ?? []
      setClientes(clientesData)
      setPagination((prev) => ({
        ...prev,
        total: clientesData.length,
      }))
    } catch (error) {
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

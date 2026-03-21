import { useState, useCallback } from 'react'

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
      // TODO: Conectar con API de clientes
      setClientes([])
    } catch (error) {
      console.error('Error cargando clientes:', error)
      setClientes([])
      throw error
    } finally {
      setLoading(false)
    }
  }, [pagination.pageSize])

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

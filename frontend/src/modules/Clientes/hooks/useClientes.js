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
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
      const qs = new URLSearchParams()
      if (search) qs.set('search', search)
      // Usar take grande para obtener todos los clientes disponibles
      qs.set('take', '200')

      const response = await fetch(`${apiBaseUrl}/clientes?${qs.toString()}`)
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const result = await response.json()
      const clientesData = result.data ?? []
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

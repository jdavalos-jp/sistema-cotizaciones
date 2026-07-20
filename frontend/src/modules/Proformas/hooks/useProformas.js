import { useState, useCallback } from 'react'
import { apiGet } from '../../../services/api/http'

export function useProformas() {
  const [proformas, setProformas] = useState([])
  const [loading, setLoading] = useState(false)
  const [moduloEnConstruccion, setModuloEnConstruccion] = useState(false)
  const [pagination, setPagination] = useState({ total: 0, current: 1, pageSize: 10 })

  const loadProformas = useCallback(async (skip = 0, search = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('skip', String(skip))
      params.append('take', String(pagination.pageSize))
      if (search?.trim()) params.append('search', search.trim())

      const data = await apiGet(`/proformas?${params.toString()}`)
      setProformas(data?.items || data || [])
      setModuloEnConstruccion(false)
    } catch {
      setProformas([])
      setModuloEnConstruccion(true)
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
    moduloEnConstruccion,
    pagination,
    loadProformas,
    deleteProforma,
    setPagination,
  }
}

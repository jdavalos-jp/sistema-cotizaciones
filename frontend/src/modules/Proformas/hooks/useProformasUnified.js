import { useState, useCallback, useEffect } from 'react'

/**
 * Hook unificado para gestionar proformas
 * Maneja lista, paginación, filtros y operaciones CRUD
 * NOTA: El backend aún no tiene endpoints. Implementar cuando esté disponible.
 */
export function useProformas(idProformaEdit = null) {
  // Estado de lista
  const [proformas, setProformas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    skip: 0,
    take: 50,
    total: 0,
    current: 1,
    pageSize: 50,
  })
  const [filters, setFilters] = useState({ search: '' })

  // Estado de proforma individual
  const [proforma, setProforma] = useState(null)
  const [loadingProforma, setLoadingProforma] = useState(false)

  /**
   * Cargar lista de proformas con búsqueda y paginación
   * TODO: Conectar con API de proformas cuando esté disponible
   */
  const fetchProformas = useCallback(
    async (newFilters = null, newPagination = null) => {
      try {
        setLoading(true)
        setError(null)

        // TODO: Implementar cuando backend y API esté lista
        // const currentFilters = newFilters ? { ...filters, ...newFilters } : filters
        // const currentPagination = newPagination ? { ...pagination, ...newPagination } : pagination
        // const response = await proformasApi.getProformas({...})
        
        setProformas([])
      } catch (err) {
        setError(err.message || 'Error al cargar proformas')
        setProformas([])
      } finally {
        setLoading(false)
      }
    },
    [filters, pagination]
  )

  /**
   * Cargar proforma individual por ID
   * TODO: Conectar con API cuando esté disponible
   */
  const fetchProforma = useCallback(async (id) => {
    if (!id) return
    try {
      setLoadingProforma(true)
      setError(null)
      // const response = await proformasApi.getProforma(id)
      // setProforma(response)
    } catch (err) {
      setError(err.message || 'Error al cargar proforma')
    } finally {
      setLoadingProforma(false)
    }
  }, [])

  /**
   * Cambiar filtros y resetear paginación
   */
  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setPagination((prev) => ({ ...prev, skip: 0, current: 1 }))
  }, [])

  /**
   * Cambiar paginación
   */
  const handlePagination = useCallback((skipOrPage, take = null) => {
    const isPage = typeof skipOrPage === 'number' && skipOrPage > 0 && take
    const newSkip = isPage ? (skipOrPage - 1) * take : skipOrPage
    const newTake = take || pagination.take

    setPagination((prev) => ({
      ...prev,
      skip: newSkip,
      take: newTake,
      current: isPage ? skipOrPage : Math.floor(newSkip / newTake) + 1,
    }))
  }, [pagination.take])

  /**
   * Refrescar lista
   */
  const refresh = useCallback(() => {
    fetchProformas()
  }, [fetchProformas])

  /**
   * Eliminar proforma de la lista
   */
  const deleteProformaLocal = useCallback((idProforma) => {
    setProformas((prev) => prev.filter((p) => p.idProforma !== idProforma))
  }, [])

  /**
   * Crear nueva proforma
   * TODO: Conectar con API cuando esté disponible
   */
  const createProforma = useCallback(
    async (payload) => {
      try {
        setLoading(true)
        setError(null)
        // const response = await proformasApi.createProforma(payload)
        // setProforma(response)
        // if (response?.idProforma) {
        //   setProformas((prev) => [response, ...prev])
        // }
        // return response
      } catch (err) {
        const errorMsg = err.message || 'Error al crear proforma'
        setError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  /**
   * Actualizar proforma existente
   * TODO: Conectar con API cuando esté disponible
   */
  const updateProforma = useCallback(
    async (idOrPayload, payloadIfId) => {
      let idProforma, payload

      if (typeof idOrPayload === 'object' && idProformaEdit) {
        idProforma = idProformaEdit
        payload = idOrPayload
      } else {
        idProforma = idOrPayload
        payload = payloadIfId
      }

      if (!idProforma || !payload) {
        throw new Error('updateProforma requiere ID y payload')
      }

      try {
        setLoading(true)
        setError(null)
        // const response = await proformasApi.updateProforma(idProforma, payload)
        // setProforma(response)
        // setProformas((prev) =>
        //   prev.map((p) => (p.idProforma === idProforma ? response : p))
        // )
        // return response
      } catch (err) {
        const errorMsg = err.message || 'Error al actualizar proforma'
        setError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [idProformaEdit]
  )

  /**
   * Eliminar proforma
   * TODO: Conectar con API cuando esté disponible
   */
  const deleteProforma = useCallback(async (idProforma) => {
    try {
      setLoading(true)
      setError(null)
      // await proformasApi.deleteProforma(idProforma)
      deleteProformaLocal(idProforma)
      return true
    } catch (err) {
      const errorMsg = err.message || 'Error al eliminar proforma'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [deleteProformaLocal])

  /**
   * Auto-fetch cuando cambian filtros o paginación
   */
  useEffect(() => {
    fetchProformas()
  }, [filters, pagination.skip, pagination.take])

  /**
   * Auto-fetch de proforma individual si se proporciona ID
   */
  useEffect(() => {
    if (idProformaEdit) {
      fetchProforma(idProformaEdit)
    }
  }, [idProformaEdit, fetchProforma])

  return {
    // Lista
    proformas,
    loading,
    error,
    pagination,
    filters,
    fetchProformas,
    handleFilterChange,
    handlePagination,
    refresh,
    deleteProformaLocal,

    // Individual
    proforma,
    loadingProforma,
    fetchProforma,
    setProforma,

    // CRUD
    createProforma,
    updateProforma,
    deleteProforma,

    // Setters directos
    setProformas,
    setPagination,
    setFilters,
  }
}

/**
 * Hook compat para gestionar una proforma individual
 */
export function useProforma(idProforma = null) {
  const hook = useProformas(idProforma)
  return {
    proforma: hook.proforma,
    loading: hook.loadingProforma,
    error: hook.error,
    fetchProforma: hook.fetchProforma,
    setProforma: hook.setProforma,
    createProforma: hook.createProforma,
    updateProforma: hook.updateProforma,
    deleteProforma: hook.deleteProforma,
  }
}

export default {
  useProformas,
  useProforma,
}

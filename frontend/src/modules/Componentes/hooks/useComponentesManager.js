import { useState, useCallback, useEffect } from 'react'
import * as componentesApi from '../Services/api/componentesApi'

export function useComponentesManager(idComponenteEdit = null) {
  // Estado de lista
  const [componentes, setComponentes] = useState([])
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

  // Estado de componente individual
  const [componente, setComponente] = useState(null)
  const [loadingComponente, setLoadingComponente] = useState(false)

  /**
   * Cargar lista de componentes
   */
  const fetchComponentes = useCallback(
    async (newFilters = null, newPagination = null, options = {}) => {
      try {
        setLoading(true)
        setError(null)

        const currentFilters = newFilters ? { ...filters, ...newFilters } : filters
        const currentPagination = newPagination
          ? { skip: pagination.skip, take: pagination.take, ...newPagination }
          : { skip: pagination.skip, take: pagination.take }

        const response = await componentesApi.getComponentes({
          skip: currentPagination.skip,
          take: currentPagination.take,
          search: currentFilters.search,
          signal: options.signal,
        })

        const rows = Array.isArray(response) ? response : response?.data || []
        const total = Number.isFinite(response?.meta?.total)
          ? response.meta.total
          : Number.isFinite(response?.total)
            ? response.total
            : rows.length

        setComponentes(rows)
        setPagination((prev) => ({ ...prev, total }))
      } catch (err) {
        if (err.name === 'AbortError') return
        setError(err.message || 'Error al cargar componentes')
        setComponentes([])
      } finally {
        if (!options.signal?.aborted) setLoading(false)
      }
    },
    [filters, pagination.skip, pagination.take]
  )

  const fetchComponente = useCallback(async (id, options = {}) => {
    if (!id) return
    try {
      setLoadingComponente(true)
      setError(null)
      const response = await componentesApi.getComponente(id, { signal: options.signal })
      setComponente(response)
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message || 'Error al cargar componente')
    } finally {
      if (!options.signal?.aborted) setLoadingComponente(false)
    }
  }, [])

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setPagination((prev) => ({ ...prev, skip: 0, current: 1 }))
  }, [])

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

  const refresh = useCallback(() => {
    fetchComponentes()
  }, [fetchComponentes])

  const deleteComponenteLocal = useCallback((idComponente) => {
    setComponentes((prev) => prev.filter((c) => String(c.idComponente) !== String(idComponente)))
    setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }))
  }, [])

  const createComponente = useCallback(
    async (payload) => {
      try {
        setLoading(true)
        setError(null)
        const response = await componentesApi.createComponente(payload)
        setComponente(response)
        if (response?.idComponente) {
          setComponentes((prev) => [response, ...prev])
          setPagination((prev) => ({ ...prev, total: prev.total + 1 }))
        }
        return response
      } catch (err) {
        const errorMsg = err.message || 'Error al crear componente'
        setError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const updateComponente = useCallback(
    async (idOrPayload, payloadIfId) => {
      let idComponente, payload

      if (typeof idOrPayload === 'object' && idComponenteEdit) {
        idComponente = idComponenteEdit
        payload = idOrPayload
      } else {
        idComponente = idOrPayload
        payload = payloadIfId
      }

      if (!idComponente || !payload) {
        throw new Error('updateComponente requiere ID y payload')
      }

      try {
        setLoading(true)
        setError(null)
        const response = await componentesApi.updateComponente(idComponente, payload)
        setComponente(response)
        setComponentes((prev) =>
          prev.map((c) => (String(c.idComponente) === String(idComponente) ? response : c))
        )
        return response
      } catch (err) {
        const errorMsg = err.message || 'Error al actualizar componente'
        setError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [idComponenteEdit]
  )

  const deleteComponente = useCallback(async (idComponente) => {
    try {
      setLoading(true)
      setError(null)
      await componentesApi.deleteComponente(idComponente)
      deleteComponenteLocal(idComponente)
      return true
    } catch (err) {
      const errorMsg = err.message || 'Error al eliminar componente'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [deleteComponenteLocal])

  /**
   * Auto-fetch cuando cambian filtros o paginación
   */
  useEffect(() => {
    const controller = new AbortController()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchComponentes(null, null, { signal: controller.signal })
    return () => controller.abort()
  }, [fetchComponentes])

  /**
   * Auto-fetch de componente individual si se proporciona ID
   */
  useEffect(() => {
    if (idComponenteEdit) {
      const controller = new AbortController()
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchComponente(idComponenteEdit, { signal: controller.signal })
      return () => controller.abort()
    }
  }, [idComponenteEdit, fetchComponente])

  return {
    componentes,
    loading,
    error,
    pagination,
    filters,
    fetchComponentes,
    handleFilterChange,
    handlePagination,
    refresh,
    deleteComponenteLocal,
    componente,
    loadingComponente,
    fetchComponente,
    setComponente,
    createComponente,
    updateComponente,
    deleteComponente,
    setComponentes,
    setPagination,
    setFilters,
  }
}

export function useComponente(idComponente = null) {
  const hook = useComponentesManager(idComponente)
  const [productosComponente, setProductosComponente] = useState([])
  const [loadingProductos, setLoadingProductos] = useState(false)

  useEffect(() => {
    if (!idComponente) {
   
      setProductosComponente([])
      return
    }
    const controller = new AbortController()

    const fetchProductos = async () => {
      try {
        setLoadingProductos(true)
        const productos = await componentesApi.getProductosDelComponente(idComponente, { signal: controller.signal })
        setProductosComponente(productos || [])
      } catch (err) {
        if (err.name === 'AbortError') return
        setProductosComponente([])
      } finally {
        if (!controller.signal.aborted) setLoadingProductos(false)
      }
    }

    fetchProductos()
    return () => controller.abort()
  }, [idComponente])

  return {
    componente: {
      ...hook.componente,
      productos: productosComponente, 
    },
    loading: hook.loadingComponente || loadingProductos,
    error: hook.error,
    fetchComponente: hook.fetchComponente,
    setComponente: hook.setComponente,
    createComponente: hook.createComponente,
    updateComponente: hook.updateComponente,
    deleteComponente: hook.deleteComponente,
    productosComponente,
    loadingProductos,
  }
}

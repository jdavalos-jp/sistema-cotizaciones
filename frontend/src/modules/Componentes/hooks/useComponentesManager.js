import { useState, useCallback, useEffect } from 'react'
import * as componentesApi from '../Services/api/componentesApi'

/**
 * Hook unificado para gestionar componentes
 * Maneja lista, paginación, filtros y operaciones CRUD
 */
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
    async (newFilters = null, newPagination = null) => {
      try {
        setLoading(true)
        setError(null)

        const currentFilters = newFilters ? { ...filters, ...newFilters } : filters
        const currentPagination = newPagination ? { ...pagination, ...newPagination } : pagination

        const response = await componentesApi.getComponentes({
          skip: currentPagination.skip,
          take: currentPagination.take,
          search: currentFilters.search,
        })

        const rows = Array.isArray(response) ? response : response?.data || []
        setComponentes(rows)

        if (response?.total !== undefined) {
          setPagination((prev) => ({ ...prev, total: response.total }))
        }
      } catch (err) {
        setError(err.message || 'Error al cargar componentes')
        setComponentes([])
      } finally {
        setLoading(false)
      }
    },
    [filters, pagination]
  )

  /**
   * Cargar componente individual por ID
   */
  const fetchComponente = useCallback(async (id) => {
    if (!id) return
    try {
      setLoadingComponente(true)
      setError(null)
      const response = await componentesApi.getComponente(id)
      setComponente(response)
    } catch (err) {
      setError(err.message || 'Error al cargar componente')
    } finally {
      setLoadingComponente(false)
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
    fetchComponentes()
  }, [fetchComponentes])

  /**
   * Eliminar componente de la lista
   */
  const deleteComponenteLocal = useCallback((idComponente) => {
    setComponentes((prev) => prev.filter((c) => c.idComponente !== idComponente))
  }, [])

  /**
   * Crear nuevo componente
   */
  const createComponente = useCallback(
    async (payload) => {
      try {
        setLoading(true)
        setError(null)
        const response = await componentesApi.createComponente(payload)
        setComponente(response)
        if (response?.idComponente) {
          setComponentes((prev) => [response, ...prev])
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

  /**
   * Actualizar componente existente
   */
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
          prev.map((c) => (c.idComponente === idComponente ? response : c))
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

  /**
   * Eliminar componente (llamar a API)
   */
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
    fetchComponentes()
  }, [filters, pagination.skip, pagination.take])

  /**
   * Auto-fetch de componente individual si se proporciona ID
   */
  useEffect(() => {
    if (idComponenteEdit) {
      fetchComponente(idComponenteEdit)
    }
  }, [idComponenteEdit, fetchComponente])

  return {
    // Lista
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

    // Individual
    componente,
    loadingComponente,
    fetchComponente,
    setComponente,

    // CRUD
    createComponente,
    updateComponente,
    deleteComponente,

    // Setters directos
    setComponentes,
    setPagination,
    setFilters,
  }
}

/**
 * Hook compat para gestionar un componente individual
 * Ahora también carga productos asociados cuando se edita
 */
export function useComponente(idComponente = null) {
  const hook = useComponentesManager(idComponente)
  const [productosComponente, setProductosComponente] = useState([])
  const [loadingProductos, setLoadingProductos] = useState(false)

  /**
   * Cargar productos del componente (para edición)
   */
  useEffect(() => {
    if (!idComponente) {
      setProductosComponente([])
      return
    }

    const fetchProductos = async () => {
      try {
        setLoadingProductos(true)
        const productos = await componentesApi.getProductosDelComponente(idComponente)
        setProductosComponente(productos || [])
      } catch (err) {
        console.error('Error cargando productos del componente:', err)
        setProductosComponente([])
      } finally {
        setLoadingProductos(false)
      }
    }

    fetchProductos()
  }, [idComponente])

  return {
    componente: {
      ...hook.componente,
      productos: productosComponente, // Agregar productos al objeto componente
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

import { useState, useCallback } from 'react'
import {
  getCotizaciones,
  getCotizacion,
  createCotizacion,
  updateCotizacion,
  changeCotizacionStatus,
  deleteCotizacion,
  downloadCotizacionPdf,
} from '../../cotizacion/services/api/cotizacionesApi'

export function useCotizacionesList() {
  const [cotizaciones, setCotizaciones] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ total: 0, skip: 0, take: 10 })

  const loadCotizaciones = useCallback(async (options = {}) => {
    setLoading(true)
    setError(null)
    try {
      const response = await getCotizaciones(options)
      const rows = Array.isArray(response?.data) ? response.data : []
      const total = Number.isFinite(response?.meta?.total)
        ? response.meta.total
        : Number.isFinite(response?.total)
          ? response.total
          : rows.length

      setCotizaciones(rows)
      setPagination({
        total,
        skip: Number(response?.meta?.skip ?? options.skip ?? 0),
        take: Number(response?.meta?.take ?? options.take ?? rows.length),
      })
      return rows
    } catch (err) {
      if (err.name === 'AbortError') return []
      const errorMsg = err.message || 'Error al cargar cotizaciones'
      setError(errorMsg)
      throw err
    } finally {
      if (!options.signal?.aborted) setLoading(false)
    }
  }, [])

  const createNew = useCallback(async (data) => {
    setLoading(true)
    setError(null)
    try {
      const response = await createCotizacion(data)
      const newCotizacion = response.data
      setCotizaciones((prev) => [newCotizacion, ...prev])
      setPagination((prev) => ({ ...prev, total: prev.total + 1 }))
      return newCotizacion
    } catch (err) {
      const errorMsg = err.message || 'Error al crear cotizacion'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const remove = useCallback(async (idCotizacion) => {
    setLoading(true)
    setError(null)
    try {
      await deleteCotizacion(idCotizacion)
      setCotizaciones((prev) =>
        prev.filter((cotizacion) => String(cotizacion.idCotizacion) !== String(idCotizacion))
      )
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }))
    } catch (err) {
      const errorMsg = err.message || 'Error al eliminar cotizacion'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const changeStatus = useCallback(async (idCotizacion, estado) => {
    setLoading(true)
    setError(null)
    try {
      const response = await changeCotizacionStatus(idCotizacion, estado)
      const updated = response.data
      setCotizaciones((prev) =>
        prev.map((cotizacion) =>
          String(cotizacion.idCotizacion) === String(idCotizacion) ? updated : cotizacion
        )
      )
      return updated
    } catch (err) {
      const errorMsg = err.message || 'Error al cambiar estado'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    cotizaciones,
    loading,
    error,
    pagination,
    loadCotizaciones,
    createNew,
    remove,
    changeStatus,
  }
}

export function useCotizacion(idCotizacion) {
  const [cotizacion, setCotizacion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async (options = {}) => {
    if (!idCotizacion) {
      setCotizacion(null)
      return null
    }

    setLoading(true)
    setError(null)
    try {
      const response = await getCotizacion(idCotizacion, { signal: options.signal })
      setCotizacion(response.data)
      return response.data
    } catch (err) {
      if (err.name === 'AbortError') return null
      const errorMsg = err.message || 'Error al cargar cotizacion'
      setError(errorMsg)
      throw err
    } finally {
      if (!options.signal?.aborted) setLoading(false)
    }
  }, [idCotizacion])

  const update = useCallback(
    async (data) => {
      if (!idCotizacion) throw new Error('ID de cotizacion no disponible')

      setLoading(true)
      setError(null)
      try {
        const response = await updateCotizacion(idCotizacion, data)
        const updated = response.data
        setCotizacion(updated)
        return updated
      } catch (err) {
        const errorMsg = err.message || 'Error al actualizar cotizacion'
        setError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [idCotizacion]
  )

  const changeStatus = useCallback(
    async (estado) => {
      if (!idCotizacion) throw new Error('ID de cotizacion no disponible')

      setLoading(true)
      setError(null)
      try {
        const response = await changeCotizacionStatus(idCotizacion, estado)
        const updated = response.data
        setCotizacion(updated)
        return updated
      } catch (err) {
        const errorMsg = err.message || 'Error al cambiar estado'
        setError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [idCotizacion]
  )

  const downloadPdf = useCallback(async () => {
    if (!idCotizacion) throw new Error('ID de cotizacion no disponible')

    setLoading(true)
    setError(null)
    try {
      return await downloadCotizacionPdf(idCotizacion)
    } catch (err) {
      const errorMsg = err.message || 'Error al descargar PDF'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [idCotizacion])

  return {
    cotizacion,
    loading,
    error,
    load,
    update,
    changeStatus,
    downloadPdf,
  }
}

export default { useCotizacionesList, useCotizacion }

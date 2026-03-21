import { useState, useCallback } from 'react'
import {
  getCotizaciones,
  getCotizacion,
  createCotizacion,
  updateCotizacion,
  changeCotizacionStatus,
  deleteCotizacion,
  downloadCotizacionPdf,
} from '../services/api/cotizacionesApi'

/**
 * Hook para gestionar cotizaciones
 * Proporciona métodos para listar, crear, actualizar, eliminar y cambiar estado de cotizaciones
 */
export function useCotizacionesList() {
  const [cotizaciones, setCotizaciones] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadCotizaciones = useCallback(async (options = {}) => {
    setLoading(true)
    setError(null)
    try {
      const response = await getCotizaciones(options)
      setCotizaciones(response.data || [])
      return response.data || []
    } catch (err) {
      const errorMsg = err.message || 'Error al cargar cotizaciones'
      setError(errorMsg)
      console.error(errorMsg, err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createNew = useCallback(async (data) => {
    setLoading(true)
    setError(null)
    try {
      const response = await createCotizacion(data)
      const newCotizacion = response.data
      setCotizaciones((prev) => [newCotizacion, ...prev])
      return newCotizacion
    } catch (err) {
      const errorMsg = err.message || 'Error al crear cotización'
      setError(errorMsg)
      console.error(errorMsg, err)
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
        prev.filter((c) => String(c.idCotizacion) !== String(idCotizacion))
      )
    } catch (err) {
      const errorMsg = err.message || 'Error al eliminar cotización'
      setError(errorMsg)
      console.error(errorMsg, err)
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
        prev.map((c) =>
          String(c.idCotizacion) === String(idCotizacion) ? updated : c
        )
      )
      return updated
    } catch (err) {
      const errorMsg = err.message || 'Error al cambiar estado'
      setError(errorMsg)
      console.error(errorMsg, err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    cotizaciones,
    loading,
    error,
    loadCotizaciones,
    createNew,
    remove,
    changeStatus,
  }
}

/**
 * Hook para trabajar con una cotización específica
 */
export function useCotizacion(idCotizacion) {
  const [cotizacion, setCotizacion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!idCotizacion) {
      setCotizacion(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await getCotizacion(idCotizacion)
      setCotizacion(response.data)
      return response.data
    } catch (err) {
      const errorMsg = err.message || 'Error al cargar cotización'
      setError(errorMsg)
      console.error(errorMsg, err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [idCotizacion])

  const update = useCallback(
    async (data) => {
      if (!idCotizacion) throw new Error('ID de cotización no disponible')

      setLoading(true)
      setError(null)
      try {
        const response = await updateCotizacion(idCotizacion, data)
        const updated = response.data
        setCotizacion(updated)
        return updated
      } catch (err) {
        const errorMsg = err.message || 'Error al actualizar cotización'
        setError(errorMsg)
        console.error(errorMsg, err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [idCotizacion]
  )

  const changeStatus = useCallback(
    async (estado) => {
      if (!idCotizacion) throw new Error('ID de cotización no disponible')

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
        console.error(errorMsg, err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [idCotizacion]
  )

  const downloadPdf = useCallback(async () => {
    if (!idCotizacion) throw new Error('ID de cotización no disponible')

    setLoading(true)
    setError(null)
    try {
      const blob = await downloadCotizacionPdf(idCotizacion)
      return blob
    } catch (err) {
      const errorMsg = err.message || 'Error al descargar PDF'
      setError(errorMsg)
      console.error(errorMsg, err)
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

import { useState, useCallback, useEffect } from 'react'
import {
  uploadImagenProducto,
  getImagenesProducto,
  setImagenPrincipal,
  deleteImagenProducto,
  uploadImagenCotizacion,
  getImagenesCotizacion,
  deleteImagenCotizacion,
  uploadImagenComponente,
  getImagenesComponente,
  setImagenComponentePrincipal,
  deleteImagenComponente,
  validarImagen,
} from '../services/api/imagenes'

export function useImagenesProducto(idProducto) {
  const [imagenes, setImagenes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const cargarImagenes = useCallback(async () => {
    if (!idProducto) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await getImagenesProducto(idProducto)
      setImagenes(data || [])
    } catch (err) {
      setError(err.message)
      setImagenes([])
    } finally {
      setLoading(false)
    }
  }, [idProducto])

  useEffect(() => {
    cargarImagenes()
  }, [cargarImagenes])

  const subirImagen = useCallback(async (file) => {
    setError(null)

    const erroresValidacion = validarImagen(file)
    if (erroresValidacion.length > 0) {
      setError(erroresValidacion.join('. '))
      return null
    }

    try {
      setLoading(true)
      const resultado = await uploadImagenProducto(idProducto, file)

      setImagenes((prev) => [...prev, resultado.data])
      return resultado.data
    } catch (err) {
      setError(err.message || 'Error al subir')
      return null
    } finally {
      setLoading(false)
    }
  }, [idProducto])

  const hacerPrincipal = useCallback(async (idImagen) => {
    try {
      setLoading(true)
      await setImagenPrincipal(idImagen)

      setImagenes((prev) =>
        prev.map((img) => ({
          ...img,
          principal: img.idImagen === idImagen,
        }))
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const eliminarImagen = useCallback(async (idImagen) => {
    try {
      setLoading(true)
      await deleteImagenProducto(idImagen)

      setImagenes((prev) =>
        prev.filter((img) => img.idImagen !== idImagen)
      )
    } catch (err) {
      setError(err.message)
      throw err // <--- Lanza el error para que la UI se entere
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    imagenes,
    loading,
    error,
    cargarImagenes,
    subirImagen,
    hacerPrincipal,
    eliminarImagen,
  }
}

export function useImagenesCotizacion(idCotizacion) {
  const [imagenes, setImagenes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const cargarImagenes = useCallback(async () => {
    if (!idCotizacion) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await getImagenesCotizacion(idCotizacion)
      setImagenes(data || [])
    } catch (err) {
      setError(err.message)
      setImagenes([])
    } finally {
      setLoading(false)
    }
  }, [idCotizacion])

  useEffect(() => {
    cargarImagenes()
  }, [cargarImagenes])

  const subirImagen = useCallback(async (file, tipo = 'adjunto') => {
    setError(null)

    const erroresValidacion = validarImagen(file)
    if (erroresValidacion.length > 0) {
      setError(erroresValidacion.join('. '))
      return null
    }

    try {
      setLoading(true)
      const resultado = await uploadImagenCotizacion(idCotizacion, file, tipo)

      setImagenes((prev) => [...prev, resultado.data])
      return resultado.data
    } catch (err) {
      setError(err.message || 'Error al subir')
      return null
    } finally {
      setLoading(false)
    }
  }, [idCotizacion])

  const eliminarImagen = useCallback(async (idImagen) => {
    try {
      setLoading(true)
      await deleteImagenCotizacion(idImagen)

      setImagenes((prev) =>
        prev.filter((img) => img.idImagen !== idImagen)
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    imagenes,
    loading,
    error,
    cargarImagenes,
    subirImagen,
    eliminarImagen,
  }
}

export function useImagenesComponente(idComponente) {
  const [imagenes, setImagenes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const cargarImagenes = useCallback(async () => {
    if (!idComponente) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await getImagenesComponente(idComponente)
      setImagenes(data || [])
    } catch (err) {
      setError(err.message)
      setImagenes([])
    } finally {
      setLoading(false)
    }
  }, [idComponente])

  useEffect(() => {
    cargarImagenes()
  }, [cargarImagenes])

  const subirImagen = useCallback(async (file) => {
    setError(null)

    const erroresValidacion = validarImagen(file)
    if (erroresValidacion.length > 0) {
      setError(erroresValidacion.join('. '))
      return null
    }

    try {
      setLoading(true)
      const resultado = await uploadImagenComponente(idComponente, file)

      setImagenes((prev) => [...prev, resultado.data])
      return resultado.data
    } catch (err) {
      setError(err.message || 'Error al subir')
      return null
    } finally {
      setLoading(false)
    }
  }, [idComponente])

  const hacerPrincipal = useCallback(async (idImagen) => {
    try {
      setLoading(true)
      await setImagenComponentePrincipal(idImagen)

      setImagenes((prev) =>
        prev.map((img) => ({
          ...img,
          principal: img.idImagen === idImagen,
        }))
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const eliminarImagen = useCallback(async (idImagen) => {
    try {
      setLoading(true)
      await deleteImagenComponente(idImagen)

      setImagenes((prev) =>
        prev.filter((img) => img.idImagen !== idImagen)
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    imagenes,
    loading,
    error,
    cargarImagenes,
    subirImagen,
    hacerPrincipal,
    eliminarImagen,
  }
}

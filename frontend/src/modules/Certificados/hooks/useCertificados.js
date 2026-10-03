import { useCallback, useEffect, useState } from 'react'
import * as certificadosApi from '../api/certificadosApi.js'

export function useCertificados() {
  const [certificados, setCertificados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadCertificados = useCallback(async (signal) => {
    setLoading(true)
    setError(null)
    try {
      const items = await certificadosApi.getCertificados({ signal })
      if (!signal?.aborted) setCertificados(items)
      return items
    } catch (requestError) {
      if (!signal?.aborted) {
        setError(requestError)
        setCertificados([])
      }
      throw requestError
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    loadCertificados(controller.signal).catch(() => {})
    return () => controller.abort()
  }, [loadCertificados])

  const saveCertificado = useCallback(async (values, id = null) => {
    setError(null)
    try {
      const saved = id
        ? await certificadosApi.updateCertificado(id, values)
        : await certificadosApi.createCertificado(values)
      setCertificados((current) => (id
        ? current.map((certificado) => (certificado.id === saved.id ? saved : certificado))
        : [saved, ...current]))
      return saved
    } catch (requestError) {
      setError(requestError)
      throw requestError
    }
  }, [])

  const deleteCertificado = useCallback(async (id) => {
    setError(null)
    try {
      await certificadosApi.deleteCertificado(id)
      setCertificados((current) => current.filter((certificado) => certificado.id !== String(id)))
    } catch (requestError) {
      setError(requestError)
      throw requestError
    }
  }, [])

  return { certificados, loading, error, saveCertificado, deleteCertificado, reload: loadCertificados }
}

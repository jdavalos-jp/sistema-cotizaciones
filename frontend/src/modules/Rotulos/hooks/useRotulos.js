import { useCallback, useEffect, useState } from 'react'
import * as rotulosApi from '../api/rotulosApi.js'

export function useRotulos() {
  const [rotulos, setRotulos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadRotulos = useCallback(async (signal) => {
    setLoading(true)
    setError(null)

    try {
      const items = await rotulosApi.getRotulos({ signal })
      if (!signal?.aborted) setRotulos(items)
      return items
    } catch (requestError) {
      if (!signal?.aborted) {
        setError(requestError)
        setRotulos([])
      }
      throw requestError
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    loadRotulos(controller.signal).catch(() => {})
    return () => controller.abort()
  }, [loadRotulos])

  const saveRotulo = useCallback(async (values, editingId = null) => {
    setError(null)

    try {
      const saved = editingId
        ? await rotulosApi.updateRotulo(editingId, values)
        : await rotulosApi.createRotulo(values)

      setRotulos((current) => (
        editingId
          ? current.map((rotulo) => (rotulo.id === saved.id ? saved : rotulo))
          : [saved, ...current]
      ))
      return saved
    } catch (requestError) {
      setError(requestError)
      throw requestError
    }
  }, [])

  const deleteRotulo = useCallback(async (id) => {
    setError(null)

    try {
      await rotulosApi.deleteRotulo(id)
      setRotulos((current) => current.filter((rotulo) => rotulo.id !== String(id)))
    } catch (requestError) {
      setError(requestError)
      throw requestError
    }
  }, [])

  return { rotulos, loading, error, saveRotulo, deleteRotulo, reload: loadRotulos }
}

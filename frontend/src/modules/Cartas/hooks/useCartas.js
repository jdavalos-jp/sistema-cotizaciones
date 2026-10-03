import { useCallback, useEffect, useState } from 'react'
import * as cartasApi from '../api/cartasApi.js'

export function useCartas() {
  const [cartas, setCartas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadCartas = useCallback(async (signal) => {
    setLoading(true)
    setError(null)

    try {
      const items = await cartasApi.getCartas({ signal })
      if (!signal?.aborted) setCartas(items)
      return items
    } catch (requestError) {
      if (!signal?.aborted) {
        setError(requestError)
        setCartas([])
      }
      throw requestError
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    loadCartas(controller.signal).catch(() => {})
    return () => controller.abort()
  }, [loadCartas])

  const saveCarta = useCallback(async (values, id = null) => {
    setError(null)

    try {
      const saved = id
        ? await cartasApi.updateCarta(id, values)
        : await cartasApi.createCarta(values)

      setCartas((current) => (
        id
          ? current.map((carta) => (carta.id === saved.id ? saved : carta))
          : [saved, ...current]
      ))
      return saved
    } catch (requestError) {
      setError(requestError)
      throw requestError
    }
  }, [])

  const deleteCarta = useCallback(async (id) => {
    setError(null)

    try {
      await cartasApi.deleteCarta(id)
      setCartas((current) => current.filter((carta) => carta.id !== String(id)))
    } catch (requestError) {
      setError(requestError)
      throw requestError
    }
  }, [])

  return { cartas, loading, error, saveCarta, deleteCarta, reload: loadCartas }
}

import { useState, useCallback, useEffect } from 'react'
import * as clientesApi from '../api/clientesApi'

export function useClientesManager(idClienteEdit = null) {
  const [cliente, setCliente] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!idClienteEdit) return
    const controller = new AbortController()

    const loadCliente = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await clientesApi.getCliente(idClienteEdit, { signal: controller.signal })
        setCliente(response)
      } catch (err) {
        if (controller.signal.aborted) return
        setError(err.message || 'Error al cargar cliente')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadCliente()
    return () => controller.abort()
  }, [idClienteEdit])

  const createCliente = useCallback(async (payload) => {
    try {
      setLoading(true)
      setError(null)
      const response = await clientesApi.createCliente(payload)
      setCliente(response)
      return response
    } catch (err) {
      const errorMsg = err.message || 'Error al crear cliente'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateCliente = useCallback(
    async (idOrPayload, payloadIfId) => {
      let idCliente, payload

  
      if (typeof idOrPayload === 'object' && idClienteEdit) {
        idCliente = idClienteEdit
        payload = idOrPayload
      } else {

        idCliente = idOrPayload
        payload = payloadIfId
      }

      if (!idCliente || !payload) {
        throw new Error('updateCliente requiere ID y payload')
      }

      try {
        setLoading(true)
        setError(null)
        const response = await clientesApi.updateCliente(idCliente, payload)
        setCliente(response)
        return response
      } catch (err) {
        const errorMsg = err.message || 'Error al actualizar cliente'
        setError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [idClienteEdit]
  )

  return {
    cliente,
    loading,
    error,
    createCliente,
    updateCliente,
  }
}

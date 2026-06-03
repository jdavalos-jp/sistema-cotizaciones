import { useState, useCallback, useEffect } from 'react'
import * as clientesApi from '../api/clientesApi'

/**
 * Hook para gestionar clientes (crear, actualizar)
 * Maneja la lógica de API y estado para formularios
 */
export function useClientesManager(idClienteEdit = null) {
  const [cliente, setCliente] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Cargar cliente si se proporciona ID (modo edición)
   */
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

  /**
   * Crear nuevo cliente
   */
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

  /**
   * Actualizar cliente existente
   */
  const updateCliente = useCallback(
    async (idOrPayload, payloadIfId) => {
      let idCliente, payload

      // Si el primer arg es un objeto y estamos en modo edición, usar idClienteEdit
      if (typeof idOrPayload === 'object' && idClienteEdit) {
        idCliente = idClienteEdit
        payload = idOrPayload
      } else {
        // Si no, esperar: updateCliente(id, payload)
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

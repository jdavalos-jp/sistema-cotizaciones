import { useEffect, useState } from 'react'
import { getClientes } from '../../Clientes/api/clientesApi.js'

export function useClienteOptions() {
  const [search, setSearch] = useState('')
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    const timeoutId = setTimeout(async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await getClientes({ search: search.trim(), take: 20, signal: controller.signal })
        setClientes(Array.isArray(result) ? result : [])
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setClientes([])
          setError(requestError)
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 300)

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [search])

  const addCliente = (cliente) => {
    setClientes((current) => [cliente, ...current.filter((item) => item.idCliente !== cliente.idCliente)])
  }

  return { clientes, loading, error, search, setSearch, addCliente }
}

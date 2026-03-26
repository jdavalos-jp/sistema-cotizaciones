import { useEffect, useMemo, useState } from 'react'
import { message } from 'antd'

import { useDebouncedValue } from './useDebouncedValue'
import { fetchClientes } from '../services/api/clientesApi'

export function useClientesSearch() {
  const [search, setSearch] = useState('')
  const debounced = useDebouncedValue(search, 300) // Usar 300ms default

  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])

  useEffect(() => {
    const controller = new AbortController()

    async function run() {
      if (!debounced || debounced.trim().length < 2) {
        setItems([])
        return
      }

      setLoading(true)
      try {
        const data = await fetchClientes({ search: debounced, take: 20, signal: controller.signal })
        setItems(data)
      } catch (err) {
        if (controller.signal.aborted) return
        message.error(String(err?.message || err))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    run()
    return () => controller.abort()
  }, [debounced])

  const options = useMemo(
    () =>
      items.map((c) => ({
        value: String(c.idCliente),
        label: `${c.nombreCompleto}${c.email ? ` — ${c.email}` : ''}`,
      })),
    [items],
  )

  return useMemo(
    () => ({ search, setSearch, loading, options, raw: items }),
    [search, loading, options, items],
  )
}

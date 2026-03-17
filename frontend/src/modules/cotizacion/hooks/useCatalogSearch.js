import { useEffect, useMemo, useState } from 'react'
import { message } from 'antd'

import { useDebouncedValue } from './useDebouncedValue'

export function useCatalogSearch(fetcher) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)

  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])

  useEffect(() => {
    const controller = new AbortController()

    async function run() {
      setLoading(true)
      try {
        const data = await fetcher({ search: debouncedSearch, take: 50, signal: controller.signal })
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
  }, [debouncedSearch, fetcher])

  return useMemo(
    () => ({ search, setSearch, loading, items }),
    [search, loading, items],
  )
}

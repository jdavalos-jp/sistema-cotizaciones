import { useCallback, useEffect, useState } from 'react'
import * as notasApi from '../api/notasApi.js'

export function useNotas() {
  const [notas, setNotas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const loadNotas = useCallback(async (signal) => {
    setLoading(true); setError(null)
    try { const items = await notasApi.getNotas({ signal }); if (!signal?.aborted) setNotas(items); return items } catch (requestError) { if (!signal?.aborted) { setError(requestError); setNotas([]) } throw requestError } finally { if (!signal?.aborted) setLoading(false) }
  }, [])
  useEffect(() => { const controller = new AbortController(); loadNotas(controller.signal).catch(() => {}); return () => controller.abort() }, [loadNotas])
  const saveNota = useCallback(async (values, id = null) => {
    setError(null)
    try { const saved = id ? await notasApi.updateNota(id, values) : await notasApi.createNota(values); setNotas((current) => id ? current.map((nota) => nota.id === saved.id ? saved : nota) : [saved, ...current]); return saved } catch (requestError) { setError(requestError); throw requestError }
  }, [])
  const deleteNota = useCallback(async (id) => { setError(null); try { await notasApi.deleteNota(id); setNotas((current) => current.filter((nota) => nota.id !== String(id))) } catch (requestError) { setError(requestError); throw requestError } }, [])
  return { notas, loading, error, saveNota, deleteNota, reload: loadNotas }
}

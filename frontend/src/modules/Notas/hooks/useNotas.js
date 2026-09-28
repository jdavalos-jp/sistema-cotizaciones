import { useCallback, useState } from 'react'
import { notasRepository } from '../data/notasRepository.js'

export function useNotas() {
  const [notas, setNotas] = useState(notasRepository.list)
  const saveNota = useCallback((values, id) => {
    const saved = notasRepository.save(values, id)
    setNotas(notasRepository.list())
    return saved
  }, [])
  const deleteNota = useCallback((id) => {
    notasRepository.remove(id)
    setNotas(notasRepository.list())
  }, [])
  return { notas, saveNota, deleteNota }
}

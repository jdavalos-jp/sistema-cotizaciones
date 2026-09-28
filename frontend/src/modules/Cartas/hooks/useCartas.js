import { useCallback, useState } from 'react'
import { cartasRepository } from '../data/cartasRepository.js'

export function useCartas() {
  const [cartas, setCartas] = useState(() => cartasRepository.list())

  const saveCarta = useCallback((values, id) => {
    const saved = cartasRepository.save(values, id)
    setCartas(cartasRepository.list())
    return saved
  }, [])

  const deleteCarta = useCallback((id) => {
    cartasRepository.remove(id)
    setCartas(cartasRepository.list())
  }, [])

  return { cartas, saveCarta, deleteCarta }
}


import { useEffect, useState } from 'react'

/**
 * Hook para debounce de valores
 * @param {*} value - Valor a debounce
 * @param {number} delayMs - Retraso en milisegundos (default 300ms)
 * @returns {*} - Valor debounced
 */
export function useDebouncedValue(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])

  return debounced
}

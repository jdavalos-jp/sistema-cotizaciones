import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * Hook para búsqueda con debounce optimizado
 * Ideal para grandes volúmenes de datos
 *
 * Características:
 * - Debounce configurable (default 300ms)
 * - Auto-reset de página
 * - Cancelación de requests previos
 * - Callback customizable
 *
 * @param {function} onSearch - Callback cuando termina el debounce
 * @param {number} delayMs - Retraso en milisegundos (default 300)
 * @param {object} options - Opciones adicionales { autoResetPage: true }
 *
 * @returns {object} { value, setValue, debouncedValue, isDebouncing }
 */
export function useDebouncedSearch(onSearch = null, delayMs = 300, options = {}) {
  const [value, setValue] = useState('')
  const [debouncedValue, setDebouncedValue] = useState('')
  const [isDebouncing, setIsDebouncing] = useState(false)
  const debounceTimeoutRef = useRef(null)
  const { autoResetPage = true } = options

  /**
   * Manejar cambio de búsqueda
   */
  const handleSearch = useCallback(
    (newValue) => {
      setValue(newValue)
      setIsDebouncing(true)

      // Limpiar debounce anterior
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      // Configurar nuevo debounce
      debounceTimeoutRef.current = setTimeout(() => {
        setDebouncedValue(newValue)
        setIsDebouncing(false)

        // Ejecutar callback si está definido
        if (onSearch) {
          onSearch(newValue)
        }
      }, delayMs)
    },
    [delayMs, onSearch]
  )

  /**
   * Limpiar búsqueda
   */
  const clearSearch = useCallback(() => {
    setValue('')
    setDebouncedValue('')
    setIsDebouncing(false)

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    if (onSearch) {
      onSearch('')
    }
  }, [onSearch])

  /**
   * Limpieza al desmontarse
   */
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  return {
    value,
    setValue: handleSearch,
    debouncedValue,
    isDebouncing,
    clearSearch,
  }
}

/**
 * Hook para búsqueda integrada con manejo de paginación
 * (Versión avanzada)
 *
 * @param {function} onSearch - Callback (search, pageNumber)
 * @param {number} delayMs - Retraso en milisegundos
 *
 * @returns {object} { value, setValue, debouncedValue, isDebouncing, clearSearch, resetPage }
 */
export function useDebouncedSearchWithPagination(onSearch = null, delayMs = 300) {
  const [value, setValue] = useState('')
  const [debouncedValue, setDebouncedValue] = useState('')
  const [isDebouncing, setIsDebouncing] = useState(false)
  const debounceTimeoutRef = useRef(null)

  /**
   * Manejar cambio de búsqueda (resetea a página 1)
   */
  const handleSearch = useCallback(
    (newValue) => {
      setValue(newValue)
      setIsDebouncing(true)

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      debounceTimeoutRef.current = setTimeout(() => {
        setDebouncedValue(newValue)
        setIsDebouncing(false)

        if (onSearch) {
          onSearch(newValue, 1) // Siempre ir a página 1 en búsqueda
        }
      }, delayMs)
    },
    [delayMs, onSearch]
  )

  /**
   * Limpiar búsqueda
   */
  const clearSearch = useCallback(() => {
    setValue('')
    setDebouncedValue('')
    setIsDebouncing(false)

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    if (onSearch) {
      onSearch('', 1)
    }
  }, [onSearch])

  /**
   * Reset de página (sin afectar búsqueda)
   */
  const resetPage = useCallback(() => {
    if (onSearch) {
      onSearch(debouncedValue, 1)
    }
  }, [debouncedValue, onSearch])

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  return {
    value,
    setValue: handleSearch,
    debouncedValue,
    isDebouncing,
    clearSearch,
    resetPage,
  }
}

import { useState, useCallback, useRef, useEffect } from 'react'

export function useDebouncedSearch(onSearch = null, delayMs = 300, options = {}) {
  const [value, setValue] = useState('')
  const [debouncedValue, setDebouncedValue] = useState('')
  const [isDebouncing, setIsDebouncing] = useState(false)
  const debounceTimeoutRef = useRef(null)
  const { autoResetPage = true } = options

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
          onSearch(newValue)
        }
      }, delayMs)
    },
    [delayMs, onSearch]
  )


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

export function useDebouncedSearchWithPagination(onSearch = null, delayMs = 300) {
  const [value, setValue] = useState('')
  const [debouncedValue, setDebouncedValue] = useState('')
  const [isDebouncing, setIsDebouncing] = useState(false)
  const debounceTimeoutRef = useRef(null)

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
          onSearch(newValue, 1) 
        }
      }, delayMs)
    },
    [delayMs, onSearch]
  )


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

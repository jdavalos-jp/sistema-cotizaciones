import { useState, useCallback } from 'react'

export function useImagenesBase() {
  const [imagenes, setImagenes] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const resetError = useCallback(() => setError(null), [])

  return { imagenes, setImagenes, uploading, setUploading, error, setError, resetError }
}

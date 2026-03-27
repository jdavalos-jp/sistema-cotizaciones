import { useState, useCallback, useEffect } from 'react'
import * as productosApi from '../Services/api/productosApi'

/**
 * Hook para gestionar categorías y subcategorías
 */
export function useCategoriesAndSubcategories() {
  const [categorias, setCategorias] = useState([])
  const [subcategorias, setSubcategorias] = useState([])
  const [loadingCategorias, setLoadingCategorias] = useState(false)
  const [loadingSubcategorias, setLoadingSubcategorias] = useState(false)
  const [error, setError] = useState(null)

  // Cargar categorías
  const fetchCategorias = useCallback(async () => {
    try {
      setLoadingCategorias(true)
      setError(null)
      const response = await productosApi.getCategorias()
      setCategorias(Array.isArray(response) ? response : [])
    } catch (err) {
      setError(err.message || 'Error al cargar categorías')
    } finally {
      setLoadingCategorias(false)
    }
  }, [])

  // Cargar subcategorías por categoría
  const fetchSubcategorias = useCallback(async (idCategoria) => {
    if (!idCategoria) {
      setSubcategorias([])
      return
    }
    
    try {
      setLoadingSubcategorias(true)
      setError(null)
      const response = await productosApi.getSubcategoriasByCategoria(idCategoria)
      setSubcategorias(Array.isArray(response) ? response : [])
    } catch (err) {
      setError(err.message || `Error al cargar subcategorías`)
    } finally {
      setLoadingSubcategorias(false)
    }
  }, [])

  // Cargar categorías al montar
  useEffect(() => {
    fetchCategorias()
  }, [fetchCategorias])

  return {
    categorias,
    subcategorias,
    loadingCategorias,
    loadingSubcategorias,
    error,
    fetchCategorias,
    fetchSubcategorias,
  }
}

export default {
  useCategoriesAndSubcategories,
}

import { useState, useCallback, useEffect } from 'react'
import * as productosApi from '../Services/api/productosApi'

/**
 * Hook unificado para categorías y subcategorías
 * Maneja carga, error handling y auto-fetch
 */
export function useCategoriesAndSubcategories(idCategoriaAuto = null) {
  const [categorias, setCategorias] = useState([])
  const [subcategorias, setSubcategorias] = useState([])
  const [loadingCategorias, setLoadingCategorias] = useState(false)
  const [loadingSubcategorias, setLoadingSubcategorias] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Cargar todas las categorías
   */
  const fetchCategorias = useCallback(async () => {
    try {
      setLoadingCategorias(true)
      setError(null)
      const response = await productosApi.getCategorias()
      setCategorias(Array.isArray(response) ? response : response?.data || [])
    } catch (err) {
      setError(err.message || 'Error al cargar categorías')
      setCategorias([])
    } finally {
      setLoadingCategorias(false)
    }
  }, [])

  /**
   * Cargar subcategorías por categoría específica
   */
  const fetchSubcategorias = useCallback(async (idCategoria) => {
    if (!idCategoria) {
      setSubcategorias([])
      return
    }

    try {
      setLoadingSubcategorias(true)
      setError(null)
      const response = await productosApi.getSubcategoriasByCategoria(idCategoria)
      setSubcategorias(Array.isArray(response) ? response : response?.data || [])
    } catch (err) {
      setError(err.message || 'Error al cargar subcategorías')
      setSubcategorias([])
    } finally {
      setLoadingSubcategorias(false)
    }
  }, [])

  /**
   * Refrescar categorías
   */
  const refreshCategorias = useCallback(() => {
    fetchCategorias()
  }, [fetchCategorias])

  /**
   * Auto-fetch categorías al montar
   */
  useEffect(() => {
    fetchCategorias()
  }, [fetchCategorias])

  /**
   * Auto-fetch subcategorías si se proporciona ID
   */
  useEffect(() => {
    if (idCategoriaAuto) {
      fetchSubcategorias(idCategoriaAuto)
    }
  }, [idCategoriaAuto, fetchSubcategorias])

  return {
    // Categorías
    categorias,
    loadingCategorias,
    fetchCategorias,
    refreshCategorias,

    // Subcategorías
    subcategorias,
    loadingSubcategorias,
    fetchSubcategorias,

    // Global
    error,
    loading: loadingCategorias || loadingSubcategorias,
  }
}

/**
 * Hook simplificado solo para categorías (compatibilidad)
 */
export function useCategorias() {
  const { categorias, loadingCategorias, error } = useCategoriesAndSubcategories()
  return {
    data: categorias,
    loading: loadingCategorias,
    error,
  }
}

/**
 * Hook simplificado solo para subcategorías (compatibilidad)
 */
export function useSubcategorias(idCategoria) {
  const { subcategorias, loadingSubcategorias, fetchSubcategorias, error } = useCategoriesAndSubcategories(idCategoria)
  
  return {
    data: subcategorias,
    loading: loadingSubcategorias,
    fetchSubcategorias,
    error,
  }
}

export default {
  useCategoriesAndSubcategories,
  useCategorias,
  useSubcategorias,
}

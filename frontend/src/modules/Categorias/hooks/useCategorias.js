import { useCallback, useMemo, useState } from 'react'
import * as categoriasApi from '../services/categoriasApi'

const PAGE_SIZE = 10

function normalizeCategorias(response) {
  const data = Array.isArray(response) ? response : response?.data || []
  return Array.isArray(data) ? data : []
}

export function useCategorias() {
  const [allCategorias, setAllCategorias] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ total: 0, current: 1, pageSize: PAGE_SIZE })

  const applyView = useCallback((data, skip = 0, search = '') => {
    const term = search.trim().toLowerCase()
    const filtered = term
      ? data.filter((categoria) => {
          const nombre = String(categoria.nombre || '').toLowerCase()
          const descripcion = String(categoria.descripcion || '').toLowerCase()
          return nombre.includes(term) || descripcion.includes(term)
        })
      : data

    setCategorias(filtered.slice(skip, skip + PAGE_SIZE))
    setPagination((prev) => ({
      ...prev,
      total: filtered.length,
      current: Math.floor(skip / PAGE_SIZE) + 1,
      pageSize: PAGE_SIZE,
    }))
  }, [])

  const loadCategorias = useCallback(async (skip = 0, search = '', fetchOptions = {}) => {
    setLoading(true)
    try {
      const response = await categoriasApi.getCategorias(fetchOptions)
      const data = normalizeCategorias(response)
      setAllCategorias(data)
      applyView(data, skip, search)
    } finally {
      setLoading(false)
    }
  }, [applyView])

  const filterCategorias = useCallback((skip = 0, search = '') => {
    applyView(allCategorias, skip, search)
  }, [allCategorias, applyView])

  const deleteCategoria = useCallback(async (idCategoria, search = '') => {
    setLoading(true)
    try {
      await categoriasApi.deleteCategoria(idCategoria)
      const next = allCategorias.map((categoria) =>
        String(categoria.idCategoria) === String(idCategoria)
          ? { ...categoria, estado: 'inactivo' }
          : categoria
      )

      setAllCategorias(next)
      applyView(next, 0, search)
    } finally {
      setLoading(false)
    }
  }, [allCategorias, applyView])

  return useMemo(() => ({
    categorias,
    loading,
    pagination,
    loadCategorias,
    filterCategorias,
    deleteCategoria,
    setPagination,
  }), [categorias, loading, pagination, loadCategorias, filterCategorias, deleteCategoria])
}

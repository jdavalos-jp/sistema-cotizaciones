import { message, Spin } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCategorias } from '../../hooks/useCategorias'
import CategoriesList from './CategoriesList'

export default function CategoriasListPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const {
    categorias,
    loading,
    pagination,
    loadCategorias,
    filterCategorias,
    deleteCategoria,
  } = useCategorias()

  useEffect(() => {
    const controller = new AbortController()

    loadCategorias(0, '', { signal: controller.signal }).catch((error) => {
      if (error.name !== 'AbortError') {
        message.error('Error al cargar categorías')
      }
    })

    return () => controller.abort()
  }, [loadCategorias])

  const handleSearch = useCallback((value) => {
    setSearchTerm(value)
    filterCategorias(0, value)
  }, [filterCategorias])

  const handlePaginationChange = useCallback((page) => {
    const skip = (page - 1) * pagination.pageSize
    filterCategorias(skip, searchTerm)
  }, [filterCategorias, pagination.pageSize, searchTerm])

  const handleEdit = useCallback((categoria) => {
    navigate(`/categorias/editar/${categoria.idCategoria}`)
  }, [navigate])

  const handleDelete = useCallback(async (idCategoria) => {
    try {
      await deleteCategoria(idCategoria, searchTerm)
      message.success('Categoría desactivada correctamente')
    } catch (error) {
      message.error(error.message || 'Error al desactivar la categoría')
    }
  }, [deleteCategoria, searchTerm])

  return (
    <Spin spinning={loading}>
      <CategoriesList
        categorias={categorias}
        loading={loading}
        pagination={pagination}
        searchValue={searchTerm}
        onSearch={handleSearch}
        onPaginationChange={handlePaginationChange}
        onAddCategory={() => navigate('/categorias/crear')}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Spin>
  )
}

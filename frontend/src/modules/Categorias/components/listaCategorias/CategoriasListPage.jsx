import { message, Spin } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCategorias } from '../../hooks/useCategorias'
import CategoriesList from './CategoriesList'

/**
 * CategoriasListPage - Página principal de gestión de categorías
 * Container que orquesta la lógica de lista, búsqueda y acciones
 */
export default function CategoriasListPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const { categorias, loading, pagination, loadCategorias, deleteCategoria, setPagination } = useCategorias()

  // Cargar categorías al montar
  useEffect(() => {
    loadCategorias(0, searchTerm).catch(() => {
      message.error('Error al cargar categorías')
    })
  }, [])

  const handleSearch = async (value) => {
    setSearchTerm(value)
    setPagination((prev) => ({ ...prev, current: 1 }))
    try {
      await loadCategorias(0, value)
    } catch {
      message.error('Error en la búsqueda')
    }
  }

  const handlePaginationChange = async (page) => {
    const skip = (page - 1) * pagination.pageSize
    setPagination((prev) => ({ ...prev, current: page }))
    try {
      await loadCategorias(skip, searchTerm)
    } catch {
      message.error('Error al cambiar de página')
    }
  }

  const handleEdit = (categoria) => {
    navigate(`/categorias/editar/${categoria.idCategoria}`)
  }

  const handleDelete = async (idCategoria) => {
    try {
      await deleteCategoria(idCategoria)
      message.success('Categoría eliminada correctamente')
      // Ya no hace falta llamar loadCategorias, el hook ya filtró el local
    } catch (error) {
      // Ahora usamos error.message que viene limpio desde nuestro backend
      message.error(error.message || 'Error al eliminar la categoría')
    }
  }

  const handleAddCategory = () => {
    navigate('/categorias/crear')
  }

  return (
    <Spin spinning={loading}>
      <CategoriesList
        categorias={categorias}
        loading={loading}
        pagination={pagination}
        searchValue={searchTerm}
        onSearch={handleSearch}
        onPaginationChange={handlePaginationChange}
        onAddCategory={handleAddCategory}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Spin>
  )
}

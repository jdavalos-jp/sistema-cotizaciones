import { Card, message, Spin } from 'antd'
import { useEffect, useState } from 'react'
import { useCategorias } from '../hooks/useCategorias'
import CategoriesHeader from './CategoriesHeader'
import CategoriesSearchBar from './CategoriesSearchBar'
import CategoriesTable from './CategoriesTable'

/**
 * Componente CategoriasListPage - Página principal de gestión de categorías
 * Componentes modulares:
 * - CategoriesHeader: Encabezado con título y botón agregar
 * - CategoriesSearchBar: Buscador de categorías
 * - CategoriesTable: Tabla de categorías con todas las columnas
 */
export default function CategoriasListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { categorias, loading, pagination, loadCategorias, deleteCategoria, setPagination } = useCategorias()
  const [selectedCategory, setSelectedCategory] = useState(null)

  // Cargar categorías al montar el componente
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
    setSelectedCategory(categoria)
    // TODO: Abrir modal de edición
    message.info(`Editar: ${categoria.nombre}`)
  }

  const handleDelete = async (idCategoria) => {
    try {
      deleteCategoria(idCategoria)
      message.success('Categoría eliminada correctamente')
      // Recargar la lista
      await loadCategorias(0, searchTerm)
    } catch (error) {
      message.error('Error al eliminar la categoría')
    }
  }

  const handleAddCategory = () => {
    setSelectedCategory(null)
    // TODO: Abrir modal de creación
    message.info('Abrir formulario para agregar categoría')
  }

  return (
    <div style={{ padding: '0' }}>
      <CategoriesHeader onAddCategory={handleAddCategory} />

      <Card>
        <Spin spinning={loading}>
          <CategoriesSearchBar value={searchTerm} onChange={handleSearch} />

          <CategoriesTable
            categorias={categorias}
            loading={loading}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Spin>
      </Card>
    </div>
  )
}

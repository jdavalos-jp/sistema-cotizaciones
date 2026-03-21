import { Card, Button, Table, Space, Input, Popconfirm, message, Typography, Spin } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useCategorias } from '../hooks/useCategorias'

/**
 * Componente CategoriasListPage
 */
export default function CategoriasListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { categorias, loading, pagination, loadCategorias, deleteCategoria, setPagination } = useCategorias()

  useEffect(() => {
    loadCategorias(0, searchTerm).catch((error) => {
      message.error('Error al cargar categorías')
    })
  }, [])

  const handleSearch = async (value) => {
    setSearchTerm(value)
    setPagination((prev) => ({ ...prev, current: 1 }))
    try {
      await loadCategorias(0, value)
    } catch {}
  }

  const handlePaginationChange = async (page) => {
    const skip = (page - 1) * pagination.pageSize
    setPagination((prev) => ({ ...prev, current: page }))
    try {
      await loadCategorias(skip, searchTerm)
    } catch {}
  }

  const handleDelete = async (idCategoria) => {
    try {
      deleteCategoria(idCategoria)
      message.success('Categoría eliminada')
    } catch (error) {
      message.error('Error al eliminar categoría')
    }
  }

  const columns = [
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion' },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space>
          <Button type="text" size="small" icon={<EditOutlined />}>
            Editar
          </Button>
          <Popconfirm
            title="Eliminar"
            description="¿Está seguro que desea eliminar?"
            onConfirm={() => handleDelete(record.idCategoria)}
            okText="Sí"
            cancelText="No"
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />}>
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography.Title level={1} style={{ marginTop: 0, marginBottom: 8 }}>
            Categorías
          </Typography.Title>
          <Typography.Text type="secondary">Gestión de categorías de productos</Typography.Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large">
          Agregar Categoría
        </Button>
      </div>

      <Card>
        <Spin spinning={loading}>
          <div style={{ marginBottom: 16 }}>
            <Input
              placeholder="Buscar categoría..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ maxWidth: 300 }}
            />
          </div>

          <Table
            columns={columns}
            dataSource={categorias}
            rowKey="idCategoria"
            pagination={{
              pageSize: pagination.pageSize,
              current: pagination.current,
              total: pagination.total,
              onChange: handlePaginationChange,
            }}
            loading={loading}
          />
        </Spin>
      </Card>
    </div>
  )
}

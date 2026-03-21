import { Card, Button, Table, Space, Input, Popconfirm, message, Typography, Spin } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useComponentes } from '../hooks/useComponentes'

/**
 * Componente ComponentesListPage
 */
export default function ComponentesListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { componentes, loading, pagination, loadComponentes, deleteComponente, setPagination } = useComponentes()

  useEffect(() => {
    loadComponentes(0, searchTerm).catch((error) => {
      message.error('Error al cargar componentes')
    })
  }, [])

  const handleSearch = async (value) => {
    setSearchTerm(value)
    setPagination((prev) => ({ ...prev, current: 1 }))
    try {
      await loadComponentes(0, value)
    } catch {}
  }

  const handlePaginationChange = async (page) => {
    const skip = (page - 1) * pagination.pageSize
    setPagination((prev) => ({ ...prev, current: page }))
    try {
      await loadComponentes(skip, searchTerm)
    } catch {}
  }

  const handleDelete = async (idComponente) => {
    try {
      deleteComponente(idComponente)
      message.success('Componente eliminado')
    } catch (error) {
      message.error('Error al eliminar componente')
    }
  }

  const columns = [
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Código', dataIndex: 'codigo', key: 'codigo' },
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
            onConfirm={() => handleDelete(record.idComponente)}
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
            Componentes
          </Typography.Title>
          <Typography.Text type="secondary">Gestión de componentes y piezas</Typography.Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large">
          Agregar Componente
        </Button>
      </div>

      <Card>
        <Spin spinning={loading}>
          <div style={{ marginBottom: 16 }}>
            <Input
              placeholder="Buscar componente..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ maxWidth: 300 }}
            />
          </div>

          <Table
            columns={columns}
            dataSource={componentes}
            rowKey="idComponente"
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

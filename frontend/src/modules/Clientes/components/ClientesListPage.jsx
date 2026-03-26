import { Card, Button, Table, Space, Input, Popconfirm, message, Typography, Spin } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useClientes } from '../hooks/useClientes'

/**
 * Componente ClientesListPage
 * - Listado de clientes
 * - Búsqueda y filtros
 * - Acciones (crear, editar, eliminar)
 */
export default function ClientesListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { clientes, loading, pagination, loadClientes, deleteCliente, setPagination } = useClientes()

  // Cargar clientes al montar
  useEffect(() => {
    loadClientes(0, searchTerm).catch((error) => {
      message.error('Error al cargar clientes')
    })
  }, [])

  const handleSearch = async (value) => {
    setSearchTerm(value)
    setPagination((prev) => ({ ...prev, current: 1 }))
    try {
      await loadClientes(0, value)
    } catch {
      // Error ya manejado
    }
  }

  const handlePaginationChange = async (page) => {
    const skip = (page - 1) * pagination.pageSize
    setPagination((prev) => ({ ...prev, current: page }))
    try {
      await loadClientes(skip, searchTerm)
    } catch {
      // Error ya manejado
    }
  }

  const handleShowSizeChange = async (current, pageSize) => {
    console.log(current, pageSize)
    const skip = (current - 1) * pageSize
    setPagination((prev) => ({ ...prev, current, pageSize }))
    try {
      await loadClientes(skip, searchTerm)
    } catch {
      // Error ya manejado
    }
  }

  const handleDelete = async (idCliente) => {
    try {
      deleteCliente(idCliente)
      message.success('Cliente eliminado')
    } catch (error) {
      message.error('Error al eliminar cliente')
    }
  }

  const columns = [
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Teléfono', dataIndex: 'telefono', key: 'telefono' },
    { title: 'Empresa', dataIndex: 'empresa', key: 'empresa' },
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
            onConfirm={() => handleDelete(record.idCliente)}
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
            Clientes
          </Typography.Title>
          <Typography.Text type="secondary">Gestión de clientes y contactos</Typography.Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />}>
          Agregar Cliente
        </Button>
      </div>

      <Card>
        <Spin spinning={loading}>
          <div style={{ marginBottom: 16 }}>
            <Input
              placeholder="Buscar por nombre o email..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ maxWidth: 300 }}
            />
          </div>

          <Table
            columns={columns}
            dataSource={clientes}
            rowKey="idCliente"
            pagination={{
              pageSize: pagination.pageSize,
              current: pagination.current,
              total: pagination.total,
              onChange: handlePaginationChange,
              onShowSizeChange: handleShowSizeChange,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ['5', '10', '20', '50'],
              showTotal: (total) => `Total: ${total} clientes`,
            }}
            loading={loading}
          />
        </Spin>
      </Card>
    </div>
  )
}

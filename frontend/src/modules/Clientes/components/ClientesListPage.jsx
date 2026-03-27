import { Card, Button, Table, Input, Popconfirm, message, Typography, Spin, Select } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useClientes } from '../hooks/useClientes'

function ClientesListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { clientes, loading, pagination, loadClientes, deleteCliente, setPagination } = useClientes()

  useEffect(() => {
    loadClientes(0, searchTerm).catch(() => {
      message.error('Error al cargar clientes')
    })
  }, [])

  const handleSearch = async (value) => {
    setSearchTerm(value)
    setPagination((prev) => ({ ...prev, current: 1 }))
    try {
      await loadClientes(0, value)
    } catch {}
  }

  const handlePaginationChange = async (page) => {
    const skip = (page - 1) * pagination.pageSize
    setPagination((prev) => ({ ...prev, current: page }))
    try {
      await loadClientes(skip, searchTerm)
    } catch {}
  }

  const handleShowSizeChange = async (current, pageSize) => {
    const skip = (current - 1) * pageSize
    setPagination((prev) => ({ ...prev, current, pageSize }))
    try {
      await loadClientes(skip, searchTerm)
    } catch {}
  }

  const handleDelete = async (idCliente) => {
    const confirmed = window.confirm('¿Está seguro que desea eliminar este cliente?')
    if (!confirmed) return

    try {
      deleteCliente(idCliente)
      message.success('Cliente eliminado')
    } catch {
      message.error('Error al eliminar cliente')
    }
  }

  const handleActionChange = (value, record) => {
    if (value === 'editar') {
      console.log('Editar cliente:', record.idCliente)
    } else if (value === 'eliminar') {
      handleDelete(record.idCliente)
    }
  }

  const columns = [
    { title: 'Nombre', dataIndex: 'nombreCompleto', key: 'nombreCompleto' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Teléfono', dataIndex: 'telefono', key: 'telefono' },
    { title: 'Institución', dataIndex: 'institucion', key: 'institucion' },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Select
          placeholder="Acciones"
          style={{ width: 100, textAlign: 'left' }}
          onChange={(value) => handleActionChange(value, record)}
          options={[
            { label: 'Editar', value: 'editar' },
            { label: 'Eliminar', value: 'eliminar' },
          ]}
        />
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
      </div>

      <Card>
        <Spin spinning={loading}>
          <div style={{ marginBottom: 16 }}>
            <Input
              placeholder="Buscar por nombre o email..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ maxWidth: 737, marginRight: 17 }}
            />
            <Button type="primary" icon={<PlusOutlined />}>
              Agregar Cliente
            </Button>
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

export default ClientesListPage
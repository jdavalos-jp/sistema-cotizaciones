import { Card, Button, Table, Input, message, Typography, Spin, Select, Modal } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClientes } from '../hooks/useClientes'
import * as clientesApi from '../api/clientesApi'

function ClientesListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
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
    Modal.confirm({
      title: '¿Eliminar cliente?',
      content: '¿Está seguro que desea eliminar este cliente? Esta acción no se puede deshacer.',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await clientesApi.deleteCliente(idCliente)
          deleteCliente(idCliente)
          message.success('Cliente eliminado exitosamente')
        } catch (error) {
          message.error(error.message || 'Error al eliminar cliente')
        }
      },
    })
  }

  const handleActionChange = (value, record) => {
    if (value === 'editar') {
      navigate(`/clientes/editar/${record.idCliente}`)
    } else if (value === 'eliminar') {
      handleDelete(record.idCliente)
    }
  }

  const handleOpenModal = () => {
    navigate('/clientes/crear')
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
    <div style={{ backgroundColor: '#f5f5f5', padding: '24px', minHeight: '100vh', margin: '-24px' }}>
      {/* ALINEACIÓN TIPO BREADCRUMB */}
      <div style={{ marginBottom: 24 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Clientes
        </Typography.Title>
        <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
          Inicio / Clientes
        </Typography.Text>
      </div>

      <Card bodyStyle={{ padding: '24px' }} bordered={false} style={{ borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <Spin spinning={loading}>
          {/* TOP BAR: BUSCADOR Y BOTÓN */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ flex: 1 }}
              suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
            />
            <Button
              type="primary"
              onClick={handleOpenModal}
            >
              Añadir cliente
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
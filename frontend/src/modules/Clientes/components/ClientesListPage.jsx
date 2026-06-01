import { Avatar, Button, Card, Dropdown, Empty, Input, message, Popconfirm, Space, Table, Tag, Typography } from 'antd'
import { DeleteOutlined, EditOutlined, MoreOutlined, PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClientes } from '../hooks/useClientes'
import * as clientesApi from '../api/clientesApi'

const { Title, Text } = Typography

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || null
}

function ClientesListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const { clientes, loading, pagination, loadClientes, deleteCliente, setPagination } = useClientes()

  useEffect(() => {
    const controller = new AbortController()

    loadClientes({ page: 1, pageSize: pagination.pageSize, search: '', signal: controller.signal }).catch((error) => {
      if (error.name === 'AbortError') return
      message.error('Error al cargar clientes')
    })

    return () => controller.abort()
  }, [loadClientes, pagination.pageSize])

  const handleSearch = async (value) => {
    setSearchTerm(value)
    setPagination((prev) => ({ ...prev, current: 1 }))

    try {
      await loadClientes({ page: 1, pageSize: pagination.pageSize, search: value })
    } catch {
      message.error('Error al buscar clientes')
    }
  }

  const handlePaginationChange = async (page) => {
    try {
      await loadClientes({ page, pageSize: pagination.pageSize, search: searchTerm })
    } catch {
      message.error('Error al cargar clientes')
    }
  }

  const handleShowSizeChange = async (current, pageSize) => {
    try {
      await loadClientes({ page: current, pageSize, search: searchTerm })
    } catch {
      message.error('Error al cargar clientes')
    }
  }

  const handleDelete = async (idCliente) => {
    try {
      await clientesApi.deleteCliente(idCliente)
      deleteCliente(idCliente)
      message.success('Cliente eliminado')
    } catch (error) {
      message.error(error.message || 'Error al eliminar cliente')
    }
  }

  const columns = [
    {
      title: 'Cliente',
      dataIndex: 'nombreCompleto',
      key: 'nombreCompleto',
      render: (name, record) => (
        <Space size={12}>
          <Avatar icon={getInitials(name) ? null : <UserOutlined />}>
            {getInitials(name)}
          </Avatar>
          <div>
            <Text strong>{name || 'Sin nombre'}</Text>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.cargo || 'Sin cargo'}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Contacto',
      key: 'contacto',
      render: (_, record) => (
        <div>
          <Text>{record.email || '-'}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.telefono || 'Sin telefono'}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Institucion',
      dataIndex: 'institucion',
      key: 'institucion',
      render: (institucion) => institucion ? <Tag>{institucion}</Tag> : <Text type="secondary">-</Text>,
    },
    {
      title: 'Ciudad',
      dataIndex: 'ciudad',
      key: 'ciudad',
      render: (ciudad) => ciudad || '-',
    },
    {
      title: '',
      key: 'acciones',
      width: 64,
      align: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                label: 'Editar',
                icon: <EditOutlined />,
                onClick: () => navigate(`/clientes/editar/${record.idCliente}`),
              },
              { type: 'divider' },
              {
                key: 'delete',
                label: (
                  <Popconfirm
                    title="Eliminar cliente"
                    description="Esta accion no se puede deshacer."
                    onConfirm={() => handleDelete(record.idCliente)}
                    okText="Eliminar"
                    cancelText="Cancelar"
                    okButtonProps={{ danger: true }}
                  >
                    <span style={{ color: '#ff4d4f' }}>Eliminar</span>
                  </Popconfirm>
                ),
                icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
                danger: true,
              },
            ],
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ]

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', margin: '-24px', padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Clientes
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Inicio / Clientes
        </Text>
      </div>

      <Card
        variant="borderless"
        style={{
          borderRadius: 8,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}
        styles={{ body: { padding: 24 } }}
      >
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <Input
            allowClear
            placeholder="Buscar cliente"
            value={searchTerm}
            onChange={(event) => handleSearch(event.target.value)}
            style={{ flex: 1 }}
            suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/clientes/crear')}>
            Anadir cliente
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={clientes}
          rowKey="idCliente"
          loading={loading}
          pagination={{
            pageSize: pagination.pageSize,
            current: pagination.current,
            total: pagination.total,
            onChange: handlePaginationChange,
            onShowSizeChange: handleShowSizeChange,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total) => `Total: ${total} cliente${total !== 1 ? 's' : ''}`,
          }}
          locale={{ emptyText: <Empty description="No hay clientes" /> }}
          scroll={{ x: true }}
        />
      </Card>
    </div>
  )
}

export default ClientesListPage

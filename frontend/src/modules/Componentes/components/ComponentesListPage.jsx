import { Card, Button, Table, Space, Input, Popconfirm, message, Typography, Spin } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useComponentes } from '../hooks/useComponentes'

/**
 * ComponentesListPage
 * Gestión de componentes con CRUD completo
 */
export default function ComponentesListPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const { componentes, loading, pagination, loadComponentes, deleteComponente, setPagination } = useComponentes()

  /**
   * Cargar componentes al montar
   */
  useEffect(() => {
    loadComponentes(0, searchTerm).catch(() => {
      message.error('Error al cargar componentes')
    })
  }, [])

  /**
   * Manejar búsqueda con debounce
   */
  const handleSearch = async (value) => {
    setSearchTerm(value)
    setPagination((prev) => ({ ...prev, current: 1 }))
    try {
      await loadComponentes(0, value)
    } catch (error) {
      console.error('Error searching:', error)
    }
  }

  /**
   * Cambiar página
   */
  const handlePaginationChange = async (page) => {
    const skip = (page - 1) * pagination.pageSize
    setPagination((prev) => ({ ...prev, current: page }))
    try {
      await loadComponentes(skip, searchTerm)
    } catch (error) {
      console.error('Error paginating:', error)
    }
  }

  /**
   * Cambiar tamaño de página
   */
  const handleShowSizeChange = async (current, pageSize) => {
    const skip = (current - 1) * pageSize
    setPagination((prev) => ({ ...prev, current, pageSize }))
    try {
      await loadComponentes(skip, searchTerm)
    } catch (error) {
      console.error('Error changing size:', error)
    }
  }

  /**
   * Eliminar componente
   */
  const handleDelete = async (idComponente) => {
    try {
      await deleteComponente(idComponente)
      message.success('Componente eliminado')
    } catch (error) {
      message.error('Error al eliminar componente')
    }
  }

  /**
   * Abrir página para crear
   */
  const handleCreateClick = () => {
    navigate('/componentes/crear')
  }

  /**
   * Abrir página para editar
   */
  const handleEditClick = (idComponente) => {
    navigate(`/componentes/editar/${idComponente}`)
  }

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      width: 250,
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      ellipsis: true,
      width: 250,
    },
    {
      title: 'Precio Base',
      dataIndex: 'precioBase',
      key: 'precioBase',
      width: 120,
      render: (price) => (
        <span style={{ fontWeight: 500, color: '#1890ff' }}>
          Bs {Number(price).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditClick(record.idComponente)}
            title="Editar"
          >
            Editar
          </Button>
          <Popconfirm
            title="Eliminar"
            description="¿Está seguro que desea eliminar este componente?"
            onConfirm={() => handleDelete(record.idComponente)}
            okText="Sí"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} title="Eliminar">
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* Encabezado */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography.Title level={1} style={{ marginTop: 0, marginBottom: 8 }}>
            Componentes
          </Typography.Title>
          <Typography.Text type="secondary">Gestión de componentes y piezas</Typography.Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleCreateClick}
          style={{ fontWeight: 600 }}
        >
          Crear Componente
        </Button>
      </div>

      {/* Tabla */}
      <Card>
        <Spin spinning={loading}>
          <div style={{ marginBottom: 16 }}>
            <Input
              placeholder="Buscar componente por nombre o SKU..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ maxWidth: 400 }}
              allowClear
              size="large"
            />
          </div>

          <Table
            columns={columns}
            dataSource={componentes.map((c) => ({ ...c, key: c.idComponente }))}
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: handlePaginationChange,
              onShowSizeChange: handleShowSizeChange,
              showSizeChanger: true,
              showTotal: (total) => `Total: ${total} componentes`,
              pageSizeOptions: ['10', '20', '50'],
            }}
            scroll={{ x: true }}
          />
        </Spin>
      </Card>
    </div>
  )
}


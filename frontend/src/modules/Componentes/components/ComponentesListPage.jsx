import { Card, Button, Table, Space, Input, Popconfirm, message, Typography, Spin, Image } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useComponentesManager } from '../hooks/useComponentesManager'

/**
 * ComponentesListPage
 * Gestión de componentes con CRUD completo
 */
export default function ComponentesListPage() {
  const navigate = useNavigate()
  const { componentes, loading, pagination, filters, handleFilterChange, handlePagination, deleteComponente } = useComponentesManager()

  /**
   * Manejar búsqueda
   */
  const handleSearch = (value) => {
    handleFilterChange({ search: value })
  }

  /**
   * Cambiar página
   */
  const handlePaginationChange = (page) => {
    handlePagination(page, pagination.take)
  }

  /**
   * Cambiar tamaño de página
   */
  const handleShowSizeChange = (current, pageSize) => {
    handlePagination(current, pageSize)
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
      render: (nombre, record) => (
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 60,
              height: 60,
              flexShrink: 0,
              background: '#f5f5f5',
              borderRadius: 5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {record.imagenes && record.imagenes.length > 0 ? (
              <Image
                src={record.imagenes[0]?.urlImagen}
                alt={nombre}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                preview={{ mask: 'Ver' }}
              />
            ) : (
              <span style={{ fontSize: '11px', color: '#999' }}>Sin imagen</span>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '500', marginBottom: 4 }}>{nombre}</div>
          </div>
        </div>
      ),
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
        <span style={{ fontWeight: 500, color: '#030303' }}>
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
    <div style={{ backgroundColor: '#f5f5f5', padding: '24px', minHeight: '100vh', margin: '-24px' }}>
      {/* ALINEACIÓN TIPO BREADCRUMB */}
      <div style={{ marginBottom: 24 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Componentes
        </Typography.Title>
        <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
          Inicio / Componentes
        </Typography.Text>
      </div>

      {/* Tabla */}
      <Card bodyStyle={{ padding: '24px' }} bordered={false} style={{ borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <Spin spinning={loading}>
          {/* TOP BAR: BUSCADOR Y BOTÓN */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <Input
              placeholder="Buscar componente por nombre o SKU..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ flex: 1 }}
              suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
              allowClear
            />
            <Button
              type="primary"
              onClick={handleCreateClick}
            >
              Crear Componente
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={componentes.map((c) => ({ ...c, key: c.idComponente }))}
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.take,
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


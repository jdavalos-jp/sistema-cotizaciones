import { Card, Button, Table, Space, Input, Popconfirm, message, Typography, Spin, Image } from 'antd'
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useComponentesManager } from '../hooks/useComponentesManager'

const { Title, Text } = Typography

export default function ComponentesListPage() {
  const navigate = useNavigate()

  const {
    componentes = [],
    loading,
    pagination,
    filters,
    handleFilterChange,
    handlePagination,
    deleteComponente,
  } = useComponentesManager()

  const handleSearch = (value) => {
    handleFilterChange({ search: value })
  }

  const handlePaginationChange = (page) => {
    handlePagination(page, pagination.take)
  }

  const handleShowSizeChange = (current, pageSize) => {
    handlePagination(current, pageSize)
  }

  const handleDelete = async (idComponente) => {
    try {
      await deleteComponente(idComponente)
      message.success('Componente eliminado')
    } catch (error) {
      message.error(error?.message || 'Error al eliminar componente')
    }
  }

  const handleCreateClick = () => {
    navigate('/componentes/crear')
  }

  const handleEditClick = (idComponente) => {
    navigate(`/componentes/editar/${idComponente}`)
  }

  const dataSource = useMemo(() => {
    return componentes.map((componente) => ({
      ...componente,
      key: componente.idComponente,
    }))
  }, [componentes])

  const columns = useMemo(() => {
    return [
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
              {record.imagenes?.length > 0 ? (
                <Image
                  src={record.imagenes[0]?.urlImagen}
                  alt={nombre || 'Imagen del componente'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  preview={{ mask: 'Ver' }}
                  fallback=""
                />
              ) : (
                <span style={{ fontSize: 11, color: '#999' }}>
                  Sin imagen
                </span>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>
                {nombre || 'Sin nombre'}
              </div>
            </div>
          </div>
        ),
      },
      {
        title: 'SKU',
        dataIndex: 'sku',
        key: 'sku',
        width: 120,
        render: (sku) => sku || '—',
      },
      {
        title: 'Descripción',
        dataIndex: 'descripcion',
        key: 'descripcion',
        ellipsis: true,
        width: 250,
        render: (descripcion) => descripcion || '—',
      },
      {
        title: 'Precio Base',
        dataIndex: 'precioBase',
        key: 'precioBase',
        width: 120,
        render: (price) => (
          <span style={{ fontWeight: 500, color: '#030303' }}>
            Bs {Number(price || 0).toLocaleString('es-BO')}
          </span>
        ),
      },
      {
        title: 'Acciones',
        key: 'acciones',
        width: 160,
        render: (_, record) => (
          <Space>
            <Button
              orientation="text"
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
              <Button
                orientation="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                title="Eliminar"
              >
                Eliminar
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ]
  }, [])

  return (
    <div
      style={{
        backgroundColor: '#f5f5f5',
        padding: 24,
        minHeight: '100vh',
        margin: '-24px',
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Componentes
        </Title>

        <Text type="secondary" style={{ fontSize: 14 }}>
          Inicio / Componentes
        </Text>
      </div>

      <Card
        variant="borderless"
        style={{
          borderRadius: 8,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}
        styles={{
          body: {
            padding: 24,
          },
        }}
      >
        <Spin spinning={loading}>
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginBottom: 24,
            }}
          >
            <Input
              placeholder="Buscar componente por nombre o SKU..."
              value={filters.search}
              onChange={(event) => handleSearch(event.target.value)}
              style={{ flex: 1 }}
              suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
              allowClear
            />

            <Button type="primary" onClick={handleCreateClick}>
              Crear Componente
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={dataSource}
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
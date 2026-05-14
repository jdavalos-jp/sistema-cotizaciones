import { Card, Button, Table, Space, Input, Popconfirm, message, Typography, Spin, Image, Dropdown, Empty, Tag, Tooltip } from 'antd'
import { SearchOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons'
import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useComponentesManager } from '../hooks/useComponentesManager'

const { Title, Text } = Typography

function ProductosCell({ productos = [] }) {
  if (!productos.length) {
    return <Empty description="Sin productos" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: 0 }} />
  }

  const visibleProductos = productos.slice(0, 3)
  const hiddenCount = productos.length - visibleProductos.length

  return (
    <Space size={[0, 8]} wrap>
      {visibleProductos.map((relacion) => {
        const producto = relacion.producto || relacion
        const label = producto.nombre || 'Producto sin nombre'
        const sku = producto.sku ? `SKU: ${producto.sku}` : 'Sin SKU'

        return (
          <Tooltip key={relacion.idProductoComponente || producto.idProducto || label} title={sku}>
            <Tag color="blue" style={{ marginInlineEnd: 0, borderRadius: 12 }}>
              {label}
            </Tag>
          </Tooltip>
        )
      })}

      {hiddenCount > 0 && (
        <Tag style={{ marginInlineEnd: 0, borderRadius: 12 }}>
          +{hiddenCount}
        </Tag>
      )}
    </Space>
  )
}

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

  const handleDelete = useCallback(async (idComponente) => {
    try {
      await deleteComponente(idComponente)
      message.success('Componente eliminado')
    } catch (error) {
      message.error(error?.message || 'Error al eliminar componente')
    }
  }, [deleteComponente])

  const handleCreateClick = () => {
    navigate('/componentes/crear')
  }

  const handleEditClick = useCallback((idComponente) => {
    navigate(`/componentes/editar/${idComponente}`)
  }, [navigate])

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
     // {
     ///   title: 'Productos',
      //  dataIndex: 'productos',
      //  key: 'productos',
     //   width: 300,
     //   render: (productos) => <ProductosCell productos={productos} />,
     // },
      {
        title: 'Precio Base',
        dataIndex: 'precioBase',
        key: 'precioBase',
        width: 120,
        render: (price) => (
          <span style={{ color: '#000000' }}>
            Bs {Number(price || 0).toLocaleString('es-BO')}
          </span>
        ),
      },
      {
        title: 'Acciones',
        key: 'acciones',
        width: 100,
        align: 'center',
        render: (_, record) => (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'edit',
                  label: 'Editar',
                  icon: <EditOutlined />,
                  onClick: () => handleEditClick(record.idComponente),
                },
                { type: 'divider' },
                {
                  key: 'delete',
                  label: (
                    <Popconfirm
                      title="Eliminar Componente"
                      description="¿Está seguro que desea eliminar este componente?"
                      onConfirm={() => handleDelete(record.idComponente)}
                      okText="Sí"
                      cancelText="No"
                    >
                      <div style={{ color: '#ff4d4f', width: '100%' }}>Eliminar</div>
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
            <Button type="text" icon={<MoreOutlined style={{ fontSize: '18px' }} />} />
          </Dropdown>
        ),
      },
    ]
  }, [handleDelete, handleEditClick])

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

import { Card, Button, Table, Input, Popconfirm, message, Typography, Image, Dropdown, Space, Tag } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProductos } from '../../hooks/useProductos'
import { useIsMobile } from '../../../../hooks/useIsMobile'
import PageWrapper from '../../../../shared/components/PageWrapper'
import MobileCardList from '../../../../shared/components/MobileCardList'

export default function ProductosListPage() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const debounceTimeoutRef = useRef(null)
  const [searchTerm, setSearchTerm] = useState('')

  const {
    productos,
    loading,
    pagination,
    handleFilterChange,
    handlePagination,
    deleteProducto,
  } = useProductos()

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)
    }
  }, [])

  const handleSearch = (value) => {
    setSearchTerm(value)
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)

    debounceTimeoutRef.current = setTimeout(() => {
      handleFilterChange({ search: value })
    }, 300)
  }

  const handlePaginationChange = (page) => {
    handlePagination(page, pagination.take)
  }

  const handleShowSizeChange = (current, pageSize) => {
    handlePagination(current, pageSize)
  }

  const handleDelete = async (idProducto) => {
    try {
      await deleteProducto(idProducto)
      message.success('Producto eliminado')
    } catch (error) {
      message.error(error?.message || 'Error al eliminar producto')
    }
  }

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
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
            {Array.isArray(record.imagenes) && record.imagenes.length > 0 ? (
              <Image
                src={record.imagenes[0]?.urlImagen}
                alt={nombre}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                preview={{ mask: 'Ver' }}
              />
            ) : (
              <span style={{ fontSize: 11, color: '#999' }}>Sin imagen</span>
            )}
          </div>

          <div style={{ width: 200, overflow: 'hidden' }}>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>{nombre}</div>
            {record.categoria && (
              <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>
                {record.categoria.nombre}
              </div>
            )}
          </div>
        </div>
      ),
    },
    { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 120, render: (value) => value || '-' },
    { title: 'Subcategoria', dataIndex: ['subcategoria', 'nombre'], key: 'subcategoria', render: (value) => value || '-' },
    {
      title: 'Precio',
      dataIndex: 'precioBase',
      key: 'precio',
      render: (value) => `Bs ${Number(value || 0).toFixed(2)}`,
    },
    {
      title: 'Stock',
      dataIndex: 'cantidad',
      key: 'cantidad',
      render: (value) => (
        <Typography.Text style={{ color: value > 10 ? '#52c41a' : value > 0 ? '#faad14' : '#f5222d' }}>
          {value || 0}
        </Typography.Text>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 100,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                label: 'Editar',
                icon: <EditOutlined />,
                onClick: () => navigate(`/productos/editar/${record.idProducto}`),
              },
              { type: 'divider' },
              {
                key: 'delete',
                label: (
                  <Popconfirm
                    title="Eliminar"
                    description="Esta accion no se puede deshacer."
                    onConfirm={() => handleDelete(record.idProducto)}
                    okText="Eliminar"
                    cancelText="Cancelar"
                    okButtonProps={{ danger: true }}
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
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
        </Dropdown>
      ),
    },
  ]

  const renderMobileCard = (record) => (
    <div style={{ display: 'flex', gap: 12 }}>
      <div
        style={{
          width: 64,
          height: 64,
          flexShrink: 0,
          background: '#f5f5f5',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {Array.isArray(record.imagenes) && record.imagenes.length > 0 ? (
          <Image
            src={record.imagenes[0]?.urlImagen}
            alt={record.nombre}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            preview={{ mask: '' }}
          />
        ) : (
          <span style={{ fontSize: 11, color: '#999' }}>Sin imagen</span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{record.nombre}</div>
        {record.categoria && (
          <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
            {record.categoria.nombre}
            {record.subcategoria?.nombre && ` > ${record.subcategoria.nombre}`}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 4 }}>
          <Tag>{record.sku || 'S/N'}</Tag>
          <Typography.Text strong style={{ color: '#1677ff' }}>
            Bs {Number(record.precioBase || 0).toFixed(2)}
          </Typography.Text>
          <Typography.Text style={{ fontSize: 12, color: record.cantidad > 0 ? '#52c41a' : '#f5222d' }}>
            Stock: {record.cantidad || 0}
          </Typography.Text>
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/productos/editar/${record.idProducto}`)}>
            Editar
          </Button>
          <Popconfirm
            title="Eliminar"
            description="Esta accion no se puede deshacer."
            onConfirm={() => handleDelete(record.idProducto)}
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      </div>
    </div>
  )

  return (
    <PageWrapper>
      <div style={{ marginBottom: isMobile ? 12 : 24 }}>
        <Typography.Title level={3} style={{ margin: 0, fontSize: isMobile ? 20 : undefined }}>
          Productos
        </Typography.Title>
        <Typography.Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>
          Inicio / Productos
        </Typography.Text>
      </div>

      <Card
        variant="borderless"
        styles={{ body: { padding: isMobile ? 12 : 24 } }}
        style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
      >
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, marginBottom: isMobile ? 12 : 24 }}>
          <Input
            allowClear
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(event) => handleSearch(event.target.value)}
            style={{ flex: 1 }}
            suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/productos/crear')} block={isMobile}>
            Agregar Producto
          </Button>
        </div>

        {isMobile ? (
          <MobileCardList
            data={productos}
            loading={loading}
            renderCard={renderMobileCard}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
            }}
            onPaginationChange={handlePaginationChange}
            emptyText="No hay productos"
            totalText="productos"
          />
        ) : (
          <Table
            columns={columns}
            dataSource={productos}
            rowKey={(record) => String(record.idProducto)}
            pagination={{
              pageSize: pagination.pageSize,
              current: pagination.current,
              total: pagination.total,
              onChange: handlePaginationChange,
              onShowSizeChange: handleShowSizeChange,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ['5', '10', '20', '50'],
              showTotal: (total) => `Total: ${total} productos`,
            }}
            loading={loading}
            scroll={{ x: true }}
          />
        )}
      </Card>
    </PageWrapper>
  )
}

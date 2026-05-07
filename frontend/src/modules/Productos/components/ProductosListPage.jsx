import { Card, Button, Table, Space, Input, Popconfirm, message, Typography, Spin, Image } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProductos } from '../hooks/useProductos'

export default function ProductosListPage() {
  const navigate = useNavigate()
  const debounceTimeoutRef = useRef(null)
  const [searchTerm, setSearchTerm] = useState('') // ✅ Arreglado searchTerm

  const { 
    productos, 
    loading, 
    pagination, 
    filters,
    handleFilterChange, 
    handlePagination,
    deletProductoLocal 
  } = useProductos()

  // Cargar productos al montar
  useEffect(() => {
    // El hook se encarga de cargar automáticamente
  }, [])

  // Buscar productos con debounce
  const handleSearch = (value) => {
    setSearchTerm(value) // actualizar input
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)
    debounceTimeoutRef.current = setTimeout(() => {
      handleFilterChange({ search: value })
    }, 300)
  }

  // Cambiar página
  const handlePaginationChange = (page) => {
    handlePagination(page, pagination.take)
  }

  // Cambiar tamaño de página
  const handleShowSizeChange = (current, pageSize) => {
    handlePagination(current, pageSize)
  }

  // Eliminar producto
  const handleDelete = async (idProducto) => {
    try {
      deletProductoLocal(idProducto)
      message.success('Producto eliminado')
    } catch (error) {
      message.error('Error al eliminar producto')
    }
  }

  const columns = [
    {
      title: 'NOMBRE',
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
            {record.categoria && (
              <div style={{ fontSize: '12px', color: '#666', marginBottom: 2 }}>
                {record.categoria.nombre}
              </div>
            )}
          </div> 
        </div>
      ),
    },
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'SUBCATEGORÍA', dataIndex: ['categoria', 'nombre'], key: 'categoria' },
    {
      title: 'PRECIO',
      dataIndex: 'precioBase',
      key: 'precio',
      render: (val) => `Bs ${typeof val === 'number' ? val.toFixed(2) : val}`,
    },
    {
      title: 'STOCK',
      dataIndex: 'cantidad',
      key: 'cantidad',
      render: (val) => (
        <Typography.Text style={{ color: val > 10 ? '#52c41a' : val > 0 ? '#faad14' : '#f5222d' }}>
          {val || 0}
        </Typography.Text>
      ),
    },
    {
      title: 'ACCIONES',
      key: 'acciones',
      render: (_, record) => (
        <Space>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => navigate(`/productos/editar/${record.idProducto}`)}>
            Editar
          </Button>
          <Popconfirm
            title="Eliminar"
            description="¿Está seguro que desea eliminar?"
            onConfirm={() => handleDelete(record.idProducto)}
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
    <div style={{ backgroundColor: '#f5f5f5', padding: '24px', minHeight: '100vh', margin: '-24px' }}>
      {/* ALINEACIÓN TIPO BREADCRUMB */}
      <div style={{ marginBottom: 24 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Productos
        </Typography.Title>
        <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
          Inicio / Productos
        </Typography.Text>
      </div>

      <Card variant = {{ padding: '24px' }} styles={false} style={{ borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <Spin spinning={loading}>
          {/* TOP BAR: BUSCADOR Y BOTÓN */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <Input
              placeholder="Buscar por nombre o SKU..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ flex: 1 }}
              suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
            />
            <Button type="primary" onClick={() => navigate('/productos/crear')}>
              Agregar Producto
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={productos}
            rowKey={(record) => `${record.idProducto}-${record.sku || record.nombre}`} // ✅ evitar keys duplicadas
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
          />
        </Spin>
      </Card>
    </div>
  )
}
import { Card, Button, Table, Space, Input, Popconfirm, message, Typography, Spin, Image } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProductos } from '../hooks/useProductos'
/**
 * Componente ProductosListPage
 * - Listado de productos
 * - Búsqueda y filtros
 * - Acciones (crear, editar, eliminar)
 */
export default function ProductosListPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const { productos, loading, pagination, loadProductos, deleteProducto, setPagination } = useProductos()

  // Cargar productos al montar
  useEffect(() => {
    loadProductos(0, searchTerm).catch((error) => {
      message.error('Error al cargar productos')
    })
  }, [])

  // Buscar productos
  const handleSearch = async (value) => {
    setSearchTerm(value)
    setPagination((prev) => ({ ...prev, current: 1 }))
    try {
      await loadProductos(0, value)
    } catch {
      // Error ya manejado en el hook
    }
  }

  // Cambiar página
  const handlePaginationChange = async (page) => {
    const skip = (page - 1) * pagination.pageSize
    setPagination((prev) => ({ ...prev, current: page }))
    try {
      await loadProductos(skip, searchTerm)
    } catch {
      // Error ya manejado en el hook
    }
  }

  // Cambiar tamaño de página
  const handleShowSizeChange = async (current, pageSize) => {
    console.log(current, pageSize)
    const skip = (current - 1) * pageSize
    setPagination((prev) => ({ ...prev, current, pageSize }))
    try {
      await loadProductos(skip, searchTerm)
    } catch {
      // Error ya manejado en el hook
    }
  }

  // Eliminar producto
  const handleDelete = async (idProducto) => {
    try {
      // TODO: Conectar con API de eliminación
      deleteProducto(idProducto)
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
          {/* Imagen */}
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
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  
                }}
                preview={{ mask: 'Ver' }}
              />
            ) : (
              <span style={{ fontSize: '11px', color: '#999' }}>Sin imagen</span>
            )}
          </div>
          
          {/* Nombre y details */}
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
          <Button type="text" size="small" icon={<EditOutlined />}>
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

    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography.Title level={1} style={{ marginTop: 0, marginBottom: 8 }}>
            Productos
          </Typography.Title>
          <Typography.Text type="secondary">Gestión de productos del catálogo</Typography.Text>
        </div>
      </div>

      <Card>
        <Spin spinning={loading}>
          <div style={{ marginBottom: 16 }}>
            <Input
              placeholder="Buscar por nombre o SKU..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ maxWidth: 725 , marginRight: 16}}
              
            />
            <Button
               type="primary"
               icon={<PlusOutlined />}
              onClick={()=> navigate('/productos/crear')}
              >
              Agregar Producto
              </Button>
          </div>
          
          <Table
            columns={columns}
            dataSource={productos}
            rowKey="idProducto"
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

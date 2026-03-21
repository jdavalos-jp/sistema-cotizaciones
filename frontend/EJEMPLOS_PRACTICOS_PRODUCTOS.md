# Ejemplos Listos para Copiar & Pegar - Gestión de Productos

## 1️⃣ Página Completa de Registro de Productos

**Archivo:** `frontend/src/pages/ProductosRegistro.jsx`

```javascript
import React from 'react'
import { Card, Divider } from 'antd'
import ProductoForm from '@/modules/Producto/components/ProductoForm'

export default function ProductosRegistro() {
  const handleSuccess = () => {
    // Aquí puedes redirigir o mostrar un mensaje de éxito
    console.log('Producto registrado correctamente')
    // navigate('/productos') si usas React Router
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <Card title="Registrar Nuevo Producto" bordered={false}>
        <ProductoForm onSuccess={handleSuccess} />
      </Card>

      <Divider />

      <Card 
        type="inner" 
        title="ℹ️ Información"
        style={{ marginTop: 20, backgroundColor: '#f0f5ff' }}
      >
        <p>
          <strong>Categoría:</strong> Selecciona el tipo general del producto
        </p>
        <p>
          <strong>Subcategoría:</strong> Selecciona un tipo más específico dentro de la categoría
        </p>
        <p>
          <strong>SKU:</strong> Código único del producto (ej: CABLE-USB-2M)
        </p>
        <p>
          <strong>Precio Base:</strong> El precio antes de aplicar descuentos
        </p>
        <p>
          <strong>Imagen Principal:</strong> La foto que se muestra en el catálogo (opcional)
        </p>
      </Card>
    </div>
  )
}
```

---

## 2️⃣ Tabla de Productos con Filtros

**Archivo:** `frontend/src/pages/ProductosListado.jsx`

```javascript
import React, { useState } from 'react'
import { Table, Button, Space, Input, Select, Row, Col, Card, Modal, message } from 'antd'
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons'
import { useProductosList } from '@/modules/Producto/hooks/useProductosManager'
import { useCategoriesAndSubcategories } from '@/modules/Producto/hooks/useCategoriesAndSubcategories'
import * as productosApi from '@/modules/Producto/services/api/productosApi'

export default function ProductosListado() {
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState(null)
  const [subcategoriaFiltro, setSubcategoriaFiltro] = useState(null)

  const {
    productos,
    loading,
    error,
    pagination,
    handleFilterChange,
    handlePagination,
    refresh,
  } = useProductosList()

  const { categorias, subcategorias, fetchSubcategorias } =
    useCategoriesAndSubcategories()

  // Filtrar por búsqueda
  const handleBuscar = (valor) => {
    setBusqueda(valor)
    handleFilterChange({ search: valor })
  }

  // Filtrar por categoría
  const handleCategoria = (valor) => {
    setCategoriaFiltro(valor)
    setSubcategoriaFiltro(null)
    fetchSubcategorias(valor)
    handleFilterChange({ idCategoria: valor, idSubcategoria: null })
  }

  // Filtrar por subcategoría
  const handleSubcategoria = (valor) => {
    setSubcategoriaFiltro(valor)
    handleFilterChange({ idSubcategoria: valor })
  }

  // Eliminar producto
  const handleEliminar = (id, nombre) => {
    Modal.confirm({
      title: '¿Eliminar producto?',
      content: `¿Estás seguro de que deseas eliminar "${nombre}"?`,
      okText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await productosApi.deleteProducto(id)
          message.success('Producto eliminado')
          refresh()
        } catch (err) {
          message.error('Error al eliminar el producto')
        }
      },
    })
  }

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (texto) => <strong>{texto}</strong>,
      width: 200,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
    },
    {
      title: 'Categoría',
      key: 'categoria',
      render: (_, record) => record.categoria?.nombre || '-',
      width: 120,
    },
    {
      title: 'Subcategoría',
      key: 'subcategoria',
      render: (_, record) => record.subcategoria?.nombre || '-',
      width: 120,
    },
    {
      title: 'Precio',
      dataIndex: 'precioBase',
      key: 'precio',
      render: (precio) => `$${parseFloat(precio).toFixed(2)}`,
      width: 100,
    },
    {
      title: 'Imágenes',
      key: 'imagenes',
      render: (_, record) => `${record.imagenes?.length || 0}`,
      width: 80,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              // Aquí puedes navegar a la página de detalles
              console.log('Ver detalles del producto:', record.idProducto)
            }}
          >
            Ver
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              // Navegar a página de edición
              console.log('Editar producto:', record.idProducto)
            }}
          >
            Editar
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleEliminar(record.idProducto, record.nombre)}
          >
            Eliminar
          </Button>
        </Space>
      ),
      width: 150,
    },
  ]

  return (
    <div style={{ padding: '20px' }}>
      <Card title="Productos" extra={<Button type="primary">+ Nuevo Producto</Button>}>
        {/* FILTROS */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Input.Search
              placeholder="Buscar por nombre, SKU..."
              value={busqueda}
              onChange={(e) => handleBuscar(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filtrar por categoría"
              value={categoriaFiltro}
              onChange={handleCategoria}
              allowClear
              style={{ width: '100%' }}
              options={categorias.map(c => ({
                label: c.nombre,
                value: c.idCategoria,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filtrar por subcategoría"
              value={subcategoriaFiltro}
              onChange={handleSubcategoria}
              allowClear
              disabled={!categoriaFiltro}
              style={{ width: '100%' }}
              options={subcategorias.map(s => ({
                label: s.nombre,
                value: s.idSubcategoria,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              onClick={refresh}
              style={{ width: '100%' }}
            >
              Recargar
            </Button>
          </Col>
        </Row>

        {/* TABLA */}
        {error && <p style={{ color: 'red', marginBottom: 16 }}>Error: {error}</p>}

        <Table
          dataSource={productos}
          columns={columns}
          loading={loading}
          rowKey="idProducto"
          pagination={{
            pageSize: pagination.take,
            total: pagination.total,
            onChange: (page, pageSize) => {
              handlePagination((page - 1) * pageSize, pageSize)
            },
          }}
        />

        <p style={{ textAlign: 'right', marginTop: 16, color: '#666' }}>
          Total: <strong>{pagination.total}</strong> productos
        </p>
      </Card>
    </div>
  )
}
```

---

## 3️⃣ Página de Detalles y Edición

**Archivo:** `frontend/src/pages/ProductoDetalle.jsx`

```javascript
import React, { useState } from 'react'
import { Card, Descriptions, Button, Space, Tabs, Modal, message, Spin } from 'antd'
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import ProductoForm from '@/modules/Producto/components/ProductoForm'
import { useProducto } from '@/modules/Producto/hooks/useProductosManager'
import * as productosApi from '@/modules/Producto/services/api/productosApi'

export default function ProductoDetalle({ idProducto, onBack }) {
  const [editando, setEditando] = useState(false)
  const { producto, loading, error, fetchProducto } = useProducto(idProducto)

  if (loading) return <Spin size="large" />
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>
  if (!producto)
    return <p>Producto no encontrado</p>

  const handleEliminar = () => {
    Modal.confirm({
      title: '¿Eliminar producto?',
      content: `¿Estás seguro de que deseas eliminar "${producto.nombre}"?`,
      okText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await productosApi.deleteProducto(idProducto)
          message.success('Producto eliminado')
          if (onBack) onBack()
        } catch (err) {
          message.error('Error al eliminar')
        }
      },
    })
  }

  return (
    <div style={{ padding: '20px' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        style={{ marginBottom: 16 }}
      >
        Volver
      </Button>

      {editando ? (
        <Card title="Editar Producto">
          <ProductoForm
            idProductoEdit={idProducto}
            onSuccess={() => {
              setEditando(false)
              fetchProducto(idProducto)
            }}
          />
        </Card>
      ) : (
        <Card
          title={producto.nombre}
          extra={
            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setEditando(true)}
              >
                Editar
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleEliminar}
              >
                Eliminar
              </Button>
            </Space>
          }
        >
          <Tabs
            items={[
              {
                key: 'info',
                label: 'Información',
                children: (
                  <Descriptions bordered size="small">
                    <Descriptions.Item label="SKU" span={3}>
                      {producto.sku}
                    </Descriptions.Item>
                    <Descriptions.Item label="Precio" span={3}>
                      ${parseFloat(producto.precioBase).toFixed(2)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Categoría" span={3}>
                      {producto.categoria?.nombre}
                    </Descriptions.Item>
                    <Descriptions.Item label="Subcategoría" span={3}>
                      {producto.subcategoria?.nombre}
                    </Descriptions.Item>
                    <Descriptions.Item label="Descripción" span={3}>
                      {producto.descripcion}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'imagenes',
                label: `Imágenes (${producto.imagenes?.length || 0})`,
                children: (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                    {producto.imagenes?.map(img => (
                      <div key={img.idImagen} style={{ position: 'relative' }}>
                        <img
                          src={img.urlImagen}
                          alt="Producto"
                          style={{ width: '100%', maxHeight: '150px', objectFit: 'cover' }}
                        />
                        {img.principal && (
                          <div style={{
                            position: 'absolute',
                            top: '5px',
                            left: '5px',
                            backgroundColor: '#1890ff',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '3px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                          }}>
                            Principal
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ),
              },
            ]}
          />
        </Card>
      )}
    </div>
  )
}
```

---

## 4️⃣ Modal de Selección de Productos

**Archivo:** `frontend/src/components/ProductoSelectionModal.jsx`

```javascript
import React, { useState } from 'react'
import { Modal, Table, Input, Button, Space } from 'antd'
import { useProductosList } from '@/modules/Producto/hooks/useProductosManager'

export default function ProductoSelectionModal({ visible, onSelect, onCancel, multiple = false }) {
  const [selectedRows, setSelectedRows] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const { productos, loading, handleFilterChange, refresh } = useProductosList()

  const handleBuscar = (valor) => {
    setBusqueda(valor)
    handleFilterChange({ search: valor })
  }

  const handleConfirm = () => {
    if (multiple) {
      onSelect(selectedRows)
    } else if (selectedRows.length > 0) {
      onSelect(selectedRows[0])
    }
    setSelectedRows([])
  }

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Precio',
      dataIndex: 'precioBase',
      key: 'precio',
      render: (precio) => `$${parseFloat(precio).toFixed(2)}`,
    },
  ]

  return (
    <Modal
      title={`Seleccionar Producto${multiple ? 's' : ''}`}
      visible={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleConfirm}
          disabled={selectedRows.length === 0}
        >
          {multiple ? `Agregar ${selectedRows.length} producto(s)` : 'Seleccionar'}
        </Button>,
      ]}
    >
      <Space style={{ marginBottom: 16, width: '100%', display: 'flex' }}>
        <Input.Search
          placeholder="Buscar por nombre o SKU..."
          value={busqueda}
          onChange={(e) => handleBuscar(e.target.value)}
          allowClear
          style={{ flex: 1 }}
        />
        <Button onClick={refresh}>Recargar</Button>
      </Space>

      <Table
        rowSelection={{
          type: multiple ? 'checkbox' : 'radio',
          selectedRowKeys: selectedRows.map(r => r.idProducto),
          onChange: (_, rows) => setSelectedRows(rows),
        }}
        columns={columns}
        dataSource={productos}
        loading={loading}
        rowKey="idProducto"
        pagination={{ pageSize: 10 }}
        size="small"
      />
    </Modal>
  )
}
```

---

## 5️⃣ Panel de Control - Dashboard de Productos

**Archivo:** `frontend/src/pages/ProductosDashboard.jsx`

```javascript
import React from 'react'
import { Row, Col, Card, Statistic, Button, message } from 'antd'
import { PlusOutlined, UnorderedListOutlined } from '@ant-design/icons'
import { useProductosList } from '@/modules/Producto/hooks/useProductosManager'
import { useCategoriesAndSubcategories } from '@/modules/Producto/hooks/useCategoriesAndSubcategories'

export default function ProductosDashboard() {
  const { productos, pagination } = useProductosList()
  const { categorias, subcategorias } = useCategoriesAndSubcategories()

  const productosConImagen = productos.filter(p => p.imagenes?.length > 0).length
  const precioPromedio = productos.length > 0
    ? (productos.reduce((sum, p) => sum + parseFloat(p.precioBase), 0) / productos.length).toFixed(2)
    : 0

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total de Productos"
              value={pagination.total}
              prefix={<UnorderedListOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Categorías"
              value={categorias.length}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Productos con Imagen"
              value={productosConImagen}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Precio Promedio"
              value={`$${precioPromedio}`}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Card
            title="Acciones Rápidas"
            actions={[
              <Button type="primary" icon={<PlusOutlined />} block>
                Nuevo Producto
              </Button>,
            ]}
          >
            <Button type="link" block style={{ textAlign: 'left', marginBottom: 8 }}>
              Ver todos los productos
            </Button>
            <Button type="link" block style={{ textAlign: 'left', marginBottom: 8 }}>
              Administrar categorías
            </Button>
            <Button type="link" block style={{ textAlign: 'left' }}>
              Importar productos
            </Button>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Últimos Productos">
            {productos.slice(0, 5).map(p => (
              <div key={p.idProducto} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #f0f0f0' }}>
                <p style={{ margin: 0 }}>
                  <strong>{p.nombre}</strong>
                </p>
                <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '12px' }}>
                  SKU: {p.sku} | Precio: ${parseFloat(p.precioBase).toFixed(2)}
                </p>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
```

---

## 🚀 Integración en AppLayout.jsx

```javascript
import { Layout, Menu, Button } from 'antd'
import { ShoppingOutlined, PlusOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

export function AppLayout({ children }) {
  return (
    <Layout>
      <Layout.Sider>
        <Menu theme="dark" defaultSelectedKeys={['1']}>
          <Menu.SubMenu
            key="productos"
            title={<span><ShoppingOutlined /> Productos</span>}
          >
            <Menu.Item key="productos-lista">
              <Link to="/productos">Listado de Productos</Link>
            </Menu.Item>
            <Menu.Item key="productos-nuevo">
              <Link to="/productos/nuevo">
                <PlusOutlined /> Nuevo Producto
              </Link>
            </Menu.Item>
            <Menu.Item key="productos-dashboard">
              <Link to="/productos/dashboard">Dashboard</Link>
            </Menu.Item>
          </Menu.SubMenu>
        </Menu>
      </Layout.Sider>
      <Layout.Content>{children}</Layout.Content>
    </Layout>
  )
}
```

---

## 📁 Routes Setup (React Router v6)

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProductosDashboard from '@/pages/ProductosDashboard'
import ProductosListado from '@/pages/ProductosListado'
import ProductosRegistro from '@/pages/ProductosRegistro'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/productos" element={<ProductosListado />} />
        <Route path="/productos/nuevo" element={<ProductosRegistro />} />
        <Route path="/productos/dashboard" element={<ProductosDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
```

---

## ✨ Tips & Tricks

### Validar SKU único antes de guardar
```javascript
async function validarSkuUnico(sku) {
  const { data } = await getProductos({ search: sku, take: 100 })
  const existe = data.some(p => p.sku === sku)
  return !existe
}
```

### Exportar productos a CSV
```javascript
function exportarCSV(productos) {
  const csv = [
    ['ID', 'Nombre', 'SKU', 'Precio', 'Categoría'],
    ...productos.map(p => [
      p.idProducto,
      p.nombre,
      p.sku,
      p.precioBase,
      p.categoria?.nombre,
    ]),
  ]
    .map(row => row.join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'productos.csv'
  a.click()
}
```

### Precarga de imágenes
```javascript
function precargarImagenes(productos) {
  productos.forEach(p => {
    p.imagenes?.forEach(img => {
      const image = new Image()
      image.src = img.urlImagen
    })
  })
}
```


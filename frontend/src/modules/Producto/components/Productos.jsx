import React, { useState } from 'react'
import { Card, Button, Space, Table, Input, Select, Row, Col, Modal, message, Drawer, Empty, Spin, Tooltip, Tag } from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  FilterOutlined,
  FileImageOutlined,
} from '@ant-design/icons'
import ProductoForm from './ProductoForm'
import { useProductosList } from '../hooks/useProductosManager'
import { useCategoriesAndSubcategories } from '../hooks/useCategoriesAndSubcategories'
import * as productosApi from '../services/api/productosApi'
import './Productos.css'

function Productos() {
  const [modalNuevo, setModalNuevo] = useState(false)
  const [drawerEditar, setDrawerEditar] = useState(false)
  const [productoEditando, setProductoEditando] = useState(null)
  const [filtroCategoria, setFiltroCategoria] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  const { productos, loading, error, pagination, handleFilterChange, handlePagination, refresh } =
    useProductosList()
  const { categorias, subcategorias, fetchSubcategorias } =
    useCategoriesAndSubcategories()

  // Handlers
  const handleNuevoProducto = () => {
    setProductoEditando(null)
    setModalNuevo(true)
  }

  const handleEditarProducto = (producto) => {
    setProductoEditando(producto)
    setDrawerEditar(true)
  }

  const handleEliminarProducto = (id, nombre) => {
    Modal.confirm({
      title: ' Eliminar Producto',
      content: `¿Estás seguro de que deseas eliminar "${nombre}"? Esta acción no se puede deshacer.`,
      okText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await productosApi.deleteProducto(id)
          message.success(' Producto eliminado correctamente')
          refresh()
        } catch (err) {
          message.error(' Error al eliminar el producto')
        }
      },
    })
  }

  const handleBuscar = (valor) => {
    setBusqueda(valor)
    handleFilterChange({ search: valor })
  }

  const handleFiltroCategoria = (valor) => {
    setFiltroCategoria(valor)
    fetchSubcategorias(valor)
    handleFilterChange({ idCategoria: valor, idSubcategoria: null })
  }

  const handleLimpiarFiltros = () => {
    setBusqueda('')
    setFiltroCategoria(null)
    handleFilterChange({ search: '', idCategoria: null, idSubcategoria: null })
  }

  // Columnas de tabla
  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      width: 200,
      render: (text, record) => (
        <div>
          <p style={{ margin: 0, fontWeight: 600, color: '#000' }}>{text}</p>
          <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#8c8c8c' }}>SKU: {record.sku}</p>
        </div>
      ),
    },
    {
      title: 'Categoría',
      dataIndex: ['categoria', 'nombre'],
      key: 'categoria',
      width: 130,
      render: (text) => <Tag>{text || '-'}</Tag>,
    },
    {
      title: 'Precio',
      dataIndex: 'precioBase',
      key: 'precio',
      width: 100,
      render: (precio) => (
        <span style={{ fontWeight: 600, color: '#1890ff' }}>
          ${parseFloat(precio).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Imágenes',
      key: 'imagenes',
      width: 90,
      render: (_, record) => (
        <Tooltip title={`${record.imagenes?.length || 0} imagen(es)`}>
          <span>
            <FileImageOutlined style={{ color: '#13c2c2' }} /> {record.imagenes?.length || 0}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Ver detalles">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined style={{ color: '#13c2c2' }} />}
              onClick={() => handleEditarProducto(record)}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ color: '#13c2c2' }} />}
              onClick={() => handleEditarProducto(record)}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
              onClick={() => handleEliminarProducto(record.idProducto, record.nombre)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div className="productos-page-container">
      {/* HEADER CON BOTÓN */}
      <div className="page-header">
        <div>
          <h1 className="page-title"> Catálogo de Productos</h1>
          <p className="page-subtitle">Gestiona tu inventario de productos de forma rápida y sencilla</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined style={{ color: 'white' }} />}
          onClick={handleNuevoProducto}
          className="btn-nuevo-producto"
        >
          Nuevo Producto
        </Button>
      </div>

      {/* FILTROS */}
      <Card title="🔍 Filtros de Búsqueda" className="filters-card">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder="Buscar por nombre, SKU..."
              value={busqueda}
              onChange={(e) => handleBuscar(e.target.value)}
              allowClear
              prefix={<FilterOutlined style={{ color: '#13c2c2' }} />}
            />
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filtrar por categoría"
              value={filtroCategoria}
              onChange={handleFiltroCategoria}
              allowClear
              style={{ width: '100%' }}
              options={categorias.map(c => ({
                label: c.nombre,
                value: c.idCategoria,
              }))}
            />
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Space style={{ width: '100%' }}>
              <Button
                onClick={handleLimpiarFiltros}
                style={{ flex: 1 }}
              >
                Limpiar Filtros
              </Button>
              <Button
                type="primary"
                onClick={refresh}
                icon={<ReloadOutlined style={{ color: 'white' }} />}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* TABLA DE PRODUCTOS */}
      <Card
        title={
          <div>
            <span> Productos ({pagination.total})</span>
          </div>
        }
        className="products-card"
      >
        {error && (
          <div className="error-message">
            <p>❌ {error}</p>
          </div>
        )}

        {productos.length === 0 && !loading ? (
          <Empty
            description={
              busqueda || filtroCategoria
                ? 'No se encontraron productos con esos filtros'
                : 'No hay productos registrados aún'
            }
            style={{ marginTop: 50, marginBottom: 50 }}
          >
            <Button
              type="primary"
              onClick={handleNuevoProducto}
              icon={<PlusOutlined style={{ color: 'white' }} />}
            >
              Crear Primer Producto
            </Button>
          </Empty>
        ) : (
          <Table
            columns={columns}
            dataSource={productos}
            loading={loading}
            rowKey="idProducto"
            pagination={{
              pageSize: pagination.take,
              total: pagination.total,
              onChange: (page, pageSize) => {
                handlePagination((page - 1) * pageSize, pageSize)
              },
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]} a ${range[1]} de ${total} productos`,
            }}
            scroll={{ x: 1200 }}
            className="productos-table"
          />
        )}
      </Card>

      {/* MODAL: NUEVO PRODUCTO */}
      <Modal
        title="Crear Nuevo Producto"
        open={modalNuevo}
        onCancel={() => setModalNuevo(false)}
        footer={null}
        width={900}
        bodyStyle={{ padding: 0 }}
        style={{ top: 20 }}
      >
        <ProductoForm
          onSuccess={() => {
            setModalNuevo(false)
            refresh()
          }}
          onCancel={() => setModalNuevo(false)}
        />
      </Modal>

      {/* DRAWER: EDITAR PRODUCTO */}
      <Drawer
        title={productoEditando ? '✏️ Editar Producto' : '👁️ Detalles del Producto'}
        placement="right"
        onClose={() => setDrawerEditar(false)}
        open={drawerEditar}
        width={700}
        bodyStyle={{ paddingBottom: 80 }}
      >
        {productoEditando && (
          <ProductoForm
            idProductoEdit={productoEditando.idProducto}
            onSuccess={() => {
              setDrawerEditar(false)
              refresh()
            }}
            onCancel={() => setDrawerEditar(false)}
          />
        )}
      </Drawer>
    </div>
  )
}

export default Productos
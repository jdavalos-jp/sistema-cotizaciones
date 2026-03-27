import React, { useEffect, useState } from 'react'
import {
  Row,
  Col,
  Card,
  Button,
  Space,
  Input,
  Empty,
  Spin,
  Image,
  Badge,
  Modal,
  message,
  theme,
} from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import FormEditarProducto from './FormEditarProducto'
import { useProductosList } from '../hooks/useCatalogoManager'

export default function GridProductos() {
  const [searchText, setSearchText] = useState('')
  const [editingProducto, setEditingProducto] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const { token } = theme.useToken()

  const {
    productos,
    loading,
    pagination,
    loadProductos,
    updateProducto,
    deleteProducto,
  } = useProductosList()

  const [params, setParams] = useState({
    take: 12,
    skip: 0,
    search: '',
  })

  useEffect(() => {
    loadProductos(params)
  }, [params])

  const handleSearch = (value) => {
    setSearchText(value)
    setParams({
      ...params,
      search: value,
      skip: 0,
    })
  }

  const handleEdit = (producto) => {
    setEditingProducto(producto)
    setModalVisible(true)
  }

  const handleDelete = (idProducto) => {
    Modal.confirm({
      title: '¿Eliminar producto?',
      content: 'Esta acción no se puede deshacer',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await deleteProducto(idProducto)
          message.success('Producto eliminado')
        } catch (err) {
          message.error(err.message)
        }
      },
    })
  }

  const handleCloseModal = () => {
    setModalVisible(false)
    setEditingProducto(null)
  }

  const handleSaveProducto = async () => {
    handleCloseModal()
    loadProductos(params)
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Search Bar */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
        <Input
          placeholder="Buscar productos por nombre, SKU o descripción..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          size="large"
          style={{ flex: 1, maxWidth: '600px' }}
          allowClear
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <Spin size="large" />
        </div>
      )}

      {/* Products Grid */}
      {!loading && productos.length > 0 && (
        <>
          <Row gutter={[20, 20]}>
            {productos.map((producto) => (
              <Col key={producto.idProducto} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: token.borderRadiusLG,
                    boxShadow: token.boxShadow,
                  }}
                  cover={
                    <div
                      style={{
                        height: 200,
                        background: token.colorBgElevated,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {producto.imagenes && producto.imagenes.length > 0 ? (
                        <Image
                          src={producto.imagenes[0]?.urlImagen}
                          alt={producto.nombre}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                          preview
                        />
                      ) : (
                        <div style={{ color: token.colorTextTertiary, fontSize: '14px' }}>
                          Sin imagen
                        </div>
                      )}
                      {producto.imagenes && producto.imagenes.length > 1 && (
                        <Badge
                          count={`+${producto.imagenes.length - 1}`}
                          style={{
                            backgroundColor: token.colorPrimary,
                            color: 'white',
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            borderRadius: 4,
                            padding: '0 6px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                          }}
                        />
                      )}
                    </div>
                  }
                  bodyStyle={{
                    padding: '12px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Product Name */}
                  <div style={{ marginBottom: 8 }}>
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: token.colorText,
                        marginBottom: 4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={producto.nombre}
                    >
                      {producto.nombre}
                    </div>
                    {producto.sku && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: token.colorTextSecondary,
                        }}
                      >
                        SKU: {producto.sku}
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  {producto.categoria && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: token.colorTextTertiary,
                        marginBottom: 8,
                      }}
                    >
                      {producto.categoria.nombre}
                      {producto.subcategoria && ` > ${producto.subcategoria.nombre}`}
                    </div>
                  )}

                  {/* Price */}
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: token.colorPrimary,
                      marginTop: 'auto',
                      marginBottom: 12,
                    }}
                  >
                    ${Number(producto.precioBase || 0)}
                  </div>

                  {/* Stock Badge */}
                  <div
                    style={{
                      fontSize: '12px',
                      marginBottom: 12,
                      color: producto.cantidad > 0 ? token.colorSuccess : token.colorError,
                    }}
                  >
                    Stock: {producto.cantidad} unidades
                  </div>

                  {/* Actions */}
                  <Space style={{ width: '100%' }} size="small">
                    <Button
                      type="primary"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(producto)}
                      style={{ flex: 1 }}
                    >
                      Editar
                    </Button>
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(producto.idProducto)}
                    />
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination Info */}
          <div
            style={{
              textAlign: 'center',
              marginTop: 24,
              color: token.colorTextSecondary,
              fontSize: '14px',
            }}
          >
            Mostrando {productos.length} de {pagination.total} productos
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && productos.length === 0 && (
        <Empty
          description={searchText ? 'No hay productos que coincidan' : 'Sin productos'}
          style={{ marginTop: 50 }}
        />
      )}

      {/* Edit Modal */}
      <Modal
        title={`Editar: ${editingProducto?.nombre}`}
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={700}
        bodyStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
      >
        {editingProducto && (
          <FormEditarProducto
            idProductoEdit={editingProducto.idProducto}
            onSuccess={handleSaveProducto}
            onCancel={handleCloseModal}
          />
        )}
      </Modal>
    </div>
  )
}

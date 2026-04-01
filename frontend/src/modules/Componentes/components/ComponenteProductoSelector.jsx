import React, { useEffect, useState } from 'react'
import { Card, Form, Select, Button, Table, Empty, Space, Typography, theme, Spin, message } from 'antd'
import { DeleteOutlined, AppstoreOutlined } from '@ant-design/icons'
import * as productosApi from '../../Producto/Services/api/productosApi'

const { Text } = Typography

/**
 * ComponenteProductoSelector
 * 
 * ¿QUÉ HACE?
 * - Permite seleccionar UN producto para asociarlo al componente
 * - Muestra el producto seleccionado en una tabla
 * - SIN cantidad (es solo 1:1)
 * 
 * DIFERENCIA CON ProductoComponentes:
 * - ProductoComponentes: Producto tiene múltiples componentes (1:N)
 * - Este: Componente tiene UN producto (1:1)
 */
export default function ComponenteProductoSelector({
  productoSeleccionado = null,
  onProductoSeleccionado = () => {},
}) {
  const { token } = theme.useToken()
  
  // Estados
  const [productos, setProductos] = useState([])
  const [loadingProductos, setLoadingProductos] = useState(false)
  const [searchProducto, setSearchProducto] = useState('')

  // ============ EFECTO: CARGAR PRODUCTOS =============
  useEffect(() => {
    const cargarProductos = async () => {
      setLoadingProductos(true)
      try {
        const response = await productosApi.getProductos({ take: 1000 })
        const productosData = response?.data || response || []
        setProductos(
          productosData.map(prod => ({
            label: prod.nombre,
            value: prod.idProducto,
            ...prod, // Guardar todo el objeto
          }))
        )
      } catch (err) {
        console.error('Error cargando productos:', err)
        message.error('Error al cargar productos')
      } finally {
        setLoadingProductos(false)
      }
    }

    cargarProductos()
  }, [])

  // ============ HANDLECHANGE: SELECCIONAR PRODUCTO =============
  const handleProductoChange = (value) => {
    const productoEncontrado = productos.find(p => p.idProducto === value)
    onProductoSeleccionado(productoEncontrado || null)
  }

  // ============ HANDLEDELETE: REMOVER PRODUCTO =============
  const handleRemoveProducto = () => {
    onProductoSeleccionado(null)
  }

  // ============ COLUMNAS DE LA TABLA =============
  const columns = [
    {
      title: 'Producto',
      dataIndex: 'nombre',
      key: 'nombre',
      width: '60%',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: '30%',
      render: (text) => text || '-',
    },
    {
      title: 'Acción',
      key: 'action',
      width: '10%',
      align: 'center',
      render: () => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={handleRemoveProducto}
        />
      ),
    },
  ]

  return (
    <Card
      title={
        <Space>
          <AppstoreOutlined style={{ color: token.colorPrimary, fontSize: 18 }} />
          Producto del Componente
        </Space>
      }
      size="small"
      style={{
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${token.colorBorder}`,
        boxShadow: `0 2px 8px ${token.colorBorder}`,
      }}
    >
      {/* SELECTOR DE PRODUCTOS */}
      <Form.Item
        label="Seleccionar Producto"
        style={{ marginBottom: token.marginMD }}
      >
        {loadingProductos ? (
          <Spin />
        ) : (
          <Select
            placeholder="Busca y selecciona un producto..."
            filterOption={(input, option) =>
              option?.label?.toLowerCase().includes(input.toLowerCase())
            }
            options={productos}
            value={productoSeleccionado?.idProducto || undefined}
            onChange={handleProductoChange}
            allowClear
            notFoundContent={productos.length === 0 ? <Empty description="No hay productos" /> : null}
            style={{ width: '100%' }}
          />
        )}
      </Form.Item>

      {/* TABLA: PRODUCTO SELECCIONADO */}
      {productoSeleccionado ? (
        <Table
          columns={columns}
          dataSource={[
            {
              key: productoSeleccionado.idProducto,
              ...productoSeleccionado,
            },
          ]}
          pagination={false}
          size="small"
          style={{ marginTop: token.marginMD }}
        />
      ) : (
        <Empty
          description="Sin producto seleccionado"
          style={{ margin: `${token.marginLG}px 0` }}
        />
      )}
    </Card>
  )
}

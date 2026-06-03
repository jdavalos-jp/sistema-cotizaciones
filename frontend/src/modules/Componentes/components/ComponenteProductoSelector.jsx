import { useEffect, useMemo, useState } from 'react'
import { Card, Form, Select, Button, Table, Empty, Space, Typography, theme, Spin, message } from 'antd'
import { DeleteOutlined, AppstoreOutlined } from '@ant-design/icons'
import * as productosApi from '../../Producto/Services/api/productosApi'

const { Text } = Typography

export default function ComponenteProductoSelector({
  productosSeleccionados = [],
  onProductosSeleccionados = () => {},
}) {
  const { token } = theme.useToken()
  const [productos, setProductos] = useState([])
  const [loadingProductos, setLoadingProductos] = useState(false)

  const selectedIds = useMemo(
    () => productosSeleccionados.map((producto) => producto.idProducto),
    [productosSeleccionados]
  )

  useEffect(() => {
    const controller = new AbortController()

    const cargarProductos = async () => {
      setLoadingProductos(true)
      try {
        const response = await productosApi.getProductos({ take: 1000, signal: controller.signal })
        const productosData = response?.data || response || []

        setProductos(
          productosData.map((producto) => ({
            label: producto.nombre,
            value: producto.idProducto,
            idProducto: producto.idProducto,
            nombre: producto.nombre,
            sku: producto.sku,
            precioBase: producto.precioBase,
          }))
        )
      } catch (err) {
        if (err.name === 'AbortError') return
        message.error('Error al cargar productos')
      } finally {
        if (!controller.signal.aborted) setLoadingProductos(false)
      }
    }

    cargarProductos()
    return () => controller.abort()
  }, [])

  const handleProductosChange = (values) => {
    const nextProductos = values
      .map((idProducto) => {
        const productoYaSeleccionado = productosSeleccionados.find(
          (producto) => producto.idProducto === idProducto
        )
        const productoEncontrado = productos.find((producto) => producto.idProducto === idProducto)

        return productoYaSeleccionado || productoEncontrado || null
      })
      .filter(Boolean)

    onProductosSeleccionados(nextProductos)
  }

  const handleRemoveProducto = (idProducto) => {
    onProductosSeleccionados(
      productosSeleccionados.filter((producto) => producto.idProducto !== idProducto)
    )
  }

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
      title: 'Accion',
      key: 'action',
      width: '10%',
      align: 'center',
      render: (_, record) => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveProducto(record.idProducto)}
        />
      ),
    },
  ]

  return (
    <Card
      title={
        <Space>
          <AppstoreOutlined style={{ color: token.colorPrimary, fontSize: 18 }} />
          Productos del Componente
        </Space>
      }
      size="small"
      style={{
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${token.colorBorder}`,
        boxShadow: `0 2px 8px ${token.colorBorder}`,
      }}
    >
      <Form.Item label="Seleccionar Productos" style={{ marginBottom: token.marginMD }}>
        {loadingProductos ? (
          <Spin />
        ) : (
          <Select
            mode="multiple"
            placeholder="Busca y selecciona productos..."
            filterOption={(input, option) =>
              option?.label?.toLowerCase().includes(input.toLowerCase())
            }
            options={productos}
            value={selectedIds}
            onChange={handleProductosChange}
            allowClear
            notFoundContent={productos.length === 0 ? <Empty description="No hay productos" /> : null}
            style={{ width: '100%' }}
          />
        )}
      </Form.Item>

      {productosSeleccionados.length > 0 ? (
        <Table
          columns={columns}
          dataSource={productosSeleccionados.map((producto) => ({
            key: producto.idProducto,
            ...producto,
          }))}
          pagination={false}
          size="small"
          style={{ marginTop: token.marginMD }}
        />
      ) : (
        <Empty description="Sin productos seleccionados" style={{ margin: `${token.marginLG}px 0` }} />
      )}

      {productosSeleccionados.length > 0 ? (
        <Text type="secondary" style={{ display: 'block', marginTop: token.marginSM }}>
          Asociado a {productosSeleccionados.length} producto(s).
        </Text>
      ) : null}
    </Card>
  )
}

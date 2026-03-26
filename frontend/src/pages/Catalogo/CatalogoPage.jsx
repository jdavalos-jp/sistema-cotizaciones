import { Card, Row, Col, Button, Empty, Space, Input, Select, Typography } from 'antd'
import { SearchOutlined, PlusOutlined } from '@ant-design/icons'
import { useState } from 'react'

/**
 * Página Catálogo
 * - Vista general del catálogo completo
 * - Productos y componentes disponibles
 * - Búsqueda y filtros
 */
export default function CatalogoPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('todos')

  // Datos simulados
  const productos = [
    { id: 1, nombre: 'Cesta Drenaje', sku: 'PROD-001', precio: 2500, stock: 15 },
    { id: 2, nombre: 'Filtro Agua', sku: 'PROD-002', precio: 1200, stock: 8 },
    { id: 3, nombre: 'Bomba Agua', sku: 'PROD-003', precio: 5000, stock: 3 },
  ]

  const componentes = [
    { id: 1, nombre: 'Tubo PVC', sku: 'COMP-001', precio: 150, stock: 50 },
    { id: 2, nombre: 'Válvula', sku: 'COMP-002', precio: 300, stock: 25 },
    { id: 3, nombre: 'Malla', sku: 'COMP-003', precio: 80, stock: 100 },
  ]

  const items = filterType === 'todos' 
    ? [...productos, ...componentes]
    : filterType === 'productos'
    ? productos
    : componentes

  const filtered = items.filter(
    (item) =>
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Typography.Title level={1} style={{ marginTop: 0, marginBottom: 8 }}>Catálogo Completo</Typography.Title>
        <Typography.Text type="secondary">Productos y componentes disponibles</Typography.Text>
      </div>

      {/* Filtros */}
      <Card style={{ marginBottom: 24 }}>
        <Space orientation="vertical" style={{ width: '100%' }} size="large">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Input
              placeholder="Buscar por nombre o SKU..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                Tipo
              </label>
              <Select
                style={{ width: '100%' }}
                defaultValue="todos"
                onChange={setFilterType}
                options={[
                  { label: 'Todos', value: 'todos' },
                  { label: 'Productos', value: 'productos' },
                  { label: 'Componentes', value: 'componentes' },
                ]}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button type="primary" icon={<PlusOutlined />} block>
                Agregar Producto
              </Button>
            </div>
          </div>

          <div style={{ color: '#999', fontSize: 14 }}>
            {filtered.length} resultado(s)
          </div>
        </Space>
      </Card>

      {/* Productos/Componentes */}
      {filtered.length === 0 ? (
        <Empty description="No se encontraron resultados" />
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map((item) => (
            <Col xs={24} sm={12} lg={8} key={item.id}>
              <Card
                title={item.nombre}
                extra={
                  <span style={{ fontSize: 12, color: '#999' }}>
                    SKU: {item.sku}
                  </span>
                }
              >
                <div style={{ marginBottom: 12 }}>
                  <div style={{ marginBottom: 8 }}>
                    <Typography.Text type="secondary" style={{ marginRight: 8 }}>Precio:</Typography.Text>
                    <Typography.Text strong style={{ fontSize: 16 }}>
                      Bs {item.precio}
                    </Typography.Text>
                  </div>
                  <div>
                    <Typography.Text type="secondary" style={{ marginRight: 8 }}>Stock:</Typography.Text>
                    <Typography.Text
                      strong
                      style={{
                        color: item.stock > 10 ? '#52c41a' : item.stock > 0 ? '#faad14' : '#f5222d',
                      }}
                    >
                      {item.stock}
                    </Typography.Text>
                  </div>
                </div>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Button size="small">Editar</Button>
                  <Button size="small" danger>
                    Eliminar
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}

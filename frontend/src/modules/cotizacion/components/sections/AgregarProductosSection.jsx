import React, { useState, useMemo, useCallback } from 'react'
import { Card, Select, InputNumber, Button, Row, Col, Typography, Space, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'


function AgregarProductosSection({ productos, componentes, cart }) {
  const [selectedId, setSelectedId] = useState(null)
  const [selectedType, setSelectedType] = useState('producto')
  const [cantidad, setCantidad] = useState(1)

  const items = selectedType === 'producto' ? productos.items : componentes.items
  const keyField = selectedType === 'producto' ? 'idProducto' : 'idComponente'
  const isLoading = selectedType === 'producto' ? productos.loading : componentes.loading

  // Memo para evitar recalcular opciones en cada render
  const options = useMemo(() => {
    return items.map((item) => ({
      label: `${item.nombre} (${item.sku || item.codigo || 'S/N'})`,
      value: item[keyField],
      nombreCompleto: item.nombre,
      sku: item.sku || item.codigo || '',
    }))
  }, [items, keyField])

  // Map para acceso O(1) al agregar
  const itemsMap = useMemo(() => {
    const map = new Map()
    items.forEach((item) => map.set(item[keyField], item))
    return map
  }, [items, keyField])

  // Búsqueda por nombre o SKU — solo filterOption, sin optionFilterProp (conflicto en antd)
  const filterOption = useCallback((input, option) => {
    const search = input.toLowerCase()
    return (
      option?.nombreCompleto?.toLowerCase().includes(search) ||
      option?.sku?.toLowerCase().includes(search)
    )
  }, [])

  // Limpiar selectedId al cambiar tipo para evitar IDs huérfanos en itemsMap
  const handleTypeChange = useCallback((type) => {
    setSelectedType(type)
    setSelectedId(null)
  }, [])

  // Nunca dejar cantidad en null si el usuario borra el campo
  const handleCantidadChange = useCallback((v) => {
    setCantidad(v ?? 1)
  }, [])

  const handleAgregar = useCallback(() => {
    if (!selectedId) {
      message.warning('Selecciona un producto o componente')
      return
    }

    const item = itemsMap.get(selectedId)
    if (!item) return

    cart.addItem({
      tipo: selectedType,
      id: selectedId,
      nombre: item.nombre,
      // descripcion || description: inconsistencia del backend — normalizar en la capa de API
      descripcion: item.descripcion || item.description || '',
      cantidad: Math.max(1, Number(cantidad) || 1),
    })

    message.success(`${item.nombre} agregado al carrito`)

    setSelectedId(null)
    setCantidad(1)
  }, [selectedId, selectedType, cantidad, itemsMap, cart])

  return (
    <Card
      variant="borderless"
      style={{
        borderRadius: 8,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
      styles={{
        header: { padding: '16px 24px', borderBottom: '1px solid #f0f0f0' },
        body: { padding: 24 },
      }}
      title={
        <Space>
          <PlusOutlined />
          <span>Agregar Productos</span>
        </Space>
      }
    >
      <Row gutter={[14, 16]} align="bottom">
        <Col xs={24} md={5}>
          <Typography.Text type="secondary">Tipo *</Typography.Text>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            value={selectedType}
            onChange={handleTypeChange}
            options={[
              { label: 'Producto', value: 'producto' },
              { label: 'Componente', value: 'componente' },
            ]}
          />
        </Col>

        <Col xs={24} md={12}>
          <Typography.Text type="secondary">Selecciona producto *</Typography.Text>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Busca por nombre o SKU..."
            value={selectedId}
            onChange={setSelectedId}
            options={options}
            loading={isLoading}
            showSearch
            filterOption={filterOption}
          />
        </Col>

        <Col xs={24} md={4}>
          <Typography.Text type="secondary">Cantidad</Typography.Text>
          <InputNumber
            style={{ width: '100%', marginTop: 8 }}
            min={1}
            value={cantidad}
            onChange={handleCantidadChange}
          />
        </Col>

        <Col xs={24} md={3}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAgregar}
            style={{ width: '100%', marginTop: 8, borderRadius: 6 }}
          >
            Agregar
          </Button>
        </Col>
      </Row>
    </Card>
  )
}

export default AgregarProductosSection

import React, { useState } from 'react';
import { Card, Select, InputNumber, Button, Row, Col, Typography, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

function AgregarProductosSection({ productos, componentes, cart }) {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState('producto');
  const [cantidad, setCantidad] = useState(1);

  const items = selectedType === 'producto' ? productos.items : componentes.items;
  const keyField = selectedType === 'producto' ? 'idProducto' : 'idComponente';

  const options = items.map((item) => ({
    label: `${item.nombre} (${item.sku || item.codigo || 'S/N'})`,
    value: item[keyField],
    nombreCompleto: item.nombre,
    sku: item.sku || item.codigo || '',
    item,
  }));

  const filterOption = (input, option) => {
    const searchText = input.toLowerCase();
    const nombre = (option?.nombreCompleto || '').toLowerCase();
    const sku = (option?.sku || '').toLowerCase();
    return nombre.includes(searchText) || sku.includes(searchText);
  };

  const handleAgregar = () => {
    if (!selectedId) return message.warning('Selecciona un producto o componente');

    const item = items.find((i) => i[keyField] === selectedId);
    if (!item) return;

    cart.addItem({
      tipo: selectedType,
      id: selectedId,
      nombre: item.nombre,
      descripcion: item.descripcion || item.description || '',
      cantidad: Math.max(1, Number(cantidad) || 1),
    });

    message.success(`${item.nombre} agregado al carrito`);
    setSelectedId(null);
    setCantidad(1);
  };

  return (
    <Card
      title={
        <Space>
          <PlusOutlined />
          <span>Agregar Productos</span>
        </Space>
      }
    >
      <Row gutter={[14, 16]} align="bottom">
        <Col xs={24} md={6}>
          <Typography.Text type="secondary">Tipo *</Typography.Text>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            value={selectedType}
            onChange={setSelectedType}
            options={[
              { label: 'Producto', value: 'producto' },
              { label: 'Componente', value: 'componente' },
            ]}
          />
        </Col>

        <Col xs={24} md={11}>
          <Typography.Text type="secondary">Selecciona producto *</Typography.Text>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Busca por nombre o SKU..."
            value={selectedId}
            onChange={setSelectedId}
            options={options}
            loading={selectedType === 'producto' ? productos.loading : componentes.loading}
            showSearch
            filterOption={filterOption}
            optionFilterProp="label"
          />
        </Col>

        <Col xs={24} md={4}>
          <Typography.Text type="secondary">Cantidad</Typography.Text>
          <InputNumber
            style={{ width: '100%' }}
            min={1}
            value={cantidad}
            onChange={setCantidad}
          />
        </Col>

        <Col xs={24} md={2}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAgregar}
            style={{ width: '160%' }}
          >
            Agregar
          </Button>
        </Col>
      </Row>
    </Card>
  );
}

export default AgregarProductosSection;
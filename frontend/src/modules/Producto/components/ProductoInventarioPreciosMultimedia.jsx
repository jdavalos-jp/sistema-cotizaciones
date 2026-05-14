import React from 'react'
import { Card, Form, Input, InputNumber, Typography, theme } from 'antd'
import { DollarOutlined } from '@ant-design/icons'
import ProductoComponentes from './ProductoComponentes'

export default function ProductoInventarioPreciosMultimedia({
  componentesAgregados = [],
  onAgregarComponente,
  onEliminarComponente,
}) {
  const { token } = theme.useToken()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: token.marginMD }}>
      <Card
        title={
          <span>
            <DollarOutlined style={{ color: token.colorPrimary, marginRight: 8, fontSize: 18 }} />
            Inventario y Precios
          </span>
        }
        size="small"
        style={{
          marginBottom: 0,
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${token.colorBorder}`,
          boxShadow: `0 2px 8px ${token.colorBorder}`,
        }}
      >
        <Form.Item
          label="Código / SKU"
          name="sku"
          rules={[
            {
              pattern: /^[A-Za-z0-9._-]{0,100}$/,
              message: 'Usa letras, números, puntos, guiones y guión bajo (máx. 100)',
            },
          ]}
        >
          <Input placeholder="PROD-001" maxLength={100} allowClear />
        </Form.Item>

        <Form.Item
          label="Precio unitario ($)"
          name="precioBase"
          rules={[
            { required: true, message: 'Campo requerido' },
            { type: 'number', min: 1, message: 'Debe ser mayor que 0' },
          ]}
        >
          <InputNumber style={{ width: '100%' }} min={1} step={1} placeholder="0" prefix="$" />
        </Form.Item>

        <Form.Item
          label="Cantidad en stock"
          name="cantidad"
          rules={[
            { required: true, message: 'Campo requerido' },
            { type: 'number', min: 1, message: 'La cantidad debe ser mayor a 0' },
          ]}
        >
          <InputNumber style={{ width: '100%' }} min={1} step={1} placeholder="0" />
        </Form.Item>
      </Card>

      <ProductoComponentes
        componentesAgregados={componentesAgregados}
        onAgregarComponente={onAgregarComponente}
        onEliminarComponente={onEliminarComponente}
      />
    </div>
  )
}
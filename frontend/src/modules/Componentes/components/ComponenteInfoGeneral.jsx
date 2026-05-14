import React from 'react'
import { Card, Form, Input, InputNumber, Typography, theme } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import RichTextEditor from '../../../shared/components/RichTextEditor'

const { Text } = Typography

/**
 * ComponenteInfoGeneral
 * 
 * ¿QUÉ HACE?
 * - Muestra los campos básicos: nombre, SKU, precio, descripción
 * 
 * ¿POR QUÉ ES UN COMPONENTE SEPARADO?
 * - Organización: cada componente = una sección del formulario
 * - Reutilizable: crear y editar usan esto
 * - Mantenimiento: si cambias campos, editas un archivo
 */
export default function ComponenteInfoGeneral() {
  const { token } = theme.useToken()

  return (
    <Card
      title={
        <span>
          <InfoCircleOutlined
            style={{ color: token.colorPrimary, marginRight: 8, fontSize: 18 }}
          />
          Información General
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
      {/* CAMPO: NOMBRE */}
      <Form.Item
        label="Nombre del Componente"
        name="nombre"
        rules={[
          { required: true, message: 'Campo requerido' },
          { min: 3, message: 'Mínimo 3 caracteres' },
          { max: 200, message: 'Máximo 200 caracteres' },
        ]}
      >
        <Input
          placeholder="Ej. Resistencia 10K Ohm"
          maxLength={200}
          allowClear
        />
      </Form.Item>

      {/* CAMPO: SKU */}
      <Form.Item
        label="SKU (Código del Componente)"
        name="sku"
        rules={[
          { max: 100, message: 'Máximo 100 caracteres' },
          { pattern: /^[A-Za-z0-9._-]*$/, message: 'Solo letras, números, puntos y guiones' },
        ]}
      >
        <Input
          placeholder="Ej. RES-10K-5W"
          maxLength={100}
          allowClear
        />
      </Form.Item>

      {/* CAMPO: PRECIO */}
      <Form.Item
        label="Precio Base (Bs)"
        name="precioBase"
        rules={[
          { required: true, message: 'Precio requerido' },
          {
            type: 'number',
            min: 0,
            message: 'Debe ser >= 0',
          },
        ]}
      >
        <InputNumber
          placeholder="0"
          min={0}
          step={1}
          style={{ width: '100%' }}
        />
      </Form.Item>

      {/* CAMPO: DESCRIPCIÓN */}
      <Form.Item
        label="Descripción"
        name="descripcion"
        rules={[{ max: 1000, message: 'Máximo 1000 caracteres' }]}
      >
        <RichTextEditor
          placeholder="Detalles adicionales del componente..."
          maxLength={1000}
        />
      </Form.Item>
    </Card>
  )
}
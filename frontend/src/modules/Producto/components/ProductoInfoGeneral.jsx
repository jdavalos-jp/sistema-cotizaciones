import React from 'react'
import { Card, Form, Input, Typography, theme } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'

const { Text } = Typography

export default function ProductoInfoGeneral() {
  const { token } = theme.useToken()

  return (
    <Card
      title={
        <span>
          <InfoCircleOutlined style={{ color: token.colorPrimary, marginRight: 8, fontSize: 18 }} />
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
      <Form.Item
        label="Nombre del producto"
        name="nombre"
        rules={[
          { required: true, message: 'Campo requerido' },
          { min: 2, message: 'Mínimo 2 caracteres' },
          { max: 255, message: 'Máximo 255 caracteres' },
        ]}
      >
        <Input placeholder="Ej. Reloj Inteligente Serie 5" maxLength={255} allowClear />
      </Form.Item>

      <Form.Item
        label="Descripción"
        name="descripcion"
        rules={[{ max: 500, message: 'Máximo 500 caracteres' }]}
      >
        <Input.TextArea
          placeholder="Describe las características principales, beneficios y materiales..."
          rows={4}
          maxLength={500}
          showCount
          allowClear
        />
      </Form.Item>
     </Card>
  )
}
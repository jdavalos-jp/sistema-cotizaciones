import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input } from 'antd'

function InfoGeneral() {
  return (
    <>
      <Form.Item
        label="Nombre del producto"
        name="nombre"
        rules={[
          { required: true, message: 'Por favor, ingresa el nombre del producto' },
          { min: 2, message: 'El nombre debe tener al menos 2 caracteres' },
        ]}
      >
        <Input placeholder="Nombre del producto" maxLength={100} />
      </Form.Item>

      <Form.Item
        label="Descripción"
        name="descripcion"
        rules={[{ max: 500, message: 'Máximo 500 caracteres' }]}
      >
        <Input.TextArea
          placeholder="Descripción detallada del producto"
          rows={4}
          maxLength={500}
          showCount
        />
      </Form.Item>

      <Form.Item
        label="SKU"
        name="sku"
        rules={[
          { max: 100, message: 'Máximo 100 caracteres' },
          { pattern: /^[A-Za-z0-9._-]*$/, message: 'Usa letras, números, puntos, guiones y guión bajo' }
        ]}
      >
        <Input placeholder="Código SKU (opcional)" maxLength={100} />
      </Form.Item>
    </>
  )
}

InfoGeneral.propTypes = {}

export default InfoGeneral
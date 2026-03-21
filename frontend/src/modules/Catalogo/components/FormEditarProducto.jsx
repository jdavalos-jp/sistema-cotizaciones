import React from 'react'
import { Form, Input, InputNumber, Button, Space, message } from 'antd'
import { DollarOutlined } from '@ant-design/icons'

export default function FormEditarProducto({ producto, onSuccess, onCancel }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    form.setFieldsValue({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
    })
  }, [producto, form])

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      await onSuccess(values)
    } catch (err) {
      message.error(err.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item
        label="Nombre"
        name="nombre"
        rules={[{ required: true, message: 'Ingresa el nombre' }]}
      >
        <Input placeholder="Nombre del producto" />
      </Form.Item>

      <Form.Item
        label="Descripción"
        name="descripcion"
        rules={[{ required: true, message: 'Ingresa la descripción' }]}
      >
        <Input.TextArea rows={3} placeholder="Descripción del producto" />
      </Form.Item>

      <Form.Item
        label="Precio (Bs)"
        name="precio"
        rules={[{ required: true, message: 'Ingresa el precio' }]}
      >
        <InputNumber
          min={0}
          step={0.01}
          prefix={<DollarOutlined />}
          style={{ width: '100%' }}
          placeholder="0.00"
        />
      </Form.Item>

      <Form.Item
        label="Stock"
        name="stock"
        rules={[{ required: true, message: 'Ingresa el stock' }]}
      >
        <InputNumber
          min={0}
          step={1}
          style={{ width: '100%' }}
          placeholder="0"
        />
      </Form.Item>

      <Form.Item>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>Cancelar</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Guardar Cambios
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

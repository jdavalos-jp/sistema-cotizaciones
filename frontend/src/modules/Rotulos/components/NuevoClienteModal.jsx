import { useState } from 'react'
import { Button, Col, Form, Input, Modal, Row, Space, message } from 'antd'
import { createCliente } from '../../Clientes/api/clientesApi.js'

export default function NuevoClienteModal({ open, onClose, onCreated }) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (values) => {
    setSubmitting(true)
    try {
      const cliente = await createCliente({
        nombreCompleto: values.nombreCompleto.trim(),
        cargo: values.cargo?.trim() || null,
        email: values.email?.trim() || null,
        telefono: values.telefono?.trim() || null,
        ciudad: values.ciudad?.trim() || null,
      })
      form.resetFields()
      message.success('Cliente registrado')
      onCreated(cliente)
      onClose()
    } catch (error) {
      message.error(error.message || 'No se pudo registrar el cliente')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (submitting) return
    form.resetFields()
    onClose()
  }

  return (
    <Modal title="Registrar nuevo cliente" open={open} onCancel={handleClose} footer={null} destroyOnHidden>
      <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
        <Form.Item
          label="Nombre completo"
          name="nombreCompleto"
          rules={[
            { required: true, whitespace: true, message: 'Ingresa el nombre del cliente' },
            { min: 3, message: 'El nombre debe tener al menos 3 caracteres' },
            { max: 200, message: 'Máximo 200 caracteres' },
          ]}
        >
          <Input placeholder="Nombre completo" />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item label="Cargo" name="cargo" rules={[{ max: 150, message: 'Máximo 150 caracteres' }]}>
              <Input placeholder="Cargo o área" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Ciudad" name="ciudad" rules={[{ max: 100, message: 'Máximo 100 caracteres' }]}>
              <Input placeholder="Ciudad" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Correo"
              name="email"
              rules={[
                { type: 'email', message: 'Ingresa un correo válido' },
                { max: 150, message: 'Máximo 150 caracteres' },
              ]}
            >
              <Input type="email" placeholder="correo@empresa.com" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Teléfono"
              name="telefono"
              rules={[
                { pattern: /^[\d\s+()-]*$/, message: 'Ingresa un teléfono válido' },
                { max: 30, message: 'Máximo 30 caracteres' },
              ]}
            >
              <Input placeholder="+591 70000000" />
            </Form.Item>
          </Col>
        </Row>

        <Space className="rotulo-form__actions">
          <Button onClick={handleClose} disabled={submitting}>Cancelar</Button>
          <Button type="primary" htmlType="submit" loading={submitting}>Registrar cliente</Button>
        </Space>
      </Form>
    </Modal>
  )
}

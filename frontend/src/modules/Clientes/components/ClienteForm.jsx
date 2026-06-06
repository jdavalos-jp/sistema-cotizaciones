import React, { useEffect, useMemo, useState } from 'react'
import { Card, Col, Form, Input, message, Row, Space, Spin, Typography } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { useClientesManager } from '../hooks/useClientesManager'
import FormActionBar from '../../../shared/components/FormActionBar'

const { Title, Text } = Typography

function ClienteForm({ onSuccess, onCancel, idClienteEdit = null }) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const { cliente, loading: loadingCliente, createCliente, updateCliente } = useClientesManager(idClienteEdit)

  const title = idClienteEdit ? 'Editar Cliente' : 'Crear Cliente'
  const breadcrumb = idClienteEdit
    ? 'Inicio / Clientes / Editar cliente'
    : 'Inicio / Clientes / Nuevo cliente'

  useEffect(() => {
    if (!idClienteEdit || !cliente) return

    form.setFieldsValue({
      nombreCompleto: cliente.nombreCompleto || '',
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      ciudad: cliente.ciudad || '',
      cargo: cliente.cargo || '',
      institucion: cliente.institucion || '',
      direccion: cliente.direccion || '',
      observaciones: cliente.observaciones || '',
    })
  }, [idClienteEdit, cliente, form])

  const watchedNombre = Form.useWatch('nombreCompleto', form)

  const canSubmit = useMemo(() => {
    return String(watchedNombre || '').trim().length >= 3 && !loadingCliente
  }, [watchedNombre, loadingCliente])

  const handleSubmit = async (values) => {
    setSubmitting(true)

    try {
      const payload = {
        nombreCompleto: values.nombreCompleto?.trim(),
        email: values.email?.trim() || null,
        telefono: values.telefono?.trim() || null,
        ciudad: values.ciudad?.trim() || null,
        cargo: values.cargo?.trim() || null,
        institucion: values.institucion?.trim() || null,
        direccion: values.direccion?.trim() || null,
        observaciones: values.observaciones?.trim() || null,
      }

      if (idClienteEdit) {
        await updateCliente(payload)
        message.success('Cliente actualizado')
      } else {
        await createCliente(payload)
        message.success('Cliente creado')
      }

      form.resetFields()
      onSuccess?.()
    } catch (error) {
      message.error(error.message || 'Error al guardar cliente')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ background: '#f7f8fa', minHeight: '100vh', margin: '-24px', padding: 24 }}>
      <div style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 88 }}>
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {title}
            </Title>
            <Text type="secondary">{breadcrumb}</Text>
          </div>

          <Spin spinning={loadingCliente}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
              requiredMark={false}
            >
              <Card variant="borderless" styles={{ body: { padding: 24 } }} style={{ borderRadius: 8 }}>
                <Title level={5} style={{ marginTop: 0 }}>
                  Datos principales
                </Title>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Nombre completo"
                      name="nombreCompleto"
                      rules={[
                        { required: true, message: 'El nombre es requerido' },
                        { min: 3, message: 'El nombre debe tener al menos 3 caracteres' },
                        { max: 200, message: 'El nombre no puede exceder 200 caracteres' },
                      ]}
                    >
                      <Input placeholder="Nombre del cliente" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Institucion o empresa"
                      name="institucion"
                      rules={[{ max: 200, message: 'La institucion no puede exceder 200 caracteres' }]}
                    >
                      <Input placeholder="Empresa o institucion" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Cargo"
                      name="cargo"
                      rules={[{ max: 150, message: 'El cargo no puede exceder 150 caracteres' }]}
                    >
                      <Input placeholder="Cargo o rol" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Ciudad"
                      name="ciudad"
                      rules={[{ max: 100, message: 'La ciudad no puede exceder 100 caracteres' }]}
                    >
                      <Input placeholder="Ciudad" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card variant="borderless" styles={{ body: { padding: 24 } }} style={{ borderRadius: 8, marginTop: 16 }}>
                <Title level={5} style={{ marginTop: 0 }}>
                  Contacto
                </Title>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        { type: 'email', message: 'Email invalido' },
                        { max: 150, message: 'El email no puede exceder 150 caracteres' },
                      ]}
                    >
                      <Input placeholder="correo@empresa.com" type="email" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Telefono"
                      name="telefono"
                      rules={[
                        {
                          pattern: /^[\d\s+()-]*$/,
                          message: 'Telefono invalido',
                        },
                        { max: 30, message: 'El telefono no puede exceder 30 caracteres' },
                      ]}
                    >
                      <Input placeholder="+591 70000000" />
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Form.Item
                      label="Direccion"
                      name="direccion"
                      rules={[{ max: 500, message: 'La direccion no puede exceder 500 caracteres' }]}
                    >
                      <Input.TextArea rows={2} placeholder="Direccion de referencia" />
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Form.Item
                      label="Contacto en la institucion"
                      name="observaciones"
                      rules={[{ max: 1000, message: 'El contacto en la institucion no puede exceder 1000 caracteres' }]}
                    >
                      <Input.TextArea rows={3} placeholder="Nombre de la persona de contacto" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
              <FormActionBar
                left={idClienteEdit ? 'Editando cliente' : 'Nuevo cliente'}
                actions={[
                  {
                    key: 'cancel',
                    label: 'Cancelar',
                    onClick: onCancel,
                    disabled: submitting,
                  },
                  {
                    key: 'save',
                    label: 'Guardar',
                    type: 'primary',
                    htmlType: 'submit',
                    icon: <SaveOutlined />,
                    loading: submitting,
                    disabled: !canSubmit,
                  },
                ]}
              /></Form>
          </Spin>
        </Space>
      </div>
    </div>
  )
}

export default ClienteForm

import React, { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Form,
  Input,
  message,
  Typography,
  Spin,
  Row,
  Col,
} from 'antd'
import { useClientesManager } from '../hooks/useClientesManager'

const { Title, Text } = Typography

function ClienteForm({ onSuccess, onCancel, idClienteEdit = null }) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const { cliente, loading: loadingCliente, createCliente, updateCliente } = useClientesManager(idClienteEdit)

  const title = idClienteEdit ? 'Editar Cliente' : 'Agregar Cliente'
  const subtitle = idClienteEdit
    ? 'Actualiza la información del cliente.'
    : 'Completa la información del nuevo cliente.'

  /**
   * Cargar datos del cliente en el formulario (modo edición)
   */
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

  /**
   * Validar si el formulario puede ser enviado
   */
  const watchedNombre = Form.useWatch('nombreCompleto', form)

  const canSubmit = useMemo(() => {
    const nombreOk = String(watchedNombre || '').trim().length >= 3
    return nombreOk && !loadingCliente
  }, [watchedNombre, loadingCliente])

  /**
   * Manejar envío del formulario
   */
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
        message.success('Cliente actualizado exitosamente')
      } else {
        await createCliente(payload)
        message.success('Cliente creado exitosamente')
      }

      // Limpiar formulario
      form.resetFields()

      // Llamar callback de éxito
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      message.error(error.message || 'Error al guardar cliente')
      console.error('Error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Spin spinning={loadingCliente}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginTop: 0, marginBottom: 8 }}>
          {title}
        </Title>
        <Text type="secondary">{subtitle}</Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        requiredMark
      >
          {/* Nombre Completo - Campo requerido */}
          <Form.Item
            label="Nombre Completo"
            name="nombreCompleto"
            rules={[
              { required: true, message: 'El nombre es requerido' },
              { min: 3, message: 'El nombre debe tener al menos 3 caracteres' },
              { max: 200, message: 'El nombre no puede exceder 200 caracteres' },
            ]}
          >
            <Input placeholder="Ej: Juan Pérez García" />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { type: 'email', message: 'Email inválido' },
              { max: 150, message: 'El email no puede exceder 150 caracteres' },
            ]}
          >
            <Input placeholder="Ej: juan@ejemplo.com" type="email" />
          </Form.Item>

          {/* Teléfono */}
          <Form.Item
            label="Teléfono"
            name="telefono"
            rules={[
              {
                pattern: /^[\d\s\-\+\(\)]*$/,
                message: 'Teléfono inválido',
              },
              { max: 30, message: 'El teléfono no puede exceder 30 caracteres' },
            ]}
          >
            <Input placeholder="Ej: +58 414 1234567" />
          </Form.Item>

          {/* Dos columnas para ciudad y cargo */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Ciudad"
                name="ciudad"
                rules={[
                  { max: 100, message: 'La ciudad no puede exceder 100 caracteres' },
                ]}
              >
                <Input placeholder="Ej: Caracas" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Cargo"
                name="cargo"
                rules={[
                  { max: 150, message: 'El cargo no puede exceder 150 caracteres' },
                ]}
              >
                <Input placeholder="Ej: Gerente de Compras" />
              </Form.Item>
            </Col>
          </Row>

          {/* Institución */}
          <Form.Item
            label="Institución/Empresa"
            name="institucion"
            rules={[
              { max: 200, message: 'La institución no puede exceder 200 caracteres' },
            ]}
          >
            <Input placeholder="Ej: Empresa XYZ S.A." />
          </Form.Item>

          {/* Dirección */}
          <Form.Item
            label="Dirección"
            name="direccion"
            rules={[
              { max: 500, message: 'La dirección no puede exceder 500 caracteres' },
            ]}
          >
            <Input.TextArea
              rows={2}
              placeholder="Ej: Avenida Principal 123, Piso 5"
            />
          </Form.Item>

          {/* Observaciones */}
          <Form.Item
            label="Observaciones"
            name="observaciones"
            rules={[
              { max: 1000, message: 'Las observaciones no pueden exceder 1000 caracteres' },
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Notas adicionales sobre el cliente..."
            />
          </Form.Item>

          {/* Botones */}
          <div style={{ marginTop: 32, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={onCancel}>Cancelar</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              disabled={!canSubmit}
            >
              {idClienteEdit ? 'Actualizar' : 'Crear Cliente'}
            </Button>
          </div>
        </Form>
    </Spin>
  )
}

export default ClienteForm

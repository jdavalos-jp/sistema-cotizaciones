import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, InputNumber, message, Spin, Typography, theme, Flex, Divider } from 'antd'
import { useComponente } from '../hooks/useComponentesManager'

const { Title, Text } = Typography

/**
 * ComponenteForm - Formulario para crear/editar componentes
 * Interfaz limpia, directa a producción
 */
function ComponenteForm({ onSuccess, onCancel, idComponenteEdit = null }) {
  const [form] = Form.useForm()
  const { token } = theme.useToken()

  const [submitting, setSubmitting] = useState(false)
  const { componente, loading, createComponente, updateComponente } = useComponente(idComponenteEdit)

  const title = idComponenteEdit ? 'Editar Componente' : 'Crear Nuevo Componente'
  const subtitle = idComponenteEdit
    ? 'Actualiza la información del componente en el catálogo.'
    : 'Completa la información para registrar un nuevo componente.'

  /**
   * Cargar datos en modo edición
   */
  useEffect(() => {
    if (!idComponenteEdit || !componente) return

    form.setFieldsValue({
      nombre: componente.nombre || '',
      descripcion: componente.descripcion || '',
      precioBase: componente.precioBase ? Number(componente.precioBase) : undefined,
      sku: componente.sku || '',
    })
  }, [idComponenteEdit, componente, form])

  /**
   * Watch fields para validación
   */
  const watchedNombre = Form.useWatch('nombre', form)
  const watchedPrecioBase = Form.useWatch('precioBase', form)

  /**
   * Verificar si se puede submit
   */
  const canSubmit = useMemo(() => {
    const nombreOk = String(watchedNombre || '').trim().length >= 3
    const precioOk = watchedPrecioBase !== null && watchedPrecioBase !== undefined && watchedPrecioBase >= 0
    return nombreOk && precioOk && !loading
  }, [watchedNombre, watchedPrecioBase, loading])

  /**
   * Manejar submit del formulario
   */
  const handleSubmit = async (values) => {
    setSubmitting(true)
    try {
      const payload = {
        nombre: values.nombre?.trim(),
        descripcion: values.descripcion?.trim() || null,
        precioBase: Number(values.precioBase),
        sku: values.sku?.trim() || null,
      }

      if (idComponenteEdit) {
        await updateComponente(payload)
        message.success('Componente actualizado exitosamente')
      } else {
        await createComponente(payload)
        message.success('Componente registrado exitosamente')
        form.resetFields()
      }

      onSuccess?.()
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Error al guardar componente'
      message.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 600 }}>
      {/* Encabezado */}
      <div style={{ marginBottom: token.marginLG }}>
        <Title level={3} style={{ margin: 0 }}>
          {title}
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          {subtitle}
        </Text>
      </div>

      {/* Loading state */}
      {loading && idComponenteEdit ? (
        <Flex justify="center" style={{ padding: token.paddingXL }}>
          <Spin size="large" />
        </Flex>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={{
            nombre: '',
            descripcion: '',
            precioBase: 0,
            sku: '',
          }}
        >
          {/* Campo: Nombre */}
          <Form.Item
            label="Nombre del Componente"
            name="nombre"
            rules={[
              { required: true, message: 'Nombre es requerido' },
              { min: 3, message: 'Nombre debe tener al menos 3 caracteres' },
              { max: 200, message: 'Nombre no puede exceder 200 caracteres' },
            ]}
          >
            <Input
              placeholder="Ej: Resistencia 10K Ohm"
              size="large"
              disabled={submitting}
              maxLength={200}
            />
          </Form.Item>

          {/* Campo: SKU */}
          <Form.Item
            label="SKU (Código del Producto)"
            name="sku"
            rules={[
              { max: 100, message: 'SKU no puede exceder 100 caracteres' },
              {
                pattern: /^[A-Z0-9\-_]*$/i,
                message: 'SKU solo puede contener letras, números, guiones y guiones bajos',
              },
            ]}
          >
            <Input
              placeholder="Ej: RES-10K-5W"
              size="large"
              disabled={submitting}
              maxLength={100}
            />
          </Form.Item>

          {/* Campo: Precio Base */}
          <Form.Item
            label="Precio Base (Bs)"
            name="precioBase"
            rules={[
              { required: true, message: 'Precio es requerido' },
              {
                type: 'number',
                min: 0,
                message: 'Precio debe ser un número no negativo',
              },
            ]}
          >
            <InputNumber
              placeholder="0"
              size="large"
              disabled={submitting}
              min={0}
              step={1}
              style={{ width: '100%' }}
            />
          </Form.Item>

          {/* Campo: Descripción */}
          <Form.Item
            label="Descripción"
            name="descripcion"
            rules={[{ max: 1000, message: 'Descripción no puede exceder 1000 caracteres' }]}
          >
            <Input.TextArea
              placeholder="Detalles adicionales del componente..."
              rows={4}
              size="large"
              disabled={submitting}
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Divider style={{ margin: `${token.marginLG}px 0` }} />

          {/* Botones de acción */}
          <Flex justify="flex-end" gap={token.marginMD}>
            <Button
              onClick={onCancel}
              size="large"
              style={{ borderRadius: token.borderRadiusLG }}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              disabled={submitting || !canSubmit}
              size="large"
              style={{ borderRadius: token.borderRadiusLG, fontWeight: 600 }}
            >
              {idComponenteEdit ? 'Actualizar' : 'Crear'}
            </Button>
          </Flex>
        </Form>
      )}
    </div>
  )
}

export default ComponenteForm

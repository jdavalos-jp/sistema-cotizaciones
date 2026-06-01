import { useEffect, useMemo, useState } from 'react'
import { Button, Form, message, Row, Col, Spin, Typography, Card, Space, Select } from 'antd'
import { CheckCircleFilled, TagsOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import CategoriaInfoGeneral from './CategoriaInfoGeneral'
import * as categoriasApi from '../../services/categoriasApi'

const { Title, Text } = Typography

export default function CategoriaFormPage({ idCategoriaEdit = null }) {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)

  const title = idCategoriaEdit ? 'Editar Categoría' : 'Crear Nueva Categoría'
  const breadcrumb = `Inicio / Categorías / ${idCategoriaEdit ? 'Editar Categoría' : 'Nueva Categoría'}`

  useEffect(() => {
    if (!idCategoriaEdit) return undefined

    const controller = new AbortController()

    async function loadCategoria() {
      try {
        setLoading(true)
        const data = await categoriasApi.getCategoria(idCategoriaEdit, { signal: controller.signal })

        form.setFieldsValue({
          nombre: data.nombre || '',
          descripcion: data.descripcion || '',
          estado: String(data.estado || 'activo').toLowerCase(),
          subcategorias: Array.isArray(data.subcategorias) ? data.subcategorias : [],
        })
      } catch (error) {
        if (error.name !== 'AbortError') {
          message.error('Error al cargar la categoría')
          navigate(-1)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadCategoria()
    return () => controller.abort()
  }, [idCategoriaEdit, form, navigate])

  const watchedNombre = Form.useWatch('nombre', form)
  const watchedDescripcion = Form.useWatch('descripcion', form)

  const canSubmit = useMemo(() => {
    const nombreOk = String(watchedNombre || '').trim().length >= 3
    const descripcion = String(watchedDescripcion || '').trim()
    const descripcionOk = !descripcion || descripcion.length >= 10

    return nombreOk && descripcionOk && !loading
  }, [watchedNombre, watchedDescripcion, loading])

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true)

      const formData = new FormData()
      formData.append('nombre', String(values.nombre || '').trim())
      formData.append('descripcion', String(values.descripcion || '').trim())
      formData.append('estado', values.estado || 'activo')
      formData.append('subcategorias', JSON.stringify(values.subcategorias || []))

      if (idCategoriaEdit) {
        await categoriasApi.updateCategoria(idCategoriaEdit, formData)
        message.success('Categoría actualizada correctamente')
      } else {
        await categoriasApi.createCategoria(formData)
        message.success('Categoría creada correctamente')
      }

      navigate('/categorias')
    } catch (error) {
      message.error(error.message || 'Error al guardar la categoría')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ backgroundColor: '#f5f7fb', padding: 24, minHeight: '100vh', margin: -24 }}>
      <div style={{ flex: 1, maxWidth: 1180, margin: '0 auto', width: '100%', paddingBottom: 88 }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, fontWeight: 600 }}>
            {title}
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            {breadcrumb}
          </Text>
        </div>

        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            initialValues={{ estado: 'activo', subcategorias: [] }}
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={8}>
                <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                  <Card
                    variant="borderless"
                    style={{ borderRadius: 8, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)' }}
                    styles={{ body: { padding: 24 } }}
                  >
                    <Space align="start" size={12}>
                      <TagsOutlined style={{ color: '#1677ff', fontSize: 22, marginTop: 2 }} />
                      <div>
                        <Text strong>Clasificación del catálogo</Text>
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary">
                            Las categorías activas alimentan los selectores de productos y componentes.
                          </Text>
                        </div>
                      </div>
                    </Space>
                  </Card>

                  <Card
                    title={
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, fontSize: 16 }}>Estado</span>
                        <CheckCircleFilled style={{ color: '#52c41a' }} />
                      </Space>
                    }
                    variant="borderless"
                    style={{ borderRadius: 8, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)' }}
                    styles={{ body: { padding: 24 } }}
                  >
                    <Form.Item
                      label="Estado de la categoría"
                      name="estado"
                      rules={[{ required: true, message: 'Selecciona un estado' }]}
                      style={{ marginBottom: 8 }}
                    >
                      <Select
                        options={[
                          { value: 'activo', label: 'Activo' },
                          { value: 'inactivo', label: 'Inactivo' },
                        ]}
                      />
                    </Form.Item>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Una categoría inactiva no debería usarse para nuevas altas del catálogo.
                    </Text>
                  </Card>
                </Space>
              </Col>

              <Col xs={24} lg={16}>
                <CategoriaInfoGeneral />
              </Col>
            </Row>

            <div
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: '100%',
                background: '#fff',
                borderTop: '1px solid #f0f0f0',
                padding: '16px 24px',
                zIndex: 10,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 16,
                boxShadow: '0 -8px 24px rgba(15, 23, 42, 0.06)',
              }}
            >
              <Button size="large" onClick={() => navigate('/categorias')} style={{ borderRadius: 8, minWidth: 100 }}>
                Cancelar
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={submitting}
                disabled={!canSubmit}
                style={{ borderRadius: 8, minWidth: 100, fontWeight: 600 }}
              >
                Guardar
              </Button>
            </div>
          </Form>
        </Spin>
      </div>
    </div>
  )
}

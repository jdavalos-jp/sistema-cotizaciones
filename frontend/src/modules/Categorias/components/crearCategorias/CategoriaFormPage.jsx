import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Button, Form, message, Row, Col, Spin, Typography, theme, Card, Space, Select } from 'antd'
import { CheckCircleFilled } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import CategoriaImagenUpload from './CategoriaImagenUpload'
import CategoriaInfoGeneral from './CategoriaInfoGeneral'
import * as categoriasApi from '../../services/categoriasApi'

const { Title, Text } = Typography

/**
 * CategoriaFormPage
 * Página para crear/editar categorías
 */
export default function CategoriaFormPage({ idCategoriaEdit = null }) {
  const navigate = useNavigate()
  const { token } = theme.useToken()
  const [form] = Form.useForm()

  // Estados
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fileList, setFileList] = useState([])
  const [previewUrl, setPreviewUrl] = useState('')
  const [categoria, setCategoria] = useState(null)

  const title = idCategoriaEdit ? 'Editar Categoría' : 'Crear Nueva Categoría'
  const breadcrumb = 'Inicio / Categorías / ' + (idCategoriaEdit ? 'Editar Categoría' : 'Nueva Categoría')

  // ============ CARGAR DATOS EN EDICIÓN =============
  useEffect(() => {
    if (!idCategoriaEdit) return

    const loadCategoria = async () => {
      try {
        setLoading(true)
        const data = await categoriasApi.getCategoria(idCategoriaEdit)
        setCategoria(data)

        form.setFieldsValue({
          nombre: data.nombre || '',
          descripcion: data.descripcion || '',
          estado: data.estado || 'Activo',
        })

        if (data.imagen) {
          setPreviewUrl(data.imagen)
          setFileList([
            {
              uid: 'imagen-actual',
              name: 'imagen-categoria',
              status: 'done',
              url: data.imagen,
            },
          ])
        }
      } catch (error) {
        message.error('Error al cargar la categoría')
        navigate(-1)
      } finally {
        setLoading(false)
      }
    }

    loadCategoria()
  }, [idCategoriaEdit, form, navigate])

  // ============ ESCUCHAR EVENTO DE PREVIEW =============
  useEffect(() => {
    const handleImagePreview = (e) => {
      setPreviewUrl(e.detail)
    }

    document.addEventListener('image-preview', handleImagePreview)
    return () => document.removeEventListener('image-preview', handleImagePreview)
  }, [])

  // ============ WATCH: MONITOREAR CAMBIOS =============
  const watchedNombre = Form.useWatch('nombre', form)
  const watchedDescripcion = Form.useWatch('descripcion', form)

  // ============ VALIDACIÓN: ¿PUEDE ENVIAR? =============
  const canSubmit = useMemo(() => {
    const nombreOk = String(watchedNombre || '').trim().length >= 3
    const descripcionOk = String(watchedDescripcion || '').trim().length >= 10

    return nombreOk && descripcionOk && !loading
  }, [watchedNombre, watchedDescripcion, loading])

  // ============ MANEJAR CAMBIO DE ARCHIVO =============
  const handleFileChange = (newFileList) => {
    setFileList(newFileList)
  }

  // ============ BORRAR IMAGEN =============
  const handleDeleteImage = useCallback(() => {
    setFileList([])
    setPreviewUrl('')
  }, [])

  // ============ ENVIAR FORMULARIO =============
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true)

      const formData = new FormData()
      formData.append('nombre', values.nombre)
      formData.append('descripcion', values.descripcion)
      formData.append('estado', values.estado || 'Activo')

      // Agregar imagen si existe
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('imagen', fileList[0].originFileObj)
      }

      if (idCategoriaEdit) {
        await categoriasApi.updateCategoria(idCategoriaEdit, formData)
        message.success('Categoría actualizada correctamente')
      } else {
        await categoriasApi.createCategoria(formData)
        message.success('Categoría creada correctamente')
      }

      navigate(-1)
    } catch (error) {
      message.error(error.message || 'Error al guardar la categoría')
    } finally {
      setSubmitting(false)
    }
  }

  // ============ RENDER =============
  return (
    <div style={{ backgroundColor: '#f5f5f5', padding: '24px', minHeight: '100vh', margin: '-24px' }}>
      <div style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', paddingBottom: '80px' }}>

        {/* Header Breadcrumb & Title */}
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, fontWeight: 600 }}>{title}</Title>
          <Text type="secondary" style={{ fontSize: 14 }}>{breadcrumb}</Text>
        </div>

        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            initialValues={{ estado: 'Activo' }}
          >
            <Row gutter={[24, 24]}>
              {/* Left Column */}
              <Col xs={24} lg={8}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <CategoriaImagenUpload
                    fileList={fileList}
                    onFileChange={handleFileChange}
                    onDeleteImage={handleDeleteImage}
                    previewUrl={previewUrl}
                  />

                  {/* Card de Estado */}
                  <Card
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: 16 }}>Estados</span>
                        <CheckCircleFilled style={{ color: '#52c41a' }} />
                      </div>
                    }
                    bodyStyle={{ padding: 24 }}
                    style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                  >
                    <Form.Item
                      label={<span style={{ fontWeight: 500 }}>Estado de la categoría</span>}
                      name="estado"
                      rules={[{ required: true, message: 'Campo requerido' }]}
                      style={{ marginBottom: 8 }}
                    >
                      <Select size="large">
                        <Select.Option value="Activo">Activo</Select.Option>
                        <Select.Option value="Inactivo">Inactivo</Select.Option>
                      </Select>
                    </Form.Item>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Define si la categoría se muestra como Activa o Inactiva.
                    </Text>
                  </Card>
                </Space>
              </Col>

              {/* Right Column */}
              <Col xs={24} lg={16}>
                <CategoriaInfoGeneral form={form} />
              </Col>
            </Row>

            {/* Footer fixed */}
            <div style={{
              position: 'fixed', bottom: 0, left: 0, width: '100%',
              background: '#fff', borderTop: '1px solid #f0f0f0',
              padding: '16px 24px', zIndex: 10, display: 'flex', justifyContent: 'flex-end', gap: 16
            }}>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={submitting}
                disabled={!canSubmit}
                style={{ borderRadius: 8, minWidth: 100 }}
              >
                Guardar
              </Button>
              <Button size="large" onClick={() => navigate(-1)} style={{ borderRadius: 8, minWidth: 100 }}>
                Cancelar
              </Button>
            </div>
          </Form>
        </Spin>
      </div>
    </div>
  )
}

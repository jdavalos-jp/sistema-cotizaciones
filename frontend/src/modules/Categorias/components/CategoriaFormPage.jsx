import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Button, Form, message, Row, Col, Spin, Typography, theme, Flex } from 'antd'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftOutlined } from '@ant-design/icons'
import CategoriaImagenUpload from './CategoriaImagenUpload'
import CategoriaInfoGeneral from './CategoriaInfoGeneral'
import * as categoriasApi from '../services/categoriasApi'

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
  const subtitle = idCategoriaEdit
    ? 'Actualiza la información de la categoría.'
    : 'Completa la información para registrar una nueva categoría.'

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
    const descripcionOk = String(watchedDescripcion || '').trim().length >= 3

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

      // Redirigir a lista
      navigate(-1)
    } catch (error) {
      message.error(error.message || 'Error al guardar la categoría')
    } finally {
      setSubmitting(false)
    }
  }

  // ============ RENDER =============
  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* HEADER */}
      <Flex align="center" gap="middle" style={{ marginBottom: 32 }}>
        <Button
          type="text"
          size="large"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        />
        <div>
          <Title level={2} style={{ margin: 0 }}>
            {title}
          </Title>
          <Text type="secondary">{subtitle}</Text>
        </div>
      </Flex>

      {/* CONTENEDOR PRINCIPAL */}
      <Spin spinning={loading}>
        <Row gutter={[24, 24]}>
          {/* COLUMNA IZQUIERDA - IMAGEN */}
          <Col xs={24} lg={8}>
            <CategoriaImagenUpload
              fileList={fileList}
              onFileChange={handleFileChange}
              onDeleteImage={handleDeleteImage}
              previewUrl={previewUrl}
            />
          </Col>

          {/* COLUMNA DERECHA - FORMULARIO */}
          <Col xs={24} lg={16}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
            >
              <CategoriaInfoGeneral />

              {/* BOTONES */}
              <Flex gap="middle" justify="flex-end" style={{ marginTop: 24 }}>
                <Button size="large" onClick={() => navigate(-1)}>
                  Cancelar
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={submitting}
                  disabled={!canSubmit}
                >
                  {idCategoriaEdit ? 'Actualizar' : 'Crear'} Categoría
                </Button>
              </Flex>
            </Form>
          </Col>
        </Row>
      </Spin>
    </div>
  )
}

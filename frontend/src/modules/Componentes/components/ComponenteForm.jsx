import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Form, message, Row, Col, Spin, Typography, theme, Flex, Divider } from 'antd'
import { useComponentesManager } from '../hooks/useComponentesManager'
import { useImagenesComponente } from '../../../hooks/useImagenes'
import { uploadImagenComponente, deleteImagenComponente } from '../../../services/api/imagenes'
import * as componentesApi from '../Services/api/componentesApi'

import ImageUpload from '../../../shared/components/ImageUpload'
import ComponenteInfoGeneral from './ComponenteInfoGeneral'
import ComponenteProductoSelector from './ComponenteProductoSelector'
import FormActionBar from '../../../shared/components/FormActionBar'

const { Title, Text } = Typography

function ComponenteForm({ onSuccess, onCancel, idComponenteEdit = null }) {
  const [form] = Form.useForm()
  const { token } = theme.useToken()

  const [submitting, setSubmitting] = useState(false)
  const [fileList, setFileList] = useState([])
  const [uploadPhase, setUploadPhase] = useState('')
  const [productosSeleccionados, setProductosSeleccionados] = useState([])
  const [imagenActualId, setImagenActualId] = useState(null)

  const {
    componente,
    loadingComponente: loading,
    createComponente,
    updateComponente,
  } = useComponentesManager(idComponenteEdit)

  const { subirImagen: subirImagenComponenteHook } = useImagenesComponente(idComponenteEdit)

  const title = idComponenteEdit ? 'Editar Componente' : 'Crear Componente'
  const breadcrumb = idComponenteEdit
    ? 'Inicio / Componentes / Editar componente'
    : 'Inicio / Componentes / Anadir componente'

  useEffect(() => {
    if (!idComponenteEdit || !componente) return

    form.setFieldsValue({
      nombre: componente.nombre || '',
      descripcion: componente.descripcion || '',
      precioBase: componente.precioBase ? Number(componente.precioBase) : undefined,
      sku: componente.sku || '',
    })

    if (componente.imagenes && componente.imagenes.length > 0) {
      const imagenPrincipal = componente.imagenes.find((img) => img.principal) || componente.imagenes[0]

      if (imagenPrincipal?.urlImagen) {
        setImagenActualId(imagenPrincipal.idImagen)
        setFileList([
          {
            uid: String(imagenPrincipal.idImagen),
            name: `imagen-${imagenPrincipal.idImagen}`,
            status: 'done',
            url: imagenPrincipal.urlImagen,
          },
        ])
      }
    } else {
      setFileList([])
      setImagenActualId(null)
    }

    if (componente.productos && componente.productos.length > 0) {
      setProductosSeleccionados(
        componente.productos
          .map((relacion) => {
            const producto = relacion.producto || relacion

            if (!producto?.idProducto) return null

            return {
              idProductoComponente: relacion.idProductoComponente,
              idProducto: producto.idProducto,
              nombre: producto.nombre,
              sku: producto.sku,
              precioBase: producto.precioBase,
            }
          })
          .filter(Boolean)
      )
    } else {
      setProductosSeleccionados([])
    }
  }, [idComponenteEdit, componente, form])

  const watchedNombre = Form.useWatch('nombre', form)
  const watchedPrecioBase = Form.useWatch('precioBase', form)

  const canSubmit = useMemo(() => {
    const nombreOk = String(watchedNombre || '').trim().length >= 3
    const precioOk =
      watchedPrecioBase !== null &&
      watchedPrecioBase !== undefined &&
      watchedPrecioBase >= 0

    return nombreOk && precioOk && !loading
  }, [watchedNombre, watchedPrecioBase, loading])

  const handleDeleteImage = useCallback(async () => {
    try {
      if (idComponenteEdit && imagenActualId) {
        setUploadPhase('Eliminando imagen...')
        await deleteImagenComponente(imagenActualId)
      }

      setFileList([])
      setImagenActualId(null)
      setUploadPhase('')
    } catch (err) {
      console.error('Error eliminando imagen:', err)
      message.error('Error al eliminar imagen')
    }
  }, [idComponenteEdit, imagenActualId])

  const handleFileChange = (newFileList) => {
    setFileList(newFileList)

    if (newFileList.length === 0) {
      handleDeleteImage()
    }
  }

  const syncProductosDelComponente = async (idComponente) => {
    const productosActuales = componente?.productos || []
    const actualesPorProducto = new Map(
      productosActuales.map((relacion) => [String(relacion.idProducto), relacion])
    )
    const seleccionadosPorProducto = new Map(
      productosSeleccionados.map((producto) => [String(producto.idProducto), producto])
    )

    const relacionesAEliminar = productosActuales.filter(
      (relacion) => !seleccionadosPorProducto.has(String(relacion.idProducto))
    )
    const productosAAgregar = productosSeleccionados.filter(
      (producto) => !actualesPorProducto.has(String(producto.idProducto))
    )

    await Promise.all(
      relacionesAEliminar
        .filter((relacion) => relacion.idProductoComponente)
        .map((relacion) =>
          componentesApi.eliminarProductoDelComponente(idComponente, relacion.idProductoComponente)
        )
    )

    await Promise.all(
      productosAAgregar.map((producto) =>
        componentesApi.agregarProductoAlComponente(idComponente, producto.idProducto)
      )
    )
  }

  const handleSubmit = async (values) => {
    setSubmitting(true)

    try {
      const basePayload = {
        nombre: values.nombre?.trim(),
        descripcion: values.descripcion?.trim() || null,
        sku: values.sku?.trim() || null,
        precioBase: Number(values.precioBase),
      }
      const selectedFile = fileList?.[0]?.originFileObj || null

      if (idComponenteEdit) {
        setUploadPhase('Actualizando componente...')
        await updateComponente(basePayload)

        if (selectedFile) {
          if (imagenActualId) {
            setUploadPhase('Reemplazando imagen...')
            await deleteImagenComponente(imagenActualId)
            setImagenActualId(null)
          }

          setUploadPhase('Subiendo imagen...')
          await subirImagenComponenteHook(selectedFile)
        }

        setUploadPhase('Actualizando productos del componente...')
        await syncProductosDelComponente(idComponenteEdit)

        message.success('Componente actualizado exitosamente')
      } else {
        setUploadPhase('Creando componente...')
        const componenteCreado = await createComponente(basePayload)

        if (selectedFile && componenteCreado?.idComponente) {
          setUploadPhase('Subiendo imagen...')
          await uploadImagenComponente(componenteCreado.idComponente, selectedFile)
        }

        if (productosSeleccionados.length > 0 && componenteCreado?.idComponente) {
          setUploadPhase('Agregando productos al componente...')
          await Promise.all(
            productosSeleccionados.map((producto) =>
              componentesApi.agregarProductoAlComponente(
                componenteCreado.idComponente,
                producto.idProducto
              )
            )
          )
        }

        message.success('Componente registrado exitosamente')

        form.resetFields()
        setFileList([])
        setProductosSeleccionados([])
      }

      setUploadPhase('')
      onSuccess?.()
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message || err?.message || 'Error al guardar componente'
      message.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ backgroundColor: '#f5f5f5', padding: '24px', minHeight: '100vh', margin: '-24px' }}>
      <div style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', paddingBottom: '80px' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, fontWeight: 600 }}>
            {title}
          </Title>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            {breadcrumb}
          </Text>
        </div>

      {loading ? (
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
          {uploadPhase && (
            <div
              style={{
                marginBottom: token.marginMD,
                padding: token.paddingSM,
                background: token.colorBgElevated,
                border: `1px solid ${token.colorPrimary}`,
                borderRadius: token.borderRadiusLG,
                display: 'flex',
                alignItems: 'center',
                gap: token.marginSM,
              }}
            >
              <Spin size="small" />
              <Text>{uploadPhase}</Text>
            </div>
          )}

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={8} lg={8}>
              <ImageUpload
                title="Imagen del Componente"
                fileList={fileList}
                onFileChange={handleFileChange}
                maxCount={1}
                maxSizeMB={5}
                uploadLabel="Seleccionar"
              />
            </Col>

            <Col xs={24} sm={24} md={16} lg={16}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: token.marginMD }}>
                <ComponenteInfoGeneral />
                <ComponenteProductoSelector
                  productosSeleccionados={productosSeleccionados}
                  onProductosSeleccionados={setProductosSeleccionados}
                />
              </div>
            </Col>
          </Row>

          <Divider style={{ margin: `${token.marginLG}px 0`, display: 'none' }} />
          <FormActionBar
            left={idComponenteEdit ? 'Editando componente' : 'Nuevo componente'}
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
                loading: submitting,
                disabled: submitting || !canSubmit,
              },
            ]}
          /></Form>
      )}
      </div>
    </div>
  )
}

export default ComponenteForm

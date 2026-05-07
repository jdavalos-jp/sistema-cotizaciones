import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Form, message, Row, Col, Spin, Typography, theme, Flex, Divider } from 'antd'
import { useComponentesManager } from '../hooks/useComponentesManager'
import { useImagenesComponente } from '../../../hooks/useImagenes' // ← Hook para imágenes
import { uploadImagenComponente, deleteImagenComponente } from '../../../services/api/imagenes' // ← API para subir/borrar
import * as componentesApi from '../Services/api/componentesApi' // ← API para relación producto-componente

import ImageUpload from '../../../shared/components/ImageUpload' // ← Componente compartido
import ComponenteInfoGeneral from './ComponenteInfoGeneral' // ← Componente secundario
import ComponenteProductoSelector from './ComponenteProductoSelector' // ← Selector de productos

const { Title, Text } = Typography

/**
 * ComponenteForm
 * 
 * EL CONTENEDOR PRINCIPAL
 * - Maneja todo el flujo del formulario
 * - Importa componentes secundarios
 * - Valida y envía datos al servidor
 * 
 * FLUJO:
 * 1. Usuario escribe datos
 * 2. Form.useWatch ve los cambios
 * 3. canSubmit valida si puede enviar
 * 4. Usuario hace click en "Crear"
 * 5. handleSubmit procesa todo
 */
function ComponenteForm({ onSuccess, onCancel, idComponenteEdit = null }) {
  // ============ HOOKS DE ESTADO =============
  const [form] = Form.useForm() // Form del Ant Design
  const { token } = theme.useToken() // Estilos del tema

  // Estados del formulario
  const [submitting, setSubmitting] = useState(false) // ¿Se está guardando?
  const [fileList, setFileList] = useState([]) // Lista de archivos
  const [previewUrl, setPreviewUrl] = useState('') // URL de preview
  const [uploadPhase, setUploadPhase] = useState('') // "Subiendo imagen..."
  const [productoSeleccionado, setProductoSeleccionado] = useState(null) // Producto del componente
  const [imagenActualId, setImagenActualId] = useState(null) // ID de imagen existente (para edición)

  // ============ HOOKS PERSONALIZADOS =============
  const {
    componente,
    loadingComponente: loading,
    createComponente,
    updateComponente,
  } = useComponentesManager(idComponenteEdit)

  const { subirImagen: subirImagenComponenteHook } = useImagenesComponente(idComponenteEdit)

  // ============ TÍTULOS DINÁMICOS =============
  const title = idComponenteEdit ? 'Editar Componente' : 'Crear Componente'
  const breadcrumb = idComponenteEdit
    ? 'Inicio / Componentes / Editar componente'
    : 'Inicio / Componentes / Añadir componente'

  // ============ EFECTO: CARGAR DATOS EN EDICIÓN =============
  /**
   * Cuando editamos, cargar datos del componente existente en el formulario
   * 
   * useEffect = "cuando esto cambie, ejecutar esto"
   */
  useEffect(() => {
    if (!idComponenteEdit || !componente) return

    // setFieldsValue = "asigna valores a los campos del formulario"
    form.setFieldsValue({
      nombre: componente.nombre || '',
      descripcion: componente.descripcion || '',
      precioBase: componente.precioBase ? Number(componente.precioBase) : undefined,
      sku: componente.sku || '',
    })

    // Si tiene imagen, cargar
    if (componente.imagenes && componente.imagenes.length > 0) {
      const imagenPrincipal = componente.imagenes.find((img) => img.principal) || componente.imagenes[0]
      if (imagenPrincipal?.urlImagen) {
        setPreviewUrl(imagenPrincipal.urlImagen)
        setImagenActualId(imagenPrincipal.idImagen) 
        setFileList([
          {
            uid: imagenPrincipal.idImagen,
            name: `imagen-${imagenPrincipal.idImagen}`,
            status: 'done',
            url: imagenPrincipal.urlImagen,
          },
        ])
      }
    } else {
      setFileList([])
      setPreviewUrl('')
      setImagenActualId(null)
    }

    // Si tiene producto asociado, cargar
    if (componente.productos && componente.productos.length > 0) {
      const producto = componente.productos[0] // En este caso, solo 1 producto
      setProductoSeleccionado({
        idProducto: producto.idProducto,
        nombre: producto.nombre,
        sku: producto.sku,
      })
    } else {
      setProductoSeleccionado(null)
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

 
  const beforeUpload = useCallback((file) => {
    const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    const isValidSize = file.size <= 5 * 1024 * 1024

    if (!isValidType) message.error('Formato no permitido. USA JPG, PNG o WebP.')
    if (!isValidSize) message.error('La imagen no puede superar 5MB.')

    return isValidType && isValidSize
  }, [])


  const handleDeleteImage = useCallback(async () => {
    try {

      if (idComponenteEdit && imagenActualId) {
        setUploadPhase('Eliminando imagen...')
        await deleteImagenComponente(imagenActualId)
      }
      setFileList([])
      setPreviewUrl('')
      setImagenActualId(null)
      setUploadPhase('')
    } catch (err) {
      console.error('Error eliminando imagen:', err)
      message.error('Error al eliminar imagen')
    }
  }, [idComponenteEdit, imagenActualId])

  // Adapter para el componente unificado ImageUpload
  const handleFileChange = (newFileList) => {
    setFileList(newFileList)
    if (newFileList.length === 0) {
      handleDeleteImage()
    }
  }


   
  const handleSubmit = async (values) => {
    setSubmitting(true)
    try {
      // Preparar datos del componente (SIN idProductoAsociado)
      const basePayload = {
        nombre: values.nombre?.trim(),
        descripcion: values.descripcion?.trim() || null,
        sku: values.sku?.trim() || null,
        precioBase: Number(values.precioBase),
      }

      // Obtener archivo si existe
      const selectedFile = fileList?.[0]?.originFileObj || null

      if (idComponenteEdit) {
        // ========== MODO EDITAR ==========
        setUploadPhase('Actualizando componente...')
        await updateComponente(basePayload)

        // Si hay imagen nueva, subirla
        if (selectedFile) {
          setUploadPhase('Subiendo imagen...')
          await subirImagenComponenteHook(selectedFile)
        }

        // Si hay producto seleccionado, actualizar relación
        if (productoSeleccionado?.idProducto) {
          setUploadPhase('Actualizando producto del componente...')
          await componentesApi.agregarProductoAlComponente(idComponenteEdit, productoSeleccionado.idProducto)
        }

        message.success('Componente actualizado exitosamente')
      } else {
        // ========== MODO CREAR ==========
        setUploadPhase('Creando componente...')
        const componenteCreado = await createComponente(basePayload)

        // Si hay imagen y se creó el componente, subirla
        if (selectedFile && componenteCreado?.idComponente) {
          setUploadPhase('Subiendo imagen...')
          await uploadImagenComponente(componenteCreado.idComponente, selectedFile)
        }

        // Si hay producto seleccionado, crear relación
        if (productoSeleccionado?.idProducto && componenteCreado?.idComponente) {
          setUploadPhase('Agregando producto al componente...')
          await componentesApi.agregarProductoAlComponente(
            componenteCreado.idComponente,
            productoSeleccionado.idProducto
          )
        }

        message.success('Componente registrado exitosamente')

        // Limpiar formulario
        form.resetFields()
        setFileList([])
        setPreviewUrl('')
        setProductoSeleccionado(null)
      }

      setUploadPhase('')
      onSuccess?.() // Ejecutar callback si existe
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
        {/* ============ ENCABEZADO ============ */}
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, fontWeight: 600 }}>
            {title}
          </Title>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            {breadcrumb}
          </Text>
        </div>

      {/* ============ LOADING STATE ============ */}
      {loading ? (
        <Flex justify="center" style={{ padding: token.paddingXL }}>
          <Spin size="large" />
        </Flex>
      ) : (
        <Form
          form={form}
          layout="vertical" // Campos uno encima del otro
          onFinish={handleSubmit} // Qué hacer al submit
          autoComplete="off"
          initialValues={{
            nombre: '',
            descripcion: '',
            precioBase: 0,
            sku: '',
          }}
        >
          {/* ============ INDICADOR DE SUBIDA ============ */}
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

          {/* ============ LAYOUT: DOS COLUMNAS ============ */}
          <Row gutter={[16, 16]}>
            {/* COLUMNA IZQUIERDA: IMAGEN */}
            <Col xs={24} sm={24} md={8} lg={8}>
              <ImageUpload
                title="Imagen del Componente"
                fileList={fileList}
                onFileChange={handleFileChange}
                maxCount={1}
                maxSizeMB={5}
                uploadLabel="Seleccionar"
                hint="Puedes agregar una maximo de 1 imagen,cada una no puede ser mayor a 5 MB. "
              />
            </Col>

            {/* COLUMNA DERECHA: INFORMACIÓN */}
            <Col xs={24} sm={24} md={16} lg={16}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: token.marginMD }}>
                <ComponenteInfoGeneral />
                <ComponenteProductoSelector
                  productoSeleccionado={productoSeleccionado}
                  onProductoSeleccionado={setProductoSeleccionado}
                />
              </div>
            </Col>
          </Row>

          {/* ============ DIVISOR ============ */}
          <Divider style={{ margin: `${token.marginLG}px 0`, display: 'none' }} />

          {/* ============ BOTONES ============ */}
          <div style={{
            position: 'fixed', bottom: 0, left: 0, width: '100%',
            background: '#fff', borderTop: '1px solid #f0f0f0',
            padding: '16px 24px', zIndex: 10, display: 'flex', justifyContent: 'flex-end', gap: 16
          }}>
            <Button
              orientation="primary"
              htmlType="submit"
              loading={submitting}
              disabled={submitting || !canSubmit}
              size="large"
              style={{ borderRadius: 8, minWidth: 100, fontWeight: 600 }}
            >
              Guardar
            </Button>
            <Button
              onClick={onCancel}
              size="large"
              disabled={submitting}
              style={{ borderRadius: 8, minWidth: 100 }}
            >
              Cancelar
            </Button>
          </div>
        </Form>
      )}
      </div>
    </div>
  )
}

export default ComponenteForm
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {Button,Cascader,Col,Divider,Flex,Form,Input,InputNumber,
message,
  Row,
  Space,
  Spin,
  Typography,
  Upload,
  theme,
} from 'antd'
import { CloseOutlined, DollarOutlined, InfoCircleOutlined, UploadOutlined } from '@ant-design/icons'
import { useCategoriesAndSubcategories } from '../hooks/useCategoriesAndSubcategories'
import { useProducto } from '../hooks/useProductosManager'
import { useImagenesProducto } from '../../../hooks/useImagenes'
import * as productosApi from '../Services/api/productosApi'
import { uploadImagenProducto } from '../../../services/api/imagenes'

const { Title, Text } = Typography

function sanitizeFileName(name) {
  return String(name || 'imagen')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .slice(0, 120)
}

function SectionHeader({ icon, title, description }) {
  const { token } = theme.useToken()

  return (
    <Flex gap={12} align="flex-start" style={{ marginBottom: 16 }}>
      <div
        style={{
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: token.borderRadiusLG,
          background: token.colorFillSecondary,
          color: token.colorText,
          flex: '0 0 auto',
          marginTop: 2,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: '1 1 auto' }}>
        <Text strong style={{ display: 'block' }}>{title}</Text>
        {description ? (
          <Text type="secondary" style={{ display: 'block' }}>
            {description}
          </Text>
        ) : null}
      </div>
    </Flex>
  )
}

function ProductoForm({ onSuccess, onCancel, idProductoEdit = null }) {
  const [form] = Form.useForm()
  const { token } = theme.useToken()

  const [submitting, setSubmitting] = useState(false)
  const [fileList, setFileList] = useState([])
  const [loadingHierarchy, setLoadingHierarchy] = useState(false)
  const [categoriaOptions, setCategoriaOptions] = useState([])
  const [uploadPhase, setUploadPhase] = useState('') // Para rastrear el progreso

  const { categorias, loadingCategorias } = useCategoriesAndSubcategories()
  const { producto, loading: loadingProducto, createProducto, updateProducto } = useProducto(idProductoEdit)
  
  // Hook para imágenes (para edición, carga las imagenes del producto)
  const { subirImagen: subirImagenProductoHook } = useImagenesProducto(idProductoEdit)

  const title = idProductoEdit ? 'Editar Producto' : 'Crear Nuevo Producto'
  const subtitle = idProductoEdit
    ? 'Actualiza la información del producto en el catálogo.'
    : 'Completa la información detallada para publicar el producto en el catálogo.'

  const rebuildHierarchy = useCallback(async () => {
    if (!Array.isArray(categorias) || categorias.length === 0) {
      setCategoriaOptions([])
      return
    }

    setLoadingHierarchy(true)
    try {
      const options = await Promise.all(
        categorias.map(async (cat) => {
          const value = Number(cat.idCategoria)
          let subs = []
          try {
            subs = await productosApi.getSubcategoriasByCategoria(value)
          } catch {
            subs = []
          }

          const children = Array.isArray(subs)
            ? subs.map((sub) => ({
              value: Number(sub.idSubcategoria),
              label: sub.nombre,
            }))
            : []

          return {
            value,
            label: cat.nombre,
            ...(children.length ? { children } : {}),
          }
        })
      )

      setCategoriaOptions(options)
    } finally {
      setLoadingHierarchy(false)
    }
  }, [categorias])

  useEffect(() => {
    rebuildHierarchy()
  }, [rebuildHierarchy])

  useEffect(() => {
    if (!idProductoEdit || !producto) return

    const categoriaPath = producto.idSubcategoria
      ? [Number(producto.idCategoria), Number(producto.idSubcategoria)]
      : [Number(producto.idCategoria)]

    form.setFieldsValue({
      nombre: producto.nombre || '',
      categoriaPath,
      descripcion: producto.descripcion || '',
      sku: producto.sku || '',
      precioBase: producto.precioBase != null ? Number(producto.precioBase) : undefined,
      cantidad: producto.cantidad != null ? Number(producto.cantidad) : 1,
    })

    setFileList([])
  }, [idProductoEdit, producto, form])

  const watchedNombre = Form.useWatch('nombre', form)
  const watchedCategoriaPath = Form.useWatch('categoriaPath', form)
  const watchedPrecioBase = Form.useWatch('precioBase', form)

  const canSubmit = useMemo(() => {
    const cascaderBusy = loadingCategorias || loadingHierarchy
    const nombreOk = String(watchedNombre || '').trim().length >= 2
    const categoriaOk = Array.isArray(watchedCategoriaPath) && watchedCategoriaPath.length >= 1
    const precio = Number(watchedPrecioBase)
    const precioOk = Number.isFinite(precio) && precio > 0
    return nombreOk && categoriaOk && precioOk && !cascaderBusy && !loadingProducto
  }, [watchedNombre, watchedCategoriaPath, watchedPrecioBase, loadingCategorias, loadingHierarchy, loadingProducto])

  const beforeUpload = useCallback((file) => {
    const isAllowedType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    if (!isAllowedType) {
      message.error('Formato no permitido. Usa JPG, PNG o WebP.')
      return Upload.LIST_IGNORE
    }

    const maxBytes = 5 * 1024 * 1024
    if (file.size > maxBytes) {
      message.error('La imagen supera 5MB.')
      return Upload.LIST_IGNORE
    }

    return false
  }, [])

  const cascaderPlaceholder = useMemo(() => {
    if (loadingCategorias || loadingHierarchy) return 'Cargando...'
    return 'Seleccionar subcategoría'
  }, [loadingCategorias, loadingHierarchy])

  const handleSubmit = async (values) => {
    setSubmitting(true)
    try {
      const [idCategoria, idSubcategoria] = Array.isArray(values.categoriaPath)
        ? values.categoriaPath
        : []

      const basePayload = {
        nombre: values.nombre?.trim(),
        descripcion: values.descripcion?.trim() || null,
        sku: values.sku?.trim() || null,
        precioBase: Number(values.precioBase),
        cantidad: Number(values.cantidad) || 1,
        idCategoria: Number(idCategoria),
        idSubcategoria: idSubcategoria ? Number(idSubcategoria) : null,
      }

      const selectedFile = fileList?.[0]?.originFileObj || null
      
      console.log('🚀 Iniciando', idProductoEdit ? 'actualización' : 'creación', 'de producto')
      console.log('📦 Payload:', basePayload)
      console.log('🖼️ Archivo seleccionado:', selectedFile?.name || 'ninguno')

      if (idProductoEdit) {
        setUploadPhase('Actualizando producto...')
        console.log('✏️ Modo edición - ID:', idProductoEdit)
        await updateProducto(basePayload)

        if (selectedFile) {
          setUploadPhase('Subiendo imagen...')
          console.log('⬆️ Subiendo imagen para producto ID:', idProductoEdit)
          await subirImagenProductoHook(selectedFile)
          console.log('✅ Imagen subida exitosamente')
        }

        message.success('Producto actualizado exitosamente')
        setUploadPhase('')
      } else {
        // Creación: producto primero
        setUploadPhase('Creando producto...')
        console.log('🆕 Modo creación - creando nuevo producto')
        const productoCreado = await createProducto(basePayload)
        console.log('✅ Producto creado con ID:', productoCreado?.idProducto)

        // Subir imagen si existe y el producto se creó correctamente
        if (selectedFile && productoCreado?.idProducto) {
          setUploadPhase('Subiendo imagen...')
          console.log('⬆️ Subiendo imagen para producto ID:', productoCreado.idProducto)
          try {
            const imagenResult = await uploadImagenProducto(productoCreado.idProducto, selectedFile)
            console.log('✅ Imagen subida exitosamente:', imagenResult.data)
            message.success('Imagen cargada exitosamente')
          } catch (imgErr) {
            const errorMsg = imgErr?.response?.data?.message || imgErr?.message || 'Error al cargar imagen'
            console.error('❌ Error al subir imagen:', errorMsg)
            message.warning(`Producto creado, pero error en imagen: ${errorMsg}`)
          }
        } else {
          console.log('⏭️ Sin imagen para subir')
        }

        message.success('Producto registrado exitosamente')
        form.resetFields()
        setFileList([])
        setUploadPhase('')
      }

      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('❌ Error general:', err)
      const errorMsg = err?.response?.data?.message || err?.message || 'Error al guardar producto'
      message.error(errorMsg)
      setUploadPhase('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>{title}</Title>
        <Text type="secondary">{subtitle}</Text>
      </div>

      {loadingProducto ? (
        <div style={{ padding: 24 }}>
          <Spin />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          style={{
            background: token.colorBgContainer,
          }}
        >
          {uploadPhase && (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                background: token.colorBgElevated,
                border: `1px solid ${token.colorPrimary}`,
                borderRadius: token.borderRadiusLG,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Spin size="small" />
              <Text strong>{uploadPhase}</Text>
            </div>
          )}

          <SectionHeader
            icon={<InfoCircleOutlined style={{ color: '#13c2c2' }} />}
            title="Información General"
            description="Detalles básicos que identifican tu producto."
          />

          <Row gutter={[16, 8]}>
            <Col xs={24}>
              <Form.Item
                label="Nombre del producto"
                name="nombre"
                size="large"
                rules={[
                  { required: true, message: 'Campo requerido' },
                  { min: 2, message: 'Mínimo 2 caracteres' },
                  { max: 255, message: 'Máximo 255 caracteres' },
                ]}
              >
                <Input placeholder="Ej. Reloj Inteligente Serie 5" maxLength={255} allowClear />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label="Subcategoría"
                name="categoriaPath"
                rules={[{ required: true, message: 'Selecciona una subcategoría' }]}
              >
                <Cascader
                  options={categoriaOptions}
                  placeholder={cascaderPlaceholder}
                  loading={loadingCategorias || loadingHierarchy}
                  showSearch
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label="Descripción"
                name="descripcion"
                rules={[{ max: 500, message: 'Máximo 500 caracteres' }]}
              >
                <Input.TextArea
                  placeholder="Describe las características principales, beneficios y materiales..."
                  rows={4}
                  maxLength={500}
                  showCount
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '12px 0 16px' }} />

          <SectionHeader
            icon={<DollarOutlined style={{ color: '#13c2c2' }} />}
            title="Inventario y Precios"
            description="Gestiona los valores comerciales y el seguimiento de stock."
          />

          <Row gutter={[16, 8]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Código / SKU"
                name="sku"
                rules={[
                  {
                    pattern: /^[A-Za-z0-9\-_]{0,50}$/,
                    message: 'Usa letras/números/guión/guión bajo (máx. 50)',
                  },
                ]}
              >
                <Input placeholder="PROD-001" maxLength={50} allowClear />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Precio unitario ($)"
                name="precioBase"
                rules={[
                  { required: true, message: 'Campo requerido' },
                  { type: 'number', min: 1, message: 'Debe ser mayor que 0' },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  step={1}
                  placeholder="0"
                  prefix="$"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Cantidad en stock"
                name="cantidad"
                rules={[
                  { required: true, message: 'Campo requerido' },
                  { type: 'number', min: 1, message: 'La cantidad debe ser mayor a 0' },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  step={1}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '12px 0 16px' }} />

          <SectionHeader
            icon={<UploadOutlined style={{ color: '#13c2c2' }} />}
            title="Multimedia"
            description="Sube fotos de alta calidad para atraer a tus clientes."
          />

          <Form.Item label="Foto del producto">
            <Upload.Dragger
              accept="image/png,image/jpeg,image/webp"
              multiple={false}
              maxCount={1}
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={({ fileList: next }) => setFileList(next)}
              style={{ padding: 16 }}
            >
              <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: token.borderRadiusLG,
                  background: token.colorFillSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                }}>
                  <UploadOutlined style={{ color: '#13c2c2' }} />
                </div>
                <Text strong>Arrastra tu imagen aquí o haz clic</Text>
                <Text type="secondary">Soporta JPG, PNG y WebP (Máx. 5MB)</Text>
                <Button style={{ marginTop: 8 }}>Seleccionar archivo</Button>
              </Space>
            </Upload.Dragger>

            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Se recomienda usar imágenes cuadradas (1080×1080px) para mejor visualización.
              </Text>
            </div>
          </Form.Item>

          <Flex justify="flex-end" style={{ marginTop: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              disabled={!canSubmit || submitting}
            >
              Guardar Producto
            </Button>
          </Flex>
        </Form>
      )}
    </div>
  )
}
export default ProductoForm
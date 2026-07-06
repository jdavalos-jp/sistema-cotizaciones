import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { Form, message, Row, Col, Spin, Typography, theme, Flex, Divider } from 'antd'
import { useCategoriesAndSubcategories } from '../hooks/useCategoriesAndSubcategories'
import { useProducto } from '../hooks/useProductosManager'
import { useImagenesProducto } from '../../../hooks/useImagenes'
import * as productosApi from '../Services/api/productosApi'
import { uploadImagenProducto } from '../../../services/api/imagenes'

import ProductoImagenYCategoria from './ProductoImagenYCategoria'
import ProductoInfoGeneral from './ProductoInfoGeneral'
import ProductoInventarioPreciosMultimedia from './ProductoInventarioPreciosMultimedia'
import FormActionBar from '../../../shared/components/FormActionBar'

const { Title, Text } = Typography

function ProductoForm({ onSuccess, onCancel, idProductoEdit = null }) {
  const [form] = Form.useForm()
  const { token } = theme.useToken()

  const [submitting, setSubmitting] = useState(false)
  const [fileList, setFileList] = useState([])
  const [previewUrl, setPreviewUrl] = useState('')
  const [imageHovered, setImageHovered] = useState(false)
  const [loadingHierarchy, setLoadingHierarchy] = useState(false)
  const [categoriaOptions, setCategoriaOptions] = useState([])
  const [uploadPhase, setUploadPhase] = useState('')
  const [componentesAgregados, setComponentesAgregados] = useState([])
  const hasHydrated = useRef(false)

  const { categorias, loadingCategorias } = useCategoriesAndSubcategories()
  const { producto, loading: loadingProducto, createProducto, updateProducto } = useProducto(idProductoEdit)
  const { subirImagen: subirImagenProductoHook, eliminarImagen: eliminarImagenProductoHook } = useImagenesProducto(idProductoEdit)

  const title = idProductoEdit ? 'Editar Producto' : 'Crear Producto'
  const breadcrumb = idProductoEdit
    ? 'Inicio / Productos / Editar producto'
    : 'Inicio / Productos / Añadir producto'

  // Rebuild hierarchy - optimizado (una sola query)
  const rebuildHierarchy = useCallback(async () => {
    if (!categorias?.length) {
      setCategoriaOptions([])
      return
    }

    setLoadingHierarchy(true)
    try {
      // Usar endpoint único que retorna categorías con subcategorías
      const categoriasConSubs = await productosApi.getCategoriasConSubcategorias()
      
      const options = (categoriasConSubs || []).map(cat => ({
        value: Number(cat.idCategoria),
        label: cat.nombre,
        ...(cat.subcategorias?.length && {
          children: cat.subcategorias.map(sub => ({
            value: Number(sub.idSubcategoria),
            label: sub.nombre,
          }))
        })
      }))
      
      setCategoriaOptions(options)
    } catch (err) {
      message.error('Error al construir la jerarquía de categorías')
    } finally {
      setLoadingHierarchy(false)
    }
  }, [categorias])

  useEffect(() => {
    rebuildHierarchy()
  }, [rebuildHierarchy])

  // Cargar datos en edición
  useEffect(() => {
    if (!idProductoEdit || !producto || categoriaOptions.length === 0) return
    if (hasHydrated.current) return // Evitar que backend resetee el form mientras se edita

    // Considerar que el backend puede devolver idCategoria anidado dentro de categoria
    const catId = producto.idCategoria || producto.categoria?.idCategoria;
    const subId = producto.idSubcategoria || producto.subcategoria?.idSubcategoria;

    form.setFieldsValue({
      nombre: producto.nombre || '',
      categoriaPath: subId
        ? [Number(catId), Number(subId)]
        : catId ? [Number(catId)] : [],
      descripcion: producto.descripcion || '',
      sku: producto.sku || '',
      precioBase: producto.precioBase !== null && producto.precioBase !== undefined ? Number(producto.precioBase) : undefined,
      cantidad: producto.cantidad ? Number(producto.cantidad) : 1,
    })

    // Cargar imagen principal si existe
    if (producto.imagenes && producto.imagenes.length > 0) {
      const imagenPrincipal = producto.imagenes.find((img) => img.principal) || producto.imagenes[0]
      if (imagenPrincipal?.urlImagen) {
        setPreviewUrl(imagenPrincipal.urlImagen)
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
      // Resetear estado de imagen
      setFileList([])
      setPreviewUrl('')
    }

    setImageHovered(false)
    
    // Recuperar componentes asociados al cargar edición
    if (producto.componentes && producto.componentes.length > 0) {
      const componentesMap = producto.componentes.map((c) => ({
        idComponente: c.componente?.idComponente,
        nombre: c.componente?.nombre,
        sku: c.componente?.sku || '',
        cantidad: c.cantidad,
        precioBase: c.precioReferencial || c.componente?.precioBase,
      }));
      setComponentesAgregados(componentesMap);
    } else {
      setComponentesAgregados([]);
    }
    
    hasHydrated.current = true;
  }, [idProductoEdit, producto, form, categoriaOptions])

  // Watch fields para validación
  const watchedNombre = Form.useWatch('nombre', form)
  const watchedCategoriaPath = Form.useWatch('categoriaPath', form)
  const watchedPrecioBase = Form.useWatch('precioBase', form)
  const watchedCantidad = Form.useWatch('cantidad', form)

  const canSubmit = useMemo(() => {
    const cascaderBusy = loadingCategorias || loadingHierarchy
    const nombreOk = String(watchedNombre || '').trim().length >= 2
    const categoriaOk = Array.isArray(watchedCategoriaPath) && watchedCategoriaPath.length >= 1
    const precioOk = watchedPrecioBase !== null && watchedPrecioBase !== undefined && watchedPrecioBase >= 0
    const cantidadOk = watchedCantidad !== null && watchedCantidad !== undefined && watchedCantidad > 0
    return nombreOk && categoriaOk && precioOk && cantidadOk && !cascaderBusy && !loadingProducto
  }, [watchedNombre, watchedCategoriaPath, watchedPrecioBase, watchedCantidad, loadingCategorias, loadingHierarchy, loadingProducto])

  // Validación de imagen
  const beforeUpload = useCallback((file) => {
    const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    const isValidSize = file.size <= 5 * 1024 * 1024

    if (!isValidType) message.error('Formato no permitido. Usa JPG, PNG o WebP.')
    if (!isValidSize) message.error('La imagen no puede superar 5MB.')

    return isValidType && isValidSize
  }, [])

  const handleDeleteImage = useCallback(() => {
    setFileList([])
    setPreviewUrl('')
    setImageHovered(false)
  }, [])

  const handleSubmit = async (values) => {
    setSubmitting(true)
    try {
      const [idCategoria, idSubcategoria] = values.categoriaPath || []

      const basePayload = {
        nombre: values.nombre?.trim(),
        descripcion: values.descripcion?.trim() || null,
        sku: values.sku?.trim() || null,
        precioBase: Number(values.precioBase),
        cantidad: Number(values.cantidad) || 1,
        idCategoria: Number(idCategoria),
        idSubcategoria: idSubcategoria ? Number(idSubcategoria) : null,
        componentes: componentesAgregados.map((c) => ({
          idComponente: c.idComponente,
          cantidad: c.cantidad,
          precioReferencial: c.precioBase,
        })),
      }

      const selectedFile = fileList?.[0]?.originFileObj || null

      if (idProductoEdit) {
        setUploadPhase('Actualizando producto...')
        await updateProducto(basePayload)

        const imagenAntigua = producto?.imagenes?.find((img) => img.principal) || producto?.imagenes?.[0]
        
        // Si se eliminó la imagen O se seleccionó una nueva, debemos eliminar la antigua del servidor
        if (imagenAntigua && (fileList.length === 0 || selectedFile)) {
          setUploadPhase('Reemplazando imagen...')
          try {
            await eliminarImagenProductoHook(imagenAntigua.idImagen)
          } catch (e) {
            console.error('No se pudo eliminar la imagen anterior', e)
          }
        }

        if (selectedFile) {
          setUploadPhase('Subiendo nueva imagen...')
          await subirImagenProductoHook(selectedFile)
        }

        message.success('Producto actualizado exitosamente')
      } else {
        setUploadPhase('Creando producto...')
        const productoCreado = await createProducto(basePayload)

        if (selectedFile && productoCreado?.idProducto) {
          setUploadPhase('Subiendo imagen...')
          await uploadImagenProducto(productoCreado.idProducto, selectedFile)
          message.success('Producto e imagen registrados exitosamente')
        } else {
          message.success('Producto registrado exitosamente')
        }

        form.resetFields()
        setFileList([])
        setPreviewUrl('')
        setImageHovered(false)
        setComponentesAgregados([])
      }

      setUploadPhase('')
      onSuccess?.()
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Error al guardar producto'
      message.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ backgroundColor: '#f5f5f5', padding: '24px', minHeight: '100vh', margin: '-24px' }}>
      <div style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', paddingBottom: '80px' }}>
        {/* Header Breadcrumb & Title */}
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, fontWeight: 600 }}>{title}</Title>
          <Text type="secondary" style={{ fontSize: '14px' }}>{breadcrumb}</Text>
        </div>

      {loadingProducto ? (
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
            cantidad: 1,
            precioBase: null,
            descripcion: '',
            sku: '',
            nombre: '',
            categoriaPath: [],
          }}
        >
          <div style={{
            marginBottom: token.marginMD,
            padding: token.paddingSM,
            background: token.colorBgElevated,
            border: `1px solid ${token.colorPrimary}`,
            borderRadius: token.borderRadiusLG,
            display: uploadPhase ? 'flex' : 'none',
            alignItems: 'center',
            gap: token.marginSM,
          }}>
            <Spin size="small" />
            <Text>{uploadPhase}</Text>
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={8} lg={8}>
              <ProductoImagenYCategoria
                categoriaOptions={categoriaOptions}
                loadingCategorias={loadingCategorias}
                loadingHierarchy={loadingHierarchy}
                fileList={fileList}
                setFileList={setFileList}
                previewUrl={previewUrl}
                setPreviewUrl={setPreviewUrl}
                imageHovered={imageHovered}
                setImageHovered={setImageHovered}
                beforeUpload={beforeUpload}
                onDeleteImage={handleDeleteImage}
              />
            </Col>

            <Col xs={24} sm={24} md={16} lg={16}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: token.marginMD }}>
                <ProductoInfoGeneral />
                <ProductoInventarioPreciosMultimedia
                  componentesAgregados={componentesAgregados}
                  onAgregarComponente={(componente) =>
                    setComponentesAgregados([...componentesAgregados, componente])
                  }
                  onEliminarComponente={(idComponente) =>
                    setComponentesAgregados(componentesAgregados.filter((c) => c.idComponente !== idComponente))
                  }
                />
              </div>
            </Col>
          </Row>

          <Divider style={{ margin: `${token.marginLG}px 0`, display: 'none' }} />
          <FormActionBar
            left={idProductoEdit ? 'Editando producto' : 'Nuevo producto'}
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

export default ProductoForm

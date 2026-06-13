import React, { useState, useMemo, useEffect } from 'react'
import { Space, Typography, message, Card, Row, Col, Divider, Spin, Alert, InputNumber, Input } from 'antd'
import { SaveOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons'

import {
  FechaValidacionSection,
  AgregarProductosSection,
  ProductosSeleccionadosTable,
} from './sections'

import { useCotizacionEdit } from '../hooks/useCotizacionEdit'
import { useCotizacionPreview } from '../hooks/useCotizacionPreview'
import FormActionBar from '../../../shared/components/FormActionBar'

const { Title, Text } = Typography

export default function CotizacionEditar({ idCotizacion, onSuccess, onCancel }) {
  const {
    cotizacion,
    loading,
    saving,
    error,
    productos,
    componentes,
    cart,
    handleSave,
  } = useCotizacionEdit(idCotizacion)

  // --- Estado local para campos editables ---
  const [observaciones, setObservaciones] = useState('')
  const [descuento, setDescuento] = useState(0)
  const [impuestos, setImpuestos] = useState(0)
  const [diasValidez, setDiasValidez] = useState(10)
  const [diasEntrega, setDiasEntrega] = useState(5)

  // --- Cargar valores iniciales al recibir la cotización ---
  useEffect(() => {
    if (!cotizacion) return

    setObservaciones(cotizacion.observaciones || '')
    setDescuento(cotizacion.descuento || 0)
    setImpuestos(cotizacion.impuestos || 0)
    setDiasEntrega(cotizacion.diasEntrega || 5)

    // Calcular diasValidez a partir de las fechas
    if (cotizacion.fechaEmision && cotizacion.fechaValidez) {
      const emision = new Date(cotizacion.fechaEmision)
      const validez = new Date(cotizacion.fechaValidez)
      const diffMs = validez.getTime() - emision.getTime()
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
      setDiasValidez(diffDays > 0 ? diffDays : 10)
    }
  }, [cotizacion])

  // --- Preview para calcular líneas y totales ---
  const preview = useCotizacionPreview({
    idCliente: cotizacion?.idCliente,
    moneda: cotizacion?.moneda || 'Bs',
    cart: cart.cart,
    removeItem: cart.removeItem,
  })

  const lineas = preview.data?.lineas ?? []

  // Mergear ediciones del carrito (nombre/descripción personalizados)
  const lineasConEdiciones = useMemo(() => {
    return lineas.map((linea) => {
      const cartItem = cart.cart.find(
        (x) => x.tipo === linea.tipo && String(x.id) === String(linea.id)
      )
      if (cartItem) {
        return {
          ...linea,
          nombre: cartItem.nombre ?? linea.nombre,
          descripcion: cartItem.descripcion ?? linea.descripcion,
          observaciones: cartItem.observaciones ?? linea.observaciones,
        }
      }
      return linea
    })
  }, [lineas, cart.cart])

  const lineasFallback = useMemo(() => {
    if (
      lineasConEdiciones.length > 0 &&
      lineasConEdiciones.length === cart.cart.length &&
      lineasConEdiciones.every((linea) =>
        cart.cart.some((item) => String(item.id) === String(linea.id) && item.tipo === linea.tipo)
      )
    ) {
      return lineasConEdiciones
    }

    console.log(
      '[CotizacionEditar] Fallback activado. Preview:',
      lineasConEdiciones.length,
      'Carrito:',
      cart.cart.length
    )
    return cart.cart.map((item) => ({
      tipo: item.tipo,
      id: item.id,
      nombre: item.nombre,
      descripcion: item.descripcion,
      observaciones: item.observaciones,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario || 0,
      totalLinea: (item.precioUnitario || 0) * item.cantidad,
    }))
  }, [lineasConEdiciones, cart.cart])

  const moneda = cotizacion?.moneda || 'Bs'
  const subtotal = preview.data?.totales?.subtotal ?? (
    lineasFallback.reduce((sum, l) => sum + (l.totalLinea || 0), 0)
  )
  const totalFinal = subtotal - Number(descuento) + Number(impuestos)

  const onRemove = (tipo, id) => cart.removeItem(tipo, String(id))
  const onSetCantidad = (tipo, id, cantidad) => cart.setCantidad(tipo, String(id), cantidad)
  const onSetPrecio = (tipo, id, precio) => cart.setPrecioUnitario(tipo, String(id), precio)
  const onSetNombre = (tipo, id, nombre) => cart.setNombre(tipo, String(id), nombre)
  const onSetDescripcion = (tipo, id, descripcion) => cart.setDescripcion(tipo, String(id), descripcion)

  async function handleGuardarCambios() {
    if (!cart.cart.length) {
      message.warning('Debe haber al menos un producto o componente')
      return
    }

    try {
      const payload = {
        productos: cart.cart
          .filter((x) => x.tipo === 'producto')
          .map((x) => ({
            idProducto: String(x.id),
            cantidad: Math.max(1, Number(x.cantidad) || 1),
            ...(x.precioUnitario !== undefined && { precioUnitario: x.precioUnitario }),
            ...(x.nombre && { nombre: x.nombre }),
            ...(x.descripcion && { descripcion: x.descripcion }),
            ...(x.observaciones && { observaciones: x.observaciones }),
          })),
        componentes: cart.cart
          .filter((x) => x.tipo === 'componente')
          .map((x) => ({
            idComponente: String(x.id),
            cantidad: Math.max(1, Number(x.cantidad) || 1),
            ...(x.precioUnitario !== undefined && { precioUnitario: x.precioUnitario }),
            ...(x.nombre && { nombre: x.nombre }),
            ...(x.descripcion && { descripcion: x.descripcion }),
            ...(x.observaciones && { observaciones: x.observaciones }),
          })),
        moneda,
        observaciones: observaciones || null,
        descuento: Number(descuento) || 0,
        impuestos: Number(impuestos) || 0,
        diasValidez,
        diasEntrega,
      }

      console.log(
        '[CotizacionEditar] Guardando cambios. Carrito:',
        cart.cart.length,
        'Productos:',
        payload.productos.length,
        'Componentes:',
        payload.componentes.length,
        'Payload:',
        JSON.stringify(payload, null, 2)
      )

      await handleSave(payload)
      if (onSuccess) onSuccess()
    } catch (err) {
      // Error ya manejado por el hook
    }
  }

  // --- Estados de carga/error ---
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Cargando cotización...</Text>
        </div>
      </div>
    )
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />
  }

  if (!cotizacion) {
    return <Alert message="Cotización no encontrada" type="warning" showIcon />
  }

  return (
    <div className="cotizacion-edit">
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        {/* Encabezado */}
        <div className="cotizacion-edit__header">
          <Title level={3} style={{ marginTop: 0, marginBottom: 0 }}>
            Editar Cotización #{cotizacion.numeroCotizacion}
          </Title>
          <Text type="secondary">
            Modifica los datos de la cotización
          </Text>
        </div>

        {/* Alerta si no es editable */}
        {cotizacion.estado !== 'borrador' && cotizacion.estado !== 'pendiente' && (
          <Alert
            message="Nota"
            description={`Esta cotización está en estado "${cotizacion.estado}" y puede no ser editable.`}
            type="info"
            showIcon
          />
        )}

        {/* Sección Cliente (Solo lectura) */}
        <Card
          title={
            <Space>
              <UserOutlined />
              <span>Cliente</span>
            </Space>
          }
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Text type="secondary" style={{ fontSize: '12px' }}>Nombre</Text>
              <div style={{ fontSize: '16px', fontWeight: 500, marginTop: 4 }}>
                {cotizacion.cliente?.nombreCompleto || '-'}
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <Text type="secondary" style={{ fontSize: '12px' }}>Correo</Text>
              <div style={{ fontSize: '16px', fontWeight: 500, marginTop: 4 }}>
                {cotizacion.cliente?.email || '-'}
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <Text type="secondary" style={{ fontSize: '12px' }}>Teléfono</Text>
              <div style={{ fontSize: '16px', fontWeight: 500, marginTop: 4 }}>
                {cotizacion.cliente?.telefono || '-'}
              </div>
            </Col>
            {cotizacion.cliente?.ciudad && (
              <Col xs={24} sm={12}>
                <Text type="secondary" style={{ fontSize: '12px' }}>Ciudad</Text>
                <div style={{ fontSize: '16px', fontWeight: 500, marginTop: 4 }}>
                  {cotizacion.cliente.ciudad}
                </div>
              </Col>
            )}
            {cotizacion.cliente?.institucion && (
              <Col xs={24} sm={12}>
                <Text type="secondary" style={{ fontSize: '12px' }}>Razón Social</Text>
                <div style={{ fontSize: '16px', fontWeight: 500, marginTop: 4 }}>
                  {cotizacion.cliente.institucion}
                </div>
              </Col>
            )}
          </Row>
        </Card>

        {/* Fechas y Entrega */}
        <FechaValidacionSection
          diasValidez={diasValidez}
          setDiasValidez={setDiasValidez}
          diasEntrega={diasEntrega}
          setDiasEntrega={setDiasEntrega}
          fechaEmision={cotizacion.fechaEmision}
        />

        {/* Agregar Productos */}
        <AgregarProductosSection
          productos={productos}
          componentes={componentes}
          cart={cart}
        />

        {/* Tabla de Productos Seleccionados */}
        <ProductosSeleccionadosTable
          lineas={lineasFallback}
          moneda={moneda}
          onRemove={onRemove}
          onSetCantidad={onSetCantidad}
          onSetPrecio={onSetPrecio}
          onSetNombre={onSetNombre}
          onSetDescripcion={onSetDescripcion}
          onSetObservaciones={(tipo, id, ob) => cart.setObservaciones(tipo, String(id), ob)}
        />

        {/* Resumen y Totales */}
        <Card
          title={
            <Space>
              <FileTextOutlined />
              <span>Resumen y Totales</span>
            </Space>
          }
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <Text type="secondary">Observaciones</Text>
              <Input.TextArea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={4}
                placeholder="Notas u observaciones adicionales..."
                style={{ marginTop: 8 }}
              />
            </Col>
            <Col xs={24} md={12}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Subtotal:</Text>
                  <Text strong style={{ fontSize: '15px' }}>
                    {subtotal.toLocaleString('es-BO')} {moneda}
                  </Text>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Descuento:</Text>
                  <InputNumber
                    value={descuento}
                    onChange={(val) => setDescuento(val || 0)}
                    min={0}
                    step={1}
                    precision={0}
                    style={{ width: 140 }}
                    addonAfter={moneda}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Impuestos:</Text>
                  <InputNumber
                    value={impuestos}
                    onChange={(val) => setImpuestos(val || 0)}
                    min={0}
                    step={1}
                    precision={0}
                    style={{ width: 140 }}
                    addonAfter={moneda}
                  />
                </div>

                <Divider style={{ margin: '4px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ fontSize: '18px' }}>TOTAL:</Text>
                  <Text strong style={{ fontSize: '18px', color: '#389e0d' }}>
                    {totalFinal.toLocaleString('es-BO')} {moneda}
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
        <FormActionBar
          left={`${cart.cart.length} producto(s) en cotización`}
          actions={[
            {
              key: 'cancel',
              label: 'Cancelar',
              onClick: onCancel,
              disabled: saving,
            },
            {
              key: 'save',
              label: 'Guardar Cambios',
              type: 'primary',
              icon: <SaveOutlined />,
              loading: saving,
              onClick: handleGuardarCambios,
              disabled: !cart.cart.length,
              minWidth: 160,
            },
          ]}
        />
      </Space>
    </div>
  )
}

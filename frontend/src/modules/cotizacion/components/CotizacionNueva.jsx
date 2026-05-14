import React, { useMemo, useState } from 'react'
import {
  Button,
  Space,
  Typography,
  message,
  Card,
  Row,
  Col,
  Divider,
  InputNumber,
  Input,
} from 'antd'
import {
  CheckCircleOutlined,
  PlusOutlined,
  FileTextOutlined,
} from '@ant-design/icons'

import {
  ClienteDatosSection,
  FechaValidacionSection,
  AgregarProductosSection,
  ProductosSeleccionadosTable,
  ModalNuevoCliente,
} from './sections'

import { useCatalogSearch } from '../hooks/useCatalogSearch'
import { useClientesSearch } from '../hooks/useClientesSearch'
import { useCotizacionCart } from '../hooks/useCotizacionCart'
import { useCotizacionPreview } from '../hooks/useCotizacionPreview'

import { fetchProductos, fetchComponentes } from '../services/api/catalogoApi'
import { createAndDownloadPdf } from '../services/api/cotizacionesApi'

const { Title, Text } = Typography

const pageStyle = {
  backgroundColor: '#f5f5f5',
  padding: 24,
  minHeight: '100vh',
  margin: '-24px',
}

const cardStyle = {
  borderRadius: 8,
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
}

const cardBodyStyle = {
  padding: 24,
}

function CotizacionNueva() {
  const [idCliente, setIdCliente] = useState(null)
  const [clienteLabel, setClienteLabel] = useState('')
  const [diasValidez, setDiasValidez] = useState(15)
  const [diasEntrega, setDiasEntrega] = useState(10)
  const [moneda] = useState('Bs')
  const [observaciones, setObservaciones] = useState('')
  const [descuento, setDescuento] = useState(0)
  const [impuestos, setImpuestos] = useState(0)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [modalNuevoClienteVisible, setModalNuevoClienteVisible] = useState(false)

  const clientes = useClientesSearch()
  const productos = useCatalogSearch(fetchProductos)
  const componentes = useCatalogSearch(fetchComponentes)
  const cart = useCotizacionCart()

  const preview = useCotizacionPreview({
    idCliente,
    moneda,
    cart: cart.cart,
    removeItem: cart.removeItem,
  })

  const subtotal = Number(preview.data?.totales?.subtotal || 0)

  const total = useMemo(() => {
    return subtotal - Number(descuento || 0) + Number(impuestos || 0)
  }, [subtotal, descuento, impuestos])

  const lineasConEdiciones = useMemo(() => {
    const lineas = preview.data?.lineas ?? []

    return lineas.map((linea) => {
      const cartItem = cart.cart.find(
        (item) =>
          item.tipo === linea.tipo &&
          String(item.id) === String(linea.id)
      )

      if (!cartItem) return linea

      return {
        ...linea,
        nombre: cartItem.nombre ?? linea.nombre,
        descripcion: cartItem.descripcion ?? linea.descripcion,
      }
    })
  }, [preview.data?.lineas, cart.cart])

  const getFechaFin = () => {
    const hoy = new Date()
    hoy.setDate(hoy.getDate() + Number(diasValidez || 0))
    return hoy.toISOString().split('T')[0]
  }

  const resetForm = () => {
    cart.clear()
    setIdCliente(null)
    setClienteLabel('')
    setDiasValidez(15)
    setDiasEntrega(10)
    setObservaciones('')
    setDescuento(0)
    setImpuestos(0)
    setShowSuccess(false)
  }

  const downloadPdfBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    try {
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
    } finally {
      link.remove()
      URL.revokeObjectURL(url)
    }
  }

  const handleGenerarCotizacion = async () => {
    if (!idCliente) {
      message.warning('Selecciona un cliente')
      return
    }

    if (!cart.cart.length) {
      message.warning('Selecciona al menos un producto o componente')
      return
    }

    if (!diasValidez) {
      message.warning('Ingresa los días de validez')
      return
    }

    if (!diasEntrega) {
      message.warning('Ingresa los días de entrega')
      return
    }

    setLoadingSubmit(true)

    try {
      const payload = {
        idCliente: String(idCliente),
        moneda,
        diasEntrega: Number(diasEntrega),
        descuento: Number(descuento) || 0,
        impuestos: Number(impuestos) || 0,
        observaciones: observaciones || null,
        fechaValidez: getFechaFin(),

        productos: cart.cart
          .filter((item) => item.tipo === 'producto')
          .map((item) => ({
            idProducto: String(item.id),
            cantidad: Math.max(1, Number(item.cantidad) || 1),
            ...(item.precioUnitario !== undefined && {
              precioUnitario: Number(item.precioUnitario),
            }),
            ...(item.nombre && { nombre: item.nombre }),
            ...(item.descripcion && { descripcion: item.descripcion }),
          })),

        componentes: cart.cart
          .filter((item) => item.tipo === 'componente')
          .map((item) => ({
            idComponente: String(item.id),
            cantidad: Math.max(1, Number(item.cantidad) || 1),
            ...(item.precioUnitario !== undefined && {
              precioUnitario: Number(item.precioUnitario),
            }),
            ...(item.nombre && { nombre: item.nombre }),
            ...(item.descripcion && { descripcion: item.descripcion }),
          })),
      }

      const pdfBlob = await createAndDownloadPdf(payload)

      downloadPdfBlob(pdfBlob, `cotizacion-${payload.idCliente}.pdf`)

      message.success('¡Cotización creada exitosamente!')
      setShowSuccess(true)

      setTimeout(resetForm, 3000)
    } catch (error) {
      message.error(String(error?.message || error))
    } finally {
      setLoadingSubmit(false)
    }
  }

  if (showSuccess) {
    return (
      <div style={pageStyle}>
        <Card variant="borderless" style={cardStyle} styles={{ body: cardBodyStyle }}>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <CheckCircleOutlined
              style={{
                fontSize: 64,
                color: '#52c41a',
                marginBottom: 24,
              }}
            />

            <Title level={2}>¡Cotización Completada!</Title>

            <Text>
              La cotización ha sido creada y descargada exitosamente
            </Text>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <Space
        orientation="vertical"
        size={20}
        style={{
          width: '100%',
          paddingBottom: 80,
          maxWidth: 1180,
          margin: '0 auto',
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, fontWeight: 600 }}>
            Nueva Cotización
          </Title>

          <Text type="secondary" style={{ fontSize: 14 }}>
            Inicio / Cotizaciones / Crear cotización
          </Text>
        </div>

        <ClienteDatosSection
          clientes={clientes}
          idCliente={idCliente}
          setIdCliente={setIdCliente}
          clienteLabel={clienteLabel}
          setClienteLabel={setClienteLabel}
          onNewCliente={() => setModalNuevoClienteVisible(true)}
        />

        <FechaValidacionSection
          diasValidez={diasValidez}
          setDiasValidez={setDiasValidez}
          diasEntrega={diasEntrega}
          setDiasEntrega={setDiasEntrega}
        />

        <AgregarProductosSection
          productos={productos}
          componentes={componentes}
          cart={cart}
        />

        <ProductosSeleccionadosTable
          lineas={lineasConEdiciones}
          moneda={moneda}
          onRemove={(tipo, id) => cart.removeItem(tipo, String(id))}
          onSetCantidad={(tipo, id, cantidad) =>
            cart.setCantidad(tipo, String(id), cantidad)
          }
          onSetPrecio={(tipo, id, precio) =>
            cart.setPrecioUnitario(tipo, String(id), precio)
          }
          onSetNombre={(tipo, id, nombre) =>
            cart.setNombre(tipo, String(id), nombre)
          }
          onSetDescripcion={(tipo, id, descripcion) =>
            cart.setDescripcion(tipo, String(id), descripcion)
          }
        />

        <Card
          variant="borderless"
          style={cardStyle}
          styles={{ body: cardBodyStyle }}
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
                onChange={(event) => setObservaciones(event.target.value)}
                rows={4}
                placeholder="Notas u observaciones adicionales..."
                style={{ marginTop: 8, borderRadius: 6 }}
              />
            </Col>

            <Col xs={24} md={12}>
              <div
                style={{
                  display: 'grid',
                  gap: 16,
                  background: '#fafafa',
                  border: '1px solid #f0f0f0',
                  borderRadius: 8,
                  padding: 16,
                }}
              >
                <ResumenFila
                  label="Subtotal:"
                  value={`${subtotal.toLocaleString('es-BO')} ${moneda}`}
                />

                <ResumenInput
                  label="Descuento:"
                  value={descuento}
                  onChange={setDescuento}
                  moneda={moneda}
                />

                <ResumenInput
                  label="Impuestos:"
                  value={impuestos}
                  onChange={setImpuestos}
                  moneda={moneda}
                />

                <Divider style={{ margin: '4px 0' }} />

                <ResumenFila
                  label="TOTAL:"
                  value={`${total.toLocaleString('es-BO')} ${moneda}`}
                  strong
                  color="#389e0d"
                />
              </div>
            </Col>
          </Row>
        </Card>

        <FooterAcciones
          cartLength={cart.cart.length}
          loadingSubmit={loadingSubmit}
          disabled={!idCliente || !cart.cart.length || !diasValidez || !diasEntrega}
          onClear={() => cart.clear()}
          onSubmit={handleGenerarCotizacion}
        />
      </Space>

      <ModalNuevoCliente
        visible={modalNuevoClienteVisible}
        onClose={() => setModalNuevoClienteVisible(false)}
        onSuccess={(nuevoCliente) => {
          setIdCliente(nuevoCliente.id || Date.now())
          setClienteLabel(nuevoCliente.nombre)
          clientes.setSearch(nuevoCliente.nombre)
          message.success('Cliente registrado exitosamente')
        }}
      />
    </div>
  )
}

function ResumenFila({ label, value, strong = false, color }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Text strong={strong} style={{ fontSize: strong ? 18 : 15 }}>
        {label}
      </Text>

      <Text
        strong={strong}
        style={{
          fontSize: strong ? 18 : 15,
          color,
        }}
      >
        {value}
      </Text>
    </div>
  )
}

function ResumenInput({ label, value, onChange, moneda }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Text>{label}</Text>

      <Space.Compact style={{ width: 140 }}>
        <InputNumber
          value={value}
          onChange={(val) => onChange(val || 0)}
          min={0}
          step={1}
          precision={0}
          style={{ width: 100 }}
        />

        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 4,
          }}
        >
          {moneda}
        </span>
      </Space.Compact>
    </div>
  )
}

function FooterAcciones({
  cartLength,
  loadingSubmit,
  disabled,
  onClear,
  onSubmit,
}) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        background: '#fff',
        borderTop: '1px solid #f0f0f0',
        padding: '12px 24px',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.04)',
      }}
    >
      <Text type="secondary">
        {cartLength} producto(s) en cotización
      </Text>

      <Space size={16}>
        <Button
          size="large"
          onClick={onClear}
          style={{
            borderRadius: 8,
            minWidth: 100,
          }}
        >
          Limpiar
        </Button>

        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          loading={loadingSubmit}
          onClick={onSubmit}
          disabled={disabled}
          style={{
            borderRadius: 8,
            minWidth: 100,
            fontWeight: 600,
          }}
        >
          Generar Cotización
        </Button>
      </Space>
    </div>
  )
}

export default CotizacionNueva

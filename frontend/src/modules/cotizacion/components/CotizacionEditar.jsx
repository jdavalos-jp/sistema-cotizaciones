import React, { useState, useMemo, useEffect } from 'react'
import { Button, Space, Typography, message, Card, Row, Col, Divider, Spin, Alert, Table } from 'antd'
import { SaveOutlined, DeleteOutlined } from '@ant-design/icons'

import { AgregarProductosSection } from './sections'
import { useCotizacionEdit } from '../hooks/useCotizacionEdit'
import { useCotizacionPreview } from '../hooks/useCotizacionPreview'

const { Title } = Typography

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

  const [observaciones, setObservaciones] = useState('')
  const [descuento, setDescuento] = useState(0)
  const [impuestos, setImpuestos] = useState(0)

  // Cargar valores iniciales cuando cargue la cotización
  useEffect(() => {
    if (cotizacion) {
      setObservaciones(cotizacion.observaciones || '')
      setDescuento(cotizacion.descuento || 0)
      setImpuestos(cotizacion.impuestos || 0)
    }
  }, [cotizacion])

  // Hacer preview con los datos del carrito
  const preview = useCotizacionPreview({
    idCliente: cotizacion?.idCliente,
    moneda: cotizacion?.moneda || 'Bs',
    cart: cart.cart,
  })

  const lineas = preview.data?.lineas ?? []
  const total = preview.data?.totales?.total ?? 0

  // Columnas para la tabla de productos
  const columns = [
    {
      title: 'PRODUCTO',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (text) => <span>{text}</span>,
    },
    {
      title: `PRECIO`,
      dataIndex: 'precioUnitario',
      key: 'precioUnitario',
      align: 'right',
      width: 120,
      render: (price, record) => (
        <input
          type="number"
          min="0"
          step="0.01"
          value={Number(price || 0)}
          onChange={(e) =>
            cart.setPrecioUnitario(record.tipo, String(record.id), Math.max(0, Number(e.target.value) || 0))
          }
          style={{
            width: '100%',
            textAlign: 'right',
            padding: '4px',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
          }}
        />
      ),
    },
    {
      title: 'CANTIDAD',
      dataIndex: 'cantidad',
      key: 'cantidad',
      align: 'center',
      width: 80,
      render: (cantidad, record) => (
        <input
          type="number"
          min="1"
          value={cantidad}
          onChange={(e) =>
            cart.setCantidad(record.tipo, String(record.id), Math.max(1, Number(e.target.value) || 1))
          }
          style={{
            width: '100%',
            textAlign: 'center',
            padding: '4px',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
          }}
        />
      ),
    },
    {
      title: 'SUBTOTAL',
      dataIndex: 'totalLinea',
      key: 'totalLinea',
      align: 'right',
      width: 100,
      render: (total) => (
        <span style={{ fontWeight: 600 }}>{Number(total || 0).toFixed(2)}</span>
      ),
    },
    {
      title: 'ACCIÓN',
      key: 'action',
      align: 'center',
      width: 70,
      render: (_, record) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => cart.removeItem(record.tipo, String(record.id))}
        />
      ),
    },
  ]

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
            ...(x.nombre !== undefined && { nombre: x.nombre }),
            ...(x.descripcion !== undefined && { descripcion: x.descripcion }),
          })),
        componentes: cart.cart
          .filter((x) => x.tipo === 'componente')
          .map((x) => ({
            idComponente: String(x.id),
            cantidad: Math.max(1, Number(x.cantidad) || 1),
            ...(x.precioUnitario !== undefined && { precioUnitario: x.precioUnitario }),
            ...(x.nombre !== undefined && { nombre: x.nombre }),
            ...(x.descripcion !== undefined && { descripcion: x.descripcion }),
          })),
        moneda: cotizacion?.moneda || 'Bs',
        observaciones: observaciones || null,
        descuento: Number(descuento) || 0,
        impuestos: Number(impuestos) || 0,
      }

      await handleSave(payload)
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      // Error ya mostrado
    }
  }

  if (loading) {
    return <Spin size="large" description="Cargando cotización..." />
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />
  }

  if (!cotizacion) {
    return <Alert message="Cotización no encontrada" type="warning" showIcon />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Encabezado */}
      <Card>
        <Row gutter={16}>
          <Col span={8}>
            <div>
              <span style={{ opacity: 0.65 }}>Cliente</span>
              <div>
                <span style={{ fontWeight: 600 }}>{cotizacion.cliente?.nombreCompleto}</span>
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div>
              <span style={{ opacity: 0.65 }}>Cotización #</span>
              <div>
                <span style={{ fontWeight: 600 }}>{cotizacion.numeroCotizacion}</span>
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div>
              <span style={{ opacity: 0.65 }}>Estado</span>
              <div>
                <span style={{ fontWeight: 600 }}>{cotizacion.estado}</span>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Mensaje si no es editable */}
      {cotizacion.estado !== 'borrador' && cotizacion.estado !== 'pendiente' && (
        <Alert
          message="Nota"
          description={`Esta cotización está en estado "${cotizacion.estado}" y puede no ser editable.`}
          type="info"
          showIcon
        />
      )}

      {/* Agregar productos */}
      <AgregarProductosSection productos={productos} componentes={componentes} cart={cart} />

      {/* Tabla de productos */}
      <Card title={<Title level={5}>Productos y Componentes ({lineas.length})</Title>}>
        {lineas.length === 0 ? (
          <Alert message="Sin productos. Agrega productos usando el formulario arriba." type="info" showIcon />
        ) : (
          <Table
            columns={columns}
            rowKey={(record) => `${record.tipo}-${record.id}`}
            dataSource={lineas}
            pagination={false}
            bordered
            size="small"
          />
        )}
      </Card>

      {/* Resumen y totales */}
      <Card title="Resumen y Totales">
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ marginBottom: '12px' }}>
              <label>Observaciones:</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '8px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                }}
              />
            </div>
          </Col>
          <Col span={12}>
            <div style={{ display: 'grid', gap: '12px', gridAutoRows: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <strong>{(preview.data?.totales?.subtotal || 0).toFixed(2)} {cotizacion?.moneda}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label htmlFor="descuento">Descuento:</label>
                <input
                  id="descuento"
                  type="number"
                  min="0"
                  step="0.01"
                  value={descuento}
                  onChange={(e) => setDescuento(Number(e.target.value))}
                  style={{ width: '120px', textAlign: 'right', padding: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label htmlFor="impuestos">Impuestos:</label>
                <input
                  id="impuestos"
                  type="number"
                  min="0"
                  step="0.01"
                  value={impuestos}
                  onChange={(e) => setImpuestos(Number(e.target.value))}
                  style={{ width: '120px', textAlign: 'right', padding: '4px' }}
                />
              </div>

              <Divider style={{ margin: '8px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold' }}>
                <span>TOTAL:</span>
                <span>{(total - Number(descuento) + Number(impuestos)).toFixed(2)} {cotizacion?.moneda}</span>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Botones de acción */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} size="large">
          Cancelar
        </Button>
        <Button type="primary" size="large" loading={saving} icon={<SaveOutlined />} onClick={handleGuardarCambios}>
          Guardar Cambios
        </Button>
      </div>
    </div>
  )
}

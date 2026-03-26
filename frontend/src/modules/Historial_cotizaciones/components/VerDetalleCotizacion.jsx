import React, { useEffect, useState } from 'react'
import { Spin, Card, Descriptions, Table, Tag, Button, Space, message, Modal } from 'antd'
import { DownloadOutlined, PrinterOutlined, EditOutlined } from '@ant-design/icons'
import { useCotizacion } from '../hooks/useCotizacionesManager'
import { CotizacionEditar } from '../../cotizacion/components'

const estadoColors = {
  borrador: 'orange',
  enviada: 'blue',
  aceptada: 'green',
  rechazada: 'red',
  cancelada: 'default',
}

export default function VerDetalleCotizacion({
  idCotizacion,
  onClose,
}) {
  const [modalEditarVisible, setModalEditarVisible] = useState(false)
  const { cotizacion, loading, error, load, downloadPdf } =
    useCotizacion(idCotizacion)

  useEffect(() => {
    load()
  }, [load])

  const handleEditarSuccess = (updated) => {
    load() // Recargar datos
    setModalEditarVisible(false)
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>
  }

  if (loading || !cotizacion) {
    return <Spin />
  }

  const columnsProductos = [
    {
      title: 'Ítem',
      dataIndex: 'nombreItem',
      key: 'nombreItem',
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcionItem',
      key: 'descripcionItem',
    },
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
      key: 'cantidad',
      align: 'center',
    },
    {
      title: 'P. Unit.',
      dataIndex: 'precioUnitario',
      key: 'precioUnitario',
      render: (price) => `${price} Bs`,
      align: 'right',
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (total) => `${total} Bs`,
      align: 'right',
    },
  ]

  const productosData = [
    ...(cotizacion.productos || []).map((p) => ({
      ...p,
      key: `prod-${p.idDetalleProducto}`,
    })),
    ...(cotizacion.componentes || []).map((c) => ({
      ...c,
      key: `comp-${c.idDetalleComponente}`,
    })),
  ]

  const handleDescargar = async () => {
    try {
      const blob = await downloadPdf()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${cotizacion.numeroCotizacion}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      message.success('PDF descargado')
    } catch (err) {
      message.error('Error al descargar PDF')
    }
  }

  return (
    <div className="ver-detalle-cotizacion">
      <div style={{ marginBottom: 20 }}>
        <Space>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDescargar}
          >
            Descargar PDF
          </Button>
          <Button icon={<PrinterOutlined />}>Imprimir</Button>
          {(cotizacion?.estado === 'borrador' || cotizacion?.estado === 'pendiente') && (
            <Button
              type="primary"
              danger
              icon={<EditOutlined />}
              onClick={() => setModalEditarVisible(true)}
            >
              Editar
            </Button>
          )}
        </Space>
      </div>

      {/* Modal de edición */}
      <Modal
        open={modalEditarVisible}
        onCancel={() => setModalEditarVisible(false)}
        width="90%"
        footer={null}
        title="Editar Cotización"
      >
        {modalEditarVisible && (
          <CotizacionEditar
            idCotizacion={idCotizacion}
            onSuccess={handleEditarSuccess}
            onCancel={() => setModalEditarVisible(false)}
          />
        )}
      </Modal>

      <Card title="Información General" style={{ marginBottom: 20 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Cotización">
            <strong>{cotizacion.numeroCotizacion}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Estado">
            <Tag color={estadoColors[cotizacion.estado]}>
              {cotizacion.estado}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Cliente">
            {cotizacion.cliente?.nombreCompleto}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {cotizacion.cliente?.email || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Teléfono">
            {cotizacion.cliente?.telefono || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Ciudad">
            {cotizacion.cliente?.ciudad || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Fecha Emisión">
            {new Date(cotizacion.fechaEmision).toLocaleDateString(
              'es-BO'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Moneda">
            {cotizacion.moneda}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Detalles de Ítems" style={{ marginBottom: 20 }}>
        <Table
          columns={columnsProductos}
          dataSource={productosData}
          pagination={false}
          bordered
          size="small"
        />
      </Card>

      <Card title="Resumen" style={{ marginBottom: 20 }}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Moneda">
            {cotizacion.moneda}
          </Descriptions.Item>
          <Descriptions.Item label="Subtotal">
            {cotizacion.moneda} {cotizacion.subtotal || '0'}
          </Descriptions.Item>
          <Descriptions.Item label="Descuento">
            {cotizacion.moneda} {cotizacion.descuento || '0'}
          </Descriptions.Item>
          <Descriptions.Item label="Impuestos">
            {cotizacion.moneda} {cotizacion.impuestos || '0'}
          </Descriptions.Item>
          <Descriptions.Item label="Total" style={{ fontSize: 16 }}>
            <strong>
              {cotizacion.moneda} {cotizacion.total || '0'}
            </strong>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {cotizacion.observaciones && (
        <Card title="Observaciones">
          <p>{cotizacion.observaciones}</p>
        </Card>
      )}
    </div>
  )
}

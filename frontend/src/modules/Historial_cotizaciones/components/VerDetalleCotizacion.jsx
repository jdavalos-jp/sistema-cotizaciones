import React, { useEffect, useState } from 'react'
import { Spin, Descriptions, Table, Tag, Button, Space, message, Modal } from 'antd'
import { DownloadOutlined, PrinterOutlined, EditOutlined } from '@ant-design/icons'
import { useCotizacion } from '../hooks/useCotizacionesManager'
import { CotizacionEditar } from '../../cotizacion/components'

const estadoColors = {
  borrador: 'default',
  enviada: 'processing',
  aceptada: 'success',
  rechazada: 'error',
  cancelada: 'default',
}

function formatMoney(value, moneda = 'Bs') {
  return `${Number(value || 0).toLocaleString('es-BO')} ${moneda}`
}

export default function VerDetalleCotizacion({
  idCotizacion,
}) {
  const [modalEditarVisible, setModalEditarVisible] = useState(false)
  const { cotizacion, loading, error, load, downloadPdf } =
    useCotizacion(idCotizacion)

  useEffect(() => {
    load()
  }, [load])

  const handleEditarSuccess = () => {
    load()
    setModalEditarVisible(false)
  }

  if (error) {
    return <div className="cotizaciones-error">Error: {error}</div>
  }

  if (loading || !cotizacion) {
    return (
      <div className="cotizaciones-loading">
        <Spin />
      </div>
    )
  }

  const columnsProductos = [
    {
      title: 'Item',
      dataIndex: 'nombreItem',
      key: 'nombreItem',
      render: (text) => <span className="cotizaciones-item-name">{text}</span>,
    },
    {
      title: 'Descripcion',
      dataIndex: 'descripcionItem',
      key: 'descripcionItem',
      render: (text) => text || '-',
    },
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
      key: 'cantidad',
      align: 'center',
      width: 110,
    },
    {
      title: 'Precio',
      dataIndex: 'precioUnitario',
      key: 'precioUnitario',
      render: (price) => formatMoney(price, cotizacion.moneda),
      align: 'right',
      width: 130,
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (total) => formatMoney(total, cotizacion.moneda),
      align: 'right',
      width: 130,
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
    } catch {
      message.error('Error al descargar PDF')
    }
  }

  const puedeEditar = cotizacion?.estado === 'borrador' || cotizacion?.estado === 'pendiente'

  return (
    <div className="cotizacion-detail">
      <div className="cotizacion-detail__topbar">
        <div>
          <span className="cotizaciones-eyebrow">Cotizacion</span>
          <h3>{cotizacion.numeroCotizacion}</h3>
        </div>

        <Space wrap>
          <Button icon={<DownloadOutlined />} onClick={handleDescargar}>
            PDF
          </Button>
          <Button icon={<PrinterOutlined />}>Imprimir</Button>
          {puedeEditar && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setModalEditarVisible(true)}
            >
              Editar
            </Button>
          )}
        </Space>
      </div>

      <Modal
        open={modalEditarVisible}
        onCancel={() => setModalEditarVisible(false)}
        width={1120}
        footer={null}
        title="Editar cotizacion"
        className="cotizaciones-modal"
        centered
      >
        {modalEditarVisible && (
          <CotizacionEditar
            idCotizacion={idCotizacion}
            onSuccess={handleEditarSuccess}
            onCancel={() => setModalEditarVisible(false)}
          />
        )}
      </Modal>

      <section className="cotizacion-detail__section">
        <div className="cotizacion-detail__section-title">Informacion general</div>
        <Descriptions column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label="Estado">
            <Tag color={estadoColors[cotizacion.estado]} className="cotizaciones-status">
              {cotizacion.estado}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Cliente">
            {cotizacion.cliente?.nombreCompleto || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {cotizacion.cliente?.email || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Telefono">
            {cotizacion.cliente?.telefono || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Ciudad">
            {cotizacion.cliente?.ciudad || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Fecha emision">
            {new Date(cotizacion.fechaEmision).toLocaleDateString('es-BO')}
          </Descriptions.Item>
          <Descriptions.Item label="Moneda">
            {cotizacion.moneda}
          </Descriptions.Item>
        </Descriptions>
      </section>

      <section className="cotizacion-detail__section">
        <div className="cotizacion-detail__section-title">Items</div>
        <Table
          columns={columnsProductos}
          dataSource={productosData}
          pagination={false}
          size="small"
          scroll={{ x: true }}
          className="cotizaciones-table"
        />
      </section>

      <section className="cotizacion-detail__summary">
        <div className="cotizacion-summary-row">
          <span>Subtotal</span>
          <strong>{formatMoney(cotizacion.subtotal, cotizacion.moneda)}</strong>
        </div>
        <div className="cotizacion-summary-row">
          <span>Descuento</span>
          <strong>{formatMoney(cotizacion.descuento, cotizacion.moneda)}</strong>
        </div>
        <div className="cotizacion-summary-row">
          <span>Impuestos</span>
          <strong>{formatMoney(cotizacion.impuestos, cotizacion.moneda)}</strong>
        </div>
        <div className="cotizacion-summary-row cotizacion-summary-row--total">
          <span>Total</span>
          <strong>{formatMoney(cotizacion.total, cotizacion.moneda)}</strong>
        </div>
      </section>

      {cotizacion.observaciones && (
        <section className="cotizacion-detail__section">
          <div className="cotizacion-detail__section-title">Observaciones</div>
          <p>{cotizacion.observaciones}</p>
        </section>
      )}
    </div>
  )
}

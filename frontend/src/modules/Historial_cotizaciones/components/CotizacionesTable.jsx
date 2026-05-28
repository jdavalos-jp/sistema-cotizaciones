import React from 'react'
import {
  Table,
  Button,
  Space,
  Tag,
  Tooltip,
  Popconfirm,
  Empty,
} from 'antd'

import {
  EyeOutlined,
  DeleteOutlined,
  SendOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons'

const estadoColors = {
  borrador: 'default',
  enviada: 'processing',
  aceptada: 'success',
  rechazada: 'error',
}

function formatCurrency(value, moneda) {
  const number = Number(value || 0)
  return `${number.toLocaleString('es-BO')} ${moneda || ''}`.trim()
}

function CotizacionesTable({
  cotizaciones,
  paginacion,
  setPaginacion,
  onVer,
  onEliminar,
  onCambiarEstado,
}) {
  const columns = [
    {
      title: 'Cotizacion',
      dataIndex: 'numeroCotizacion',
      render: (text) => <span className="cotizaciones-number">{text}</span>,
    },
    {
      title: 'Cliente',
      dataIndex: ['cliente', 'nombreCompleto'],
      render: (text) => text || '-',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      align: 'right',
      render: (total, record) => (
        <span className="cotizaciones-total">
          {formatCurrency(total, record.moneda)}
        </span>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      render: (estado) => (
        <Tag color={estadoColors[estado]} className="cotizaciones-status">
          {estado}
        </Tag>
      ),
    },
    {
      title: '',
      align: 'right',
      render: (_, record) => (
        <Space wrap className="cotizaciones-actions">
          <Tooltip title="Ver detalle">
            <Button type="text" icon={<EyeOutlined />} onClick={() => onVer(record)} />
          </Tooltip>

          {record.estado === 'borrador' && (
            <>
              <Tooltip title="Marcar como enviada">
                <Button
                  type="text"
                  icon={<SendOutlined />}
                  onClick={() => onCambiarEstado(record.idCotizacion, 'enviada')}
                />
              </Tooltip>

              <Popconfirm
                title="Eliminar cotizacion"
                description="Esta accion no se puede deshacer."
                okText="Eliminar"
                cancelText="Cancelar"
                onConfirm={() => onEliminar(record.idCotizacion)}
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </>
          )}

          {record.estado === 'enviada' && (
            <>
              <Tooltip title="Aceptar">
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  onClick={() => onCambiarEstado(record.idCotizacion, 'aceptada')}
                />
              </Tooltip>
              <Tooltip title="Rechazar">
                <Button
                  type="text"
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => onCambiarEstado(record.idCotizacion, 'rechazada')}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ]

  const handleShowSizeChange = (current, pageSize) => {
    setPaginacion({ current, pageSize })
  }

  return (
    <Table
      className="cotizaciones-table"
      columns={columns}
      dataSource={cotizaciones}
      rowKey="idCotizacion"
      size="middle"
      scroll={{ x: true }}
      pagination={{
        ...paginacion,
        showSizeChanger: true,
        pageSizeOptions: ['5', '10', '20', '50'],
        showTotal: (total) => `${total} cotizaciones`,
        onShowSizeChange: handleShowSizeChange,
        onChange: (page, pageSize) => {
          setPaginacion({ current: page, pageSize })
        },
      }}
      locale={{ emptyText: <Empty description="Sin cotizaciones" /> }}
    />
  )
}

export default CotizacionesTable

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
  borrador: 'orange',
  enviada: 'blue',
  aceptada: 'green',
  rechazada: 'red',
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
      title: 'Nº Cotización',
      dataIndex: 'numeroCotizacion',
      render: (t) => <strong>{t}</strong>,
    },
    {
      title: 'Cliente',
      dataIndex: ['cliente', 'nombreCompleto'],
    },
    {
      title: 'Total',
      dataIndex: 'total',
      render: (t, r) => `${t} ${r.moneda}`,
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      render: (estado) => (
        <Tag color={estadoColors[estado]}>{estado}</Tag>
      ),
    },
    {
      title: 'Acciones',
      render: (_, r) => (
        <Space wrap>
          <Tooltip title="Ver">
            <Button icon={<EyeOutlined />} onClick={() => onVer(r)} />
          </Tooltip>

          {r.estado === 'borrador' && (
            <>
              <Button
                icon={<SendOutlined />}
                onClick={() => onCambiarEstado(r.idCotizacion, 'enviada')}
              />

              <Popconfirm
                title="¿Eliminar?"
                onConfirm={() => onEliminar(r.idCotizacion)}
              >
                <Button danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </>
          )}

          {r.estado === 'enviada' && (
            <>
              <Button
                icon={<CheckOutlined />}
                onClick={() => onCambiarEstado(r.idCotizacion, 'aceptada')}
              />
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => onCambiarEstado(r.idCotizacion, 'rechazada')}
              />
            </>
          )}
        </Space>
      ),
    },
  ]

  const handleShowSizeChange = (current, pageSize) => {
    console.log(current, pageSize)
    setPaginacion({ current, pageSize })
  }

  return (
    <Table
      columns={columns}
      dataSource={cotizaciones}
      rowKey="idCotizacion"
      pagination={{
        ...paginacion,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['5', '10', '20', '50'],
        showTotal: (total) => `Total: ${total} cotizaciones`,
        onShowSizeChange: handleShowSizeChange,
        onChange: (page) => {
          setPaginacion({ ...paginacion, current: page })
        },
      }}
      locale={{ emptyText: <Empty /> }}
    />
  )
}

export default CotizacionesTable
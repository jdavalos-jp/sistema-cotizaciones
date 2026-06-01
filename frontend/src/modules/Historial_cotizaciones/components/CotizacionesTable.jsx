import { Table, Button, Tag, Tooltip, Popconfirm, Empty, Dropdown } from 'antd'
import {
  EyeOutlined,
  DeleteOutlined,
  SendOutlined,
  CheckOutlined,
  CloseOutlined,
  MoreOutlined,
} from '@ant-design/icons'

const estadoColors = {
  borrador: 'default',
  enviada: 'processing',
  aceptada: 'success',
  rechazada: 'error',
  cancelada: 'default',
}

function formatCurrency(value, moneda) {
  const number = Number(value || 0)
  return `${number.toLocaleString('es-BO')} ${moneda || ''}`.trim()
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('es-BO')
}

function CotizacionesTable({
  cotizaciones,
  paginacion,
  total,
  setPaginacion,
  onVer,
  onEliminar,
  onCambiarEstado,
}) {
  const columns = [
    {
      title: 'Cotizacion',
      dataIndex: 'numeroCotizacion',
      width: 160,
      render: (text) => <span className="cotizaciones-number">{text}</span>,
    },
    {
      title: 'Cliente',
      dataIndex: ['cliente', 'nombreCompleto'],
      ellipsis: true,
      render: (text, record) => (
        <div>
          <div className="cotizaciones-client">{text || '-'}</div>
          <div className="cotizaciones-muted">{record.cliente?.email || record.cliente?.telefono || '-'}</div>
        </div>
      ),
    },
    {
      title: 'Emision',
      dataIndex: 'fechaEmision',
      width: 120,
      render: formatDate,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      align: 'right',
      width: 140,
      render: (totalValue, record) => (
        <span className="cotizaciones-total">
          {formatCurrency(totalValue, record.moneda)}
        </span>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      width: 120,
      render: (estado) => (
        <Tag color={estadoColors[estado]} className="cotizaciones-status">
          {estado || 'sin estado'}
        </Tag>
      ),
    },
    {
      title: '',
      align: 'right',
      width: 70,
      render: (_, record) => {
        const menuItems = [
          {
            key: 'view',
            label: 'Ver detalle',
            icon: <EyeOutlined />,
            onClick: () => onVer(record),
          },
        ]

        if (record.estado === 'borrador') {
          menuItems.push(
            {
              key: 'sent',
              label: 'Marcar enviada',
              icon: <SendOutlined />,
              onClick: () => onCambiarEstado(record.idCotizacion, 'enviada'),
            },
            { type: 'divider' },
            {
              key: 'delete',
              label: (
                <Popconfirm
                  title="Eliminar cotizacion"
                  description="Esta accion no se puede deshacer."
                  okText="Eliminar"
                  cancelText="Cancelar"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => onEliminar(record.idCotizacion)}
                >
                  <span style={{ color: '#ff4d4f' }}>Eliminar</span>
                </Popconfirm>
              ),
              icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
              danger: true,
            }
          )
        }

        if (record.estado === 'enviada') {
          menuItems.push(
            {
              key: 'accept',
              label: 'Aceptar',
              icon: <CheckOutlined />,
              onClick: () => onCambiarEstado(record.idCotizacion, 'aceptada'),
            },
            {
              key: 'reject',
              label: 'Rechazar',
              icon: <CloseOutlined />,
              danger: true,
              onClick: () => onCambiarEstado(record.idCotizacion, 'rechazada'),
            }
          )
        }

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
          </Dropdown>
        )
      },
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={cotizaciones}
      rowKey={(record) => String(record.idCotizacion)}
      scroll={{ x: true }}
      pagination={{
        ...paginacion,
        total,
        showSizeChanger: true,
        pageSizeOptions: ['5', '10', '20', '50'],
        showTotal: (count) => `Total: ${count} cotizaciones`,
        onShowSizeChange: (current, pageSize) => setPaginacion({ current, pageSize }),
        onChange: (page, pageSize) => setPaginacion({ current: page, pageSize }),
      }}
      locale={{ emptyText: <Empty description="Sin cotizaciones" /> }}
    />
  )
}

export default CotizacionesTable

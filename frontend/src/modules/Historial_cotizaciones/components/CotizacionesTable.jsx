import { Table, Button, Tag, Popconfirm, Empty, Dropdown, Space, Typography } from 'antd'
import {
  EyeOutlined,
  DeleteOutlined,
  SendOutlined,
  CheckOutlined,
  CloseOutlined,
  MoreOutlined,
} from '@ant-design/icons'
import { formatDateDMY } from '../../../shared/utils'
import MobileCardList from '../../../shared/components/MobileCardList'

const { Text } = Typography

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
  return formatDateDMY(value)
}

function CotizacionesTable({
  cotizaciones,
  paginacion,
  total,
  isMobile,
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
        const menuItems = buildMenuItems(record, onVer, onEliminar, onCambiarEstado)
        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
          </Dropdown>
        )
      },
    },
  ]

  const handlePaginationChange = (page, pageSize) => {
    setPaginacion({ current: page, pageSize: pageSize || paginacion.pageSize })
  }

  const renderMobileCard = (record) => {
    const menuItems = buildMenuItems(record, onVer, onEliminar, onCambiarEstado)

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <Text strong style={{ fontSize: 15 }}>{record.numeroCotizacion}</Text>
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
              {formatDate(record.fechaEmision)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Text strong style={{ fontSize: 16, color: '#389e0d' }}>
              {formatCurrency(record.total, record.moneda)}
            </Text>
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <Text>{record.cliente?.nombreCompleto || '-'}</Text>
          <div style={{ fontSize: 12, color: '#888' }}>
            {record.cliente?.email || record.cliente?.telefono || ''}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tag color={estadoColors[record.estado]}>
            {record.estado || 'sin estado'}
          </Tag>
          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} size="small" />
          </Dropdown>
        </div>
      </div>
    )
  }

  if (isMobile) {
    return (
      <MobileCardList
        data={cotizaciones}
        renderCard={renderMobileCard}
        pagination={{ ...paginacion, total }}
        onPaginationChange={handlePaginationChange}
        emptyText="Sin cotizaciones"
        totalText="cotizaciones"
      />
    )
  }

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

function buildMenuItems(record, onVer, onEliminar, onCambiarEstado) {
  const items = [
    {
      key: 'view',
      label: 'Ver detalle',
      icon: <EyeOutlined />,
      onClick: () => onVer(record),
    },
  ]

  if (record.estado === 'borrador') {
    items.push(
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
    items.push(
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

  return items
}

export default CotizacionesTable

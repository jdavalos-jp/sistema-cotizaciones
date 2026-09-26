import { useDeferredValue, useState } from 'react'
import {
  Button,
  Empty,
  Input,
  Popconfirm,
  Space,
  Table,
  Tooltip,
  Typography,
} from 'antd'
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons'

const { Text } = Typography

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export default function RotulosHistory({ rotulos, onDelete, onDownload, onEdit }) {
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search.trim().toLowerCase())
  const filteredRotulos = deferredSearch
    ? rotulos.filter((rotulo) =>
        [rotulo.nombre, rotulo.cargo, rotulo.correo, rotulo.telefono, rotulo.ciudad]
          .some((value) => String(value || '').toLowerCase().includes(deferredSearch))
      )
    : rotulos

  const columns = [
    {
      title: 'Destinatario',
      key: 'destinatario',
      render: (_, rotulo) => (
        <div className="rotulos-history__person">
          <Text strong>{rotulo.nombre}</Text>
          <Text type="secondary">{rotulo.cargo || 'Sin cargo'}</Text>
        </div>
      ),
    },
    {
      title: 'Contacto',
      key: 'contacto',
      render: (_, rotulo) => (
        <div className="rotulos-history__person">
          <Text>{rotulo.correo || 'Sin correo'}</Text>
          <Text type="secondary">{rotulo.telefono || 'Sin teléfono'}</Text>
        </div>
      ),
    },
    { title: 'Ciudad', dataIndex: 'ciudad', key: 'ciudad', render: (value) => value || '-' },
    {
      title: 'Actualizado',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: formatDate,
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
      align: 'right',
      render: (_, rotulo) => (
        <Space>
          <Tooltip title="Descargar PDF">
            <Button type="text" aria-label="Descargar PDF" icon={<DownloadOutlined />} onClick={() => onDownload(rotulo)} />
          </Tooltip>
          <Tooltip title="Editar">
            <Button type="text" aria-label="Editar rótulo" icon={<EditOutlined />} onClick={() => onEdit(rotulo)} />
          </Tooltip>
          <Popconfirm
            title="Eliminar rótulo"
            description="Esta acción no se puede deshacer."
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(rotulo.id)}
          >
            <Tooltip title="Eliminar">
              <Button type="text" danger aria-label="Eliminar rótulo" icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <div className="rotulos-history__toolbar">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Buscar por nombre, cargo, correo o ciudad"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Text type="secondary">{filteredRotulos.length} rótulo{filteredRotulos.length === 1 ? '' : 's'}</Text>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredRotulos}
        pagination={{ pageSize: 8, hideOnSinglePage: true }}
        locale={{ emptyText: <Empty description="Todavía no hay rótulos guardados" /> }}
        scroll={{ x: 760 }}
      />
    </>
  )
}

import { Card, Button, Table, Tag, Space, Input, Select, Popconfirm, message, Typography, Spin } from 'antd'
import { PlusOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useProformas } from '../hooks/useProformas'

/**
 * Componente ProformasListPage
 */
export default function ProformasListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')
  const { proformas, loading, pagination, loadProformas, deleteProforma, setPagination } = useProformas()

  useEffect(() => {
    loadProformas(0, searchTerm).catch((error) => {
      message.error('Error al cargar proformas')
    })
  }, [])

  const handleSearch = async (value) => {
    setSearchTerm(value)
    setPagination((prev) => ({ ...prev, current: 1 }))
    try {
      await loadProformas(0, value)
    } catch {}
  }

  const handlePaginationChange = async (page) => {
    const skip = (page - 1) * pagination.pageSize
    setPagination((prev) => ({ ...prev, current: page }))
    try {
      await loadProformas(skip, searchTerm)
    } catch {}
  }

  const handleShowSizeChange = async (current, pageSize) => {
    console.log(current, pageSize)
    const skip = (current - 1) * pageSize
    setPagination((prev) => ({ ...prev, current, pageSize }))
    try {
      await loadProformas(skip, searchTerm)
    } catch {}
  }

  const handleDelete = async (idProforma) => {
    try {
      deleteProforma(idProforma)
      message.success('Proforma eliminada')
    } catch (error) {
      message.error('Error al eliminar proforma')
    }
  }

  const columns = [
    { title: 'Número', dataIndex: 'numero', key: 'numero' },
    { title: 'Cliente', dataIndex: 'cliente', key: 'cliente' },
    { title: 'Fecha', dataIndex: 'fecha', key: 'fecha' },
    { title: 'Total', dataIndex: 'total', key: 'total' },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado) => {
        const colorMap = {
          Borrador: 'default',
          Enviada: 'processing',
          Aceptada: 'success',
          Rechazada: 'error',
        }
        return <Tag color={colorMap[estado] || 'default'}>{estado}</Tag>
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space>
          <Button type="text" size="small" icon={<EyeOutlined />}>
            Ver
          </Button>
          <Button type="text" size="small" icon={<DownloadOutlined />}>
            Descargar
          </Button>
          <Popconfirm
            title="Eliminar"
            description="¿Está seguro que desea eliminar?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />}>
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography.Title level={1} style={{ marginTop: 0, marginBottom: 8 }}>
            Proformas
          </Typography.Title>
          <Typography.Text type="secondary">Gestión de cotizaciones y proformas</Typography.Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large">
          Nueva Proforma
        </Button>
      </div>

      <Card>
        <Spin spinning={loading}>
          <div style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            <Input
              placeholder="Buscar por número o cliente..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <Select
              placeholder="Filtrar por estado"
              value={filterEstado}
              onChange={setFilterEstado}
              options={[
                { label: 'Todos', value: 'todos' },
                { label: 'Borrador', value: 'Borrador' },
                { label: 'Enviada', value: 'Enviada' },
                { label: 'Aceptada', value: 'Aceptada' },
                { label: 'Rechazada', value: 'Rechazada' },
              ]}
            />
          </div>

          <Table
            columns={columns}
            dataSource={proformas}
            rowKey="id"
            pagination={{
              pageSize: pagination.pageSize,
              current: pagination.current,
              total: pagination.total,
              onChange: handlePaginationChange,
              onShowSizeChange: handleShowSizeChange,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ['5', '10', '20', '50'],
              showTotal: (total) => `Total: ${total} proformas`,
            }}
            loading={loading}
          />
        </Spin>
      </Card>
    </div>
  )
}

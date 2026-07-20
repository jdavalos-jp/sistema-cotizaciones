import { Card, Button, Table, Input, Popconfirm, message, Typography, Image, Dropdown, Alert, Tag } from 'antd'
import { SearchOutlined, EditOutlined, DeleteOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons'
import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useComponentesManager } from '../hooks/useComponentesManager'
import { useIsMobile } from '../../../hooks/useIsMobile'
import PageWrapper from '../../../shared/components/PageWrapper'
import MobileCardList from '../../../shared/components/MobileCardList'

const { Title, Text } = Typography

export default function ComponentesListPage() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const {
    componentes = [],
    loading,
    error,
    pagination,
    filters,
    handleFilterChange,
    handlePagination,
    deleteComponente,
  } = useComponentesManager()

  const handleSearch = (value) => {
    handleFilterChange({ search: value })
  }

  const handlePaginationChange = (page, pageSize) => {
    if (pageSize !== pagination.take) {
      handlePagination(1, pageSize)
    } else {
      handlePagination(page, pageSize)
    }
  }

  const handleDelete = useCallback(async (idComponente) => {
    try {
      await deleteComponente(idComponente)
      message.success('Componente eliminado')
    } catch (error) {
      message.error(error?.message || 'Error al eliminar componente')
    }
  }, [deleteComponente])

  const handleEditClick = useCallback((idComponente) => {
    navigate(`/componentes/editar/${idComponente}`)
  }, [navigate])

  const columns = useMemo(() => [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      width: 250,
      render: (nombre, record) => (
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 60,
              height: 60,
              flexShrink: 0,
              background: '#f5f5f5',
              borderRadius: 5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {Array.isArray(record.imagenes) && record.imagenes.length > 0 ? (
              <Image
                src={record.imagenes[0]?.urlImagen}
                alt={nombre || 'Imagen del componente'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                preview={{ mask: 'Ver' }}
                fallback=""
              />
            ) : (
              <span style={{ fontSize: 11, color: '#999' }}>Sin imagen</span>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>
              {nombre || 'Sin nombre'}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
      render: (sku) => sku || '-',
    },
    {
      title: 'Precio Base',
      dataIndex: 'precioBase',
      key: 'precioBase',
      width: 120,
      render: (price) => (
        <span style={{ color: '#000000' }}>
          Bs {Number(price || 0).toLocaleString('es-BO')}
        </span>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                label: 'Editar',
                icon: <EditOutlined />,
                onClick: () => handleEditClick(record.idComponente),
              },
              { type: 'divider' },
              {
                key: 'delete',
                label: (
                  <Popconfirm
                    title="Eliminar Componente"
                    description="Esta accion no se puede deshacer."
                    onConfirm={() => handleDelete(record.idComponente)}
                    okText="Eliminar"
                    cancelText="Cancelar"
                    okButtonProps={{ danger: true }}
                  >
                    <div style={{ color: '#ff4d4f', width: '100%' }}>Eliminar</div>
                  </Popconfirm>
                ),
                icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
                danger: true,
              },
            ],
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
        </Dropdown>
      ),
    },
  ], [handleDelete, handleEditClick])

  const renderMobileCard = (record) => (
    <div style={{ display: 'flex', gap: 12 }}>
      <div
        style={{
          width: 64,
          height: 64,
          flexShrink: 0,
          background: '#f5f5f5',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {Array.isArray(record.imagenes) && record.imagenes.length > 0 ? (
          <Image
            src={record.imagenes[0]?.urlImagen}
            alt={record.nombre || 'Imagen del componente'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            preview={{ mask: '' }}
          />
        ) : (
          <span style={{ fontSize: 11, color: '#999' }}>Sin imagen</span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>
          {record.nombre || 'Sin nombre'}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 4 }}>
          <Tag>{record.sku || 'S/N'}</Tag>
          <Text strong style={{ color: '#000' }}>
            Bs {Number(record.precioBase || 0).toLocaleString('es-BO')}
          </Text>
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEditClick(record.idComponente)}>
            Editar
          </Button>
          <Popconfirm
            title="Eliminar Componente"
            description="Esta accion no se puede deshacer."
            onConfirm={() => handleDelete(record.idComponente)}
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      </div>
    </div>
  )

  return (
    <PageWrapper>
      <div style={{ marginBottom: isMobile ? 12 : 24 }}>
        <Title level={3} style={{ margin: 0, fontSize: isMobile ? 20 : undefined }}>
          Componentes
        </Title>
        <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>
          Inicio / Componentes
        </Text>
      </div>

      <Card
        variant="borderless"
        style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: isMobile ? 12 : 24 } }}
      >
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, marginBottom: isMobile ? 12 : 24 }}>
          <Input
            placeholder="Buscar componente por nombre o SKU..."
            value={filters.search}
            onChange={(event) => handleSearch(event.target.value)}
            style={{ flex: 1 }}
            suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
            allowClear
          />

          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/componentes/crear')} block={isMobile}>
            Crear Componente
          </Button>
        </div>

        {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 12 }} />}

        {isMobile ? (
          <MobileCardList
            data={componentes}
            loading={loading}
            renderCard={renderMobileCard}
            pagination={{
              current: pagination.current,
              pageSize: pagination.take,
              total: pagination.total,
            }}
            onPaginationChange={handlePaginationChange}
            emptyText="No hay componentes"
            totalText="componentes"
          />
        ) : (
          <Table
            columns={columns}
            dataSource={componentes}
            rowKey={(record) => String(record.idComponente)}
            pagination={{
              current: pagination.current,
              pageSize: pagination.take,
              total: pagination.total,
              onChange: handlePaginationChange,
              showSizeChanger: true,
              showTotal: (total) => `Total: ${total} componentes`,
              pageSizeOptions: ['10', '20', '50'],
            }}
            scroll={{ x: true }}
            loading={loading}
          />
        )}
      </Card>
    </PageWrapper>
  )
}

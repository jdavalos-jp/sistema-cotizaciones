import { Table, Empty, Button, Input, Typography, Card, Avatar, Space, Tag, Popconfirm, Dropdown } from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  BgColorsOutlined,
  MoreOutlined,
} from '@ant-design/icons'

const { Text } = Typography

const avatarColors = [
  '#1677ff',
  '#13c2c2',
  '#52c41a',
  '#faad14',
  '#f5222d',
  '#722ed1',
  '#eb2f96',
  '#fa8c16',
]

function getInitials(nombre = '') {
  return String(nombre)
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'CA'
}

function CategoryCell({ categoria }) {
  const nombre = String(categoria.nombre || 'Categoría')
  const index = nombre.charCodeAt(0) % avatarColors.length

  return (
    <Space>
      <Avatar size={40} style={{ backgroundColor: avatarColors[index] }}>
        {getInitials(nombre)}
      </Avatar>
      <div>
        <Text strong>{nombre}</Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>
          {categoria.descripcion || 'Sin descripción'}
        </Text>
      </div>
    </Space>
  )
}

function SubcategoriesCell({ subcategorias }) {
  const data = Array.isArray(subcategorias) ? subcategorias : []

  if (data.length === 0) {
    return <Empty description="Sin subcategorías" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: 0 }} />
  }

  return (
    <Space wrap size={[4, 6]}>
      {data.map((sub) => (
        <Tag key={sub.idSubcategoria} color="geekblue">
          {sub.nombre}
        </Tag>
      ))}
    </Space>
  )
}

function StatusBadge({ estado }) {
  const activo = String(estado || 'activo').toLowerCase() === 'activo'

  return (
    <Tag color={activo ? 'success' : 'default'} style={{ borderRadius: 12 }}>
      {activo ? 'Activo' : 'Inactivo'}
    </Tag>
  )
}

function CategoryActions({ category, onEdit, onDelete }) {
  const isInactive = String(category.estado || '').toLowerCase() === 'inactivo'

  return (
    <Dropdown
      menu={{
        items: [
          {
            key: 'edit',
            label: 'Editar',
            icon: <EditOutlined />,
            onClick: () => onEdit(category),
          },
          { type: 'divider' },
          {
            key: 'delete',
            label: (
              <Popconfirm
                title="Desactivar categoría"
                description="La categoría quedará inactiva si no tiene productos o servicios asociados."
                onConfirm={() => onDelete(category.idCategoria)}
                okText="Desactivar"
                cancelText="Cancelar"
                okButtonProps={{ danger: true }}
                disabled={isInactive}
              >
                <div style={{ color: isInactive ? '#ccc' : '#ff4d4f', width: '100%', cursor: isInactive ? 'not-allowed' : 'pointer' }}>
                  Desactivar
                </div>
              </Popconfirm>
            ),
            icon: <DeleteOutlined style={{ color: isInactive ? '#ccc' : '#ff4d4f' }} />,
            danger: true,
            disabled: isInactive,
          },
        ],
      }}
      trigger={['click']}
      placement="bottomRight"
    >
      <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
    </Dropdown>
  )
}

export default function CategoriesList({
  categorias = [],
  loading,
  pagination,
  searchValue,
  onSearch,
  onPaginationChange,
  onAddCategory,
  onEdit,
  onDelete,
}) {
  const columns = [
    {
      title: 'Categoría',
      dataIndex: 'nombre',
      key: 'categoria',
      width: '30%',
      render: (_, record) => <CategoryCell categoria={record} />,
    },
    {
      title: 'Subcategorías',
      dataIndex: 'subcategorias',
      key: 'subcategorias',
      width: '35%',
      render: (subcategorias) => <SubcategoriesCell subcategorias={subcategorias} />,
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: '15%',
      render: (estado) => <StatusBadge estado={estado} />,
      align: 'center',
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 100,
      render: (_, record) => (
        <CategoryActions category={record} onEdit={onEdit} onDelete={onDelete} />
      ),
    },
  ]

  return (
    <div style={{ backgroundColor: '#f5f5f5', padding: 24, minHeight: '100vh', margin: '-24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Categorías
        </Typography.Title>
        <Typography.Text type="secondary" style={{ fontSize: 14 }}>
          Inicio / Categorías
        </Typography.Text>
      </div>

      <Card
        variant="borderless"
        styles={{ body: { padding: 24 } }}
        style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
      >
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <Input
            allowClear
            placeholder="Buscar categoría..."
            value={searchValue}
            onChange={(event) => onSearch(event.target.value)}
            style={{ flex: 1 }}
            suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
          />

          <Button type="primary" icon={<PlusOutlined />} onClick={onAddCategory}>
            Agregar Categoría
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={categorias}
          rowKey={(record) => String(record.idCategoria)}
          loading={loading}
          pagination={{
            pageSize: pagination.pageSize,
            current: pagination.current,
            total: pagination.total,
            onChange: onPaginationChange,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total) => `Total: ${total} categoría${total !== 1 ? 's' : ''}`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={<BgColorsOutlined style={{ fontSize: 32, color: '#8c8c8c' }} />}
                description="No hay categorías"
              />
            ),
          }}
          scroll={{ x: 760 }}
        />
      </Card>
    </div>
  )
}

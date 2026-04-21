import { Table, Empty, Button, Input, Typography, Card, Avatar, Space, Tag, Popconfirm, Dropdown } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons'

const { Text } = Typography

/**
 * ============================================
 * TABLA DE CATEGORÍAS - COMPONENTES INTERNOS
 * ============================================
 */

// ============= CELDA: Categoría =============
function CategoryCell({ categoria }) {
  const colors = [
    '#1890ff', '#722ed1', '#fa8c16', '#eb2f96', '#13c2c2',
    '#52c41a', '#faad14', '#f5222d', '#1089ff', '#13c2c2'
  ]
  const index = categoria.nombre.charCodeAt(0) % colors.length

  const getInitials = (nombre) => {
    return nombre
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Space>
      <Avatar size={40} style={{ backgroundColor: colors[index] }}>
        {getInitials(categoria.nombre)}
      </Avatar>
      <div>
        <Text strong>{categoria.nombre}</Text>
        <br />
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {categoria.descripcion || 'Sin descripción'}
        </Text>
      </div>
    </Space>
  )
}

// ============= CELDA: Subcategorías =============
function SubcategoriesCell({ subcategorias }) {
  if (!subcategorias || subcategorias.length === 0) {
    return <Empty description="Sin subcategorías" style={{ margin: 0 }} />
  }

  return (
    <Space wrap>
      {subcategorias.map((sub) => (
        <Tag key={sub.idSubcategoria} color="blue">
          {sub.nombre}
        </Tag>
      ))}
    </Space>
  )
}

// ============= CELDA: Estado =============
function StatusBadge({ estado }) {
  const statusConfig = {
    activo: { color: '#52c41a', label: 'Activo' },
    inactivo: { color: '#f5222d', label: 'Inactivo' },
    true: { color: '#52c41a', label: 'Activo' },
    false: { color: '#f5222d', label: 'Inactivo' },
    '1': { color: '#52c41a', label: 'Activo' },
    '0': { color: '#f5222d', label: 'Inactivo' },
  }

  const config = statusConfig[estado] || statusConfig[estado ? 'true' : 'false']
  return (
    <Tag color={config.color} style={{ borderRadius: '12px' }}>
      {config.label}
    </Tag>
  )
}

// ============= CELDA: Acciones =============
function CategoryActions({ category, onEdit, onDelete }) {
  const handleDelete = () => {
    onDelete(category.idCategoria)
  }

  const dropdownItems = [
    {
      key: 'edit',
      label: 'Editar',
      icon: <EditOutlined />,
      onClick: () => onEdit(category),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: (
        <Popconfirm
          title="Eliminar categoría"
          description="¿Estás seguro que deseas eliminar esta categoría?"
          onConfirm={handleDelete}
          okText="Sí"
          cancelText="No"
          okButtonProps={{ danger: true }}
        >
          <span style={{ color: 'red' }}>Eliminar</span>
        </Popconfirm>
      ),
      danger: true,
    },
  ]

  return (
    <Dropdown menu={{ items: dropdownItems }} trigger={['click']} placement="bottomRight">
      <Button type="text" size="small">
        Acciones <DownOutlined style={{ fontSize: '12px' }} />
      </Button>
    </Dropdown>
  )
}

/**
 * ============================================
 * COMPONENTE PRINCIPAL: CategoriesList
 * ============================================
 * Consolida Header + SearchBar + Table
 */
export default function CategoriesList({
  categorias,
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
      width: '25%',
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
      width: '25%',
      align: 'right',
      render: (_, record) => (
        <CategoryActions category={record} onEdit={onEdit} onDelete={onDelete} />
      ),
    },
  ]

  return (
    <div style={{ backgroundColor: '#f5f5f5', padding: '24px', minHeight: '100vh', margin: '-24px' }}>
      {/* ALINEACIÓN TIPO BREADCRUMB */}
      <div style={{ marginBottom: 24 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Categorías
        </Typography.Title>
        <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
          Inicio / Categorías
        </Typography.Text>
      </div>

      <Card bodyStyle={{ padding: '24px' }} bordered={false} style={{ borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        {/* TOP BAR: BUSCADOR Y BOTÓN */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <Input
            placeholder="Buscar categoria"
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            style={{ flex: 1 }}
            suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
          />
          <Button type="primary" onClick={onAddCategory}>
            Añadir categoria
          </Button>
        </div>

        {/* TABLA */}
        <Table
          columns={columns}
          dataSource={categorias}
          rowKey="idCategoria"
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
          locale={{ emptyText: <Empty description="No hay categorías" /> }}
        />
      </Card>
    </div>
  )
}

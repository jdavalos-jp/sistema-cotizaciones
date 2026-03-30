import { Table, Empty } from 'antd'
import CategoryCell from './CategoryCell'
import StatusBadge from './StatusBadge'
import CategoryActions from './CategoryActions'

/**
 * Componente CategoriesTable
 * Tabla con listado de categorías
 */
export default function CategoriesTable({
  categorias,
  loading,
  pagination,
  onPaginationChange,
  onEdit,
  onDelete,
}) {
  const columns = [
    {
      title: 'Categoría',
      dataIndex: 'nombre',
      key: 'categoria',
      width: '40%',
      render: (_, record) => <CategoryCell categoria={record} />,
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      width: '25%',
      render: (text) => text || '-',
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
      width: '20%',
      align: 'right',
      render: (_, record) => (
        <CategoryActions category={record} onEdit={onEdit} onDelete={onDelete} />
      ),
    },
  ]

  return (
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
  )
}

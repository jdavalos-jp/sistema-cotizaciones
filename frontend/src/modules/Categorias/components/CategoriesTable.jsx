import { Table, Empty } from 'antd'
import CategoryCell from './CategoryCell'
import SubcategoriesCell from './SubcategoriesCell'
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

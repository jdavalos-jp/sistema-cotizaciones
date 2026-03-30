import { Button, Popconfirm, Space, Dropdown } from 'antd'
import { EditOutlined, DeleteOutlined, EllipsisOutlined } from '@ant-design/icons'

/**
 * Componente CategoryActions
 * Acciones para una categoría (editar, eliminar)
 */
export default function CategoryActions({ category, onEdit, onDelete }) {
  const items = [
    {
      key: 'edit',
      label: 'Editar',
      icon: <EditOutlined />,
      onClick: () => onEdit(category),
    },
    {
      key: 'delete',
      label: 'Eliminar',
      icon: <DeleteOutlined />,
      danger: true,
    },
  ]

  const handleDelete = () => {
    onDelete(category.idCategoria)
  }

  return (
    <Space>
      <Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEdit(category)} title="Editar">
        Editar
      </Button>
      <Popconfirm
        title="Eliminar categoría"
        description="¿Estás seguro que deseas eliminar esta categoría?"
        onConfirm={handleDelete}
        okText="Sí"
        cancelText="No"
        okButtonProps={{ danger: true }}
      >
        <Button type="text" size="small" danger icon={<DeleteOutlined />} title="Eliminar">
          Eliminar
        </Button>
      </Popconfirm>
    </Space>
  )
}

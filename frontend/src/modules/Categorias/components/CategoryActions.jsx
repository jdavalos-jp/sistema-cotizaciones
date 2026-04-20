import { Button, Popconfirm, Dropdown } from 'antd'
import { EditOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons'

/**
 * Componente CategoryActions
 * Acciones para una categoría (editar, eliminar) en formato dropdown
 */
export default function CategoryActions({ category, onEdit, onDelete }) {
  const handleDelete = () => {
    onDelete(category.idCategoria)
  }

  const items = [
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
      label: 'Eliminar',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => {
        // El Popconfirm se manejará a través del dropdown
      },
    },
  ]

  // Crear un dropdown con el Popconfirm para eliminar
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
          onOpenChange={(open) => {
            if (!open) {
              // Prevenir que se cierre el dropdown si se cancela
            }
          }}
        >
          <span style={{ color: 'red' }}>Eliminar</span>
        </Popconfirm>
      ),
      danger: true,
    },
  ]

  return (
    <Dropdown
      menu={{ items: dropdownItems }}
      trigger={['click']}
      placement="bottomRight"
    >
      <Button type="text" size="small">
        Acciones <DownOutlined style={{ fontSize: '12px' }} />
      </Button>
    </Dropdown>
  )
}

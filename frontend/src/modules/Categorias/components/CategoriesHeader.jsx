import { Button, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

/**
 * Componente CategoriesHeader
 * Encabezado con título y botón para agregar categoría
 */
export default function CategoriesHeader({ onAddCategory }) {
  return (
    <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <Typography.Title level={2} style={{ marginTop: 0, marginBottom: 8 }}>
          Categorías
        </Typography.Title>
        <Typography.Text type="secondary">Gestión de categorías de productos</Typography.Text>
      </div>
      <Button type="primary" icon={<PlusOutlined />} onClick={onAddCategory}>
        Añadir categoría 
      </Button>
    </div>
  )
}

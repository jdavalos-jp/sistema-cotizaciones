import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

/**
 * Componente CategoriesSearchBar
 * Buscador de categorías
 */
export default function CategoriesSearchBar({ value, onChange }) {
  return (
    <div>
    <div style={{ marginBottom: 16 }}>
      <Input
        placeholder="Buscar categoría..."
        prefix={<SearchOutlined />}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ maxWidth: 400 }}
        
      />
    </div>
      <Button type="primary" icon={<PlusOutlined />} onClick={onAddCategory}>
        Añadir categoría 
      </Button>
    </div>
    
  )
}

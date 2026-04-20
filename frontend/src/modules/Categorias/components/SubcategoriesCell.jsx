import { Space, Tag, Empty } from 'antd'

/**
 * Componente SubcategoriesCell
 * Muestra las subcategorías como tags/badges
 */
export default function SubcategoriesCell({ subcategorias }) {
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

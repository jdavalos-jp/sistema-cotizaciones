import { Avatar, Space, Typography } from 'antd'

/**
 * Componente CategoryCell
 * Muestra el ícono y nombre de la categoría
 */
export default function CategoryCell({ categoria }) {
  // Generar un color consistente basado en el nombre de la categoría
  const getAvatarColor = (nombre) => {
    const colors = [
      '#1890ff', '#722ed1', '#fa8c16', '#eb2f96', '#13c2c2',
      '#52c41a', '#faad14', '#f5222d', '#1089ff', '#13c2c2'
    ]
    const index = nombre.charCodeAt(0) % colors.length
    return colors[index]
  }

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
      <Avatar size={40} style={{ backgroundColor: getAvatarColor(categoria.nombre) }}>
        {getInitials(categoria.nombre)}
      </Avatar>
      <div>
        <Typography.Text strong>{categoria.nombre}</Typography.Text>
        <br />
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          {categoria.descripcion || 'Sin descripción'}
        </Typography.Text>
      </div>
    </Space>
  )
}

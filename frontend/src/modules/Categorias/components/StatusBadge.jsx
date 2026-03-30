import { Tag } from 'antd'

/**
 * Componente StatusBadge
 * Muestra el estado con un badge coloreado
 */
export default function StatusBadge({ estado }) {
  const statusConfig = {
    activo: { color: '#52c41a', label: 'Activo' },
    inactivo: { color: '#f5222d', label: 'Inactivo' },
    true: { color: '#52c41a', label: 'Activo' },
    false: { color: '#f5222d', label: 'Inactivo' },
    '1': { color: '#52c41a', label: 'Activo' },
    '0': { color: '#f5222d', label: 'Inactivo' },
  }

  const config = statusConfig[estado] || statusConfig[estado ? 'true' : 'false']
  const { color, label } = config

  return (
    <Tag color={color} style={{ borderRadius: '12px' }}>
      {label}
    </Tag>
  )
}

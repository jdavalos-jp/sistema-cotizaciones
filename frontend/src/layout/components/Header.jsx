import { Layout, Avatar, Dropdown, Badge, Button, Space, Typography } from 'antd'
import { BellOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons'

const { Header: AntHeader } = Layout

/**
 * Componente Header
 * - Muestra información del usuario
 * - Notificaciones
 * - Botón de logout
 * - Responsive
 */
export default function Header() {
  const userMenu = [
    { key: 'profile', label: 'Perfil', icon: <UserOutlined /> },
    { type: 'divider' },
    { key: 'logout', label: 'Cerrar sesión', icon: <LogoutOutlined />, danger: true },
  ]

  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      console.log('Logout')
      // Aquí ir ía la lógica de logout
    } else if (key === 'profile') {
      console.log('Ir a perfil')
    }
  }

  return (
    <AntHeader
      style={{
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 24,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Notificaciones */}
      <Badge count={3} color="#1890ff">
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 18 }} />}
          style={{ border: 'none' }}
        />
      </Badge>

      {/* Usuario */}
      <Space>
        <Dropdown menu={{ items: userMenu, onClick: handleUserMenuClick }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} style={{ background: '#1890ff' }} />
            <Typography.Text style={{ fontSize: 14 }}>Admin</Typography.Text>
          </div>
        </Dropdown>
      </Space>
    </AntHeader>
  )
}

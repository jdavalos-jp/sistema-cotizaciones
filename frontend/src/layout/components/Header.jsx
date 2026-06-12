import { Layout, Avatar, Button, Space, Tag, Typography } from 'antd'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../auth/auth.js'
import { useAuthUser } from '../../auth/useAuthUser.js'

const { Header: AntHeader } = Layout

export default function Header() {
  const user = useAuthUser()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <AntHeader
      style={{
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 18,
        height: 64,
        lineHeight: 'normal',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Space size={10} align="center">
        <Avatar icon={<UserOutlined />} style={{ background: '#1677ff' }} />
        <Space size={8} align="center">
          <Typography.Text strong style={{ lineHeight: 1.2 }}>
            {user?.name || 'Usuario'}
          </Typography.Text>
          <Tag color={user?.role === 'administrador' ? 'blue' : 'green'} style={{ marginInlineEnd: 0, lineHeight: '20px' }}>
            {user?.role || 'sin rol'}
          </Tag>
        </Space>
      </Space>

      <Button icon={<LogoutOutlined />} onClick={handleLogout}>
        Cerrar sesión
      </Button>
    </AntHeader>
  )
}

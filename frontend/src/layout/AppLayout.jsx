import React, { useMemo, useState } from 'react'
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Breadcrumb, Layout, Menu, theme, Typography } from 'antd'

const { Header, Content, Footer, Sider } = Layout

function getItem(label, key, icon, children) {
  return { key, icon, children, label }
}

export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [selectedKey, setSelectedKey] = useState('cotizaciones')

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const items = useMemo(
    () => [
      getItem('Cotizaciones', 'cotizaciones', <PieChartOutlined />),
      getItem('Clientes', 'clientes', <UserOutlined />),
      getItem('Catálogo', 'catalogo', <DesktopOutlined />, [
        getItem('Productos', 'productos'),
        getItem('Componentes', 'componentes'),
      ]),
      getItem('Equipo', 'equipo', <TeamOutlined />, [getItem('Usuarios', 'usuarios')]),
      getItem('Solicitudes web', 'solicitudes', <FileOutlined />),
    ],
    [],
  )

  const breadcrumbItems = useMemo(() => {
    const map = {
      cotizaciones: ['Cotizaciones'],
      clientes: ['Clientes'],
      catalogo: ['Catálogo'],
      productos: ['Catálogo', 'Productos'],
      componentes: ['Catálogo', 'Componentes'],
      equipo: ['Equipo'],
      usuarios: ['Equipo', 'Usuarios'],
      solicitudes: ['Solicitudes web'],
    }

    const parts = map[selectedKey] ?? ['Inicio']
    return parts.map((title) => ({ title }))
  }, [selectedKey])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ padding: 16 }}>
          <Typography.Text style={{ color: 'rgba(255,255,255,0.85)' }}>
            {collapsed ? 'SC' : 'Sistemas Cotizaciones'}
          </Typography.Text>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          items={items}
          selectedKeys={[selectedKey]}
          onClick={({ key }) => setSelectedKey(key)}
        />
      </Sider>

      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />

        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb style={{ margin: '16px 0' }} items={breadcrumbItems} />

          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </div>
        </Content>

        <Footer style={{ textAlign: 'center' }}>
          Sistemas Cotizaciones ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  )
}

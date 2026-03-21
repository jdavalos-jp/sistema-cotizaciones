import React, { useMemo, useState } from 'react'
import {
  Layout,
  Menu,
  Breadcrumb,
  Input,
  Avatar,
  Dropdown,
  Badge,
  theme,
} from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  UserOutlined,
  FileTextOutlined,
  InboxOutlined,
  DownloadOutlined,
  SettingOutlined,
  BellOutlined,
  HistoryOutlined,
  ShoppingOutlined,
  BgColorsOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import { HistorialCotizaciones } from '../modules/Historial_cotizaciones'

const { Header, Content, Sider } = Layout

function getItem(label, key, icon, children) {
  return { key, icon, children, label }
}

export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [selectedKey, setSelectedKey] = useState('dashboard')
  const [content, setContent] = useState(children)

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const items = useMemo(() => [
    getItem('Dashboard', 'dashboard', <DashboardOutlined />),

    getItem(' Catálogo', 'catalogo', <ShoppingOutlined />, [
      getItem('Ver Catálogo Completo', 'catalogo-completo', <ShoppingOutlined />),
      getItem('Productos', 'productos', <AppstoreOutlined />),
      getItem('Categorías', 'categorias', <BgColorsOutlined />),
      getItem('Subcategorías', 'subcategorias', <UnorderedListOutlined />),
    ]),

    getItem('Clientes', 'clientes', <UserOutlined />),
    getItem('Leads', 'leads', <UserOutlined />),

    getItem('Documentos', 'documentos', <FileTextOutlined />, [
      getItem('Proformas', 'proformas'),
      getItem('Historial de Cotizaciones', 'historial-cotizaciones', <HistoryOutlined />),
      getItem('Ventas', 'ventas'),
      getItem('Contratos', 'contratos'),
    ]),

    getItem('Inventario', 'inventario', <InboxOutlined />, [
      getItem('Stock', 'stock'),
      getItem('Movimientos', 'movimientos'),
    ]),

    getItem('Descargas', 'descargas', <DownloadOutlined />),
    getItem('Configuración', 'configuracion', <SettingOutlined />),
  ], [])

  const breadcrumbItems = useMemo(() => {
    const map = {
      dashboard: ['Dashboard'],
      productos: ['Catálogo', 'Productos'],
      'catalogo-completo': ['Catálogo', 'Ver Catálogo Completo'],
      categorias: ['Catálogo', 'Categorías'],
      subcategorias: ['Catálogo', 'Subcategorías'],
      clientes: ['Clientes'],
      leads: ['Leads'],
      proformas: ['Documentos', 'Proformas'],
      'historial-cotizaciones': ['Documentos', 'Historial de Cotizaciones'],
      ventas: ['Documentos', 'Ventas'],
      contratos: ['Documentos', 'Contratos'],
      stock: ['Inventario', 'Stock'],
      movimientos: ['Inventario', 'Movimientos'],
      descargas: ['Descargas'],
      configuracion: ['Configuración'],
    }

    return (map[selectedKey] || ['Dashboard']).map((title) => ({ title }))
  }, [selectedKey])

  const userMenu = (
    <Menu>
      <Menu.Item key="perfil">Perfil</Menu.Item>
      <Menu.Item key="logout">Cerrar sesión</Menu.Item>
    </Menu>
  )

  const handleNavigation = async (key) => {
    setSelectedKey(key)

    // CATÁLOGO - VER CATÁLOGO COMPLETO
    if (key === 'catalogo-completo') {
      const mod = await import('../modules/Catalogo/components/Catalogo.jsx')
      const Catalogo = mod.default
      setContent(<Catalogo />)
      return
    }

    // CATÁLOGO - PRODUCTOS
    if (key === 'productos') {
      const mod = await import('../modules/Producto/components/ProductoForm.jsx')
      const ProductoForm = mod.default
      setContent(
        <ProductoForm
          onCancel={() => {
            setSelectedKey('dashboard')
            setContent(children)
          }}
        />
      )
      return
    }

    // CATÁLOGO - CATEGORÍAS
    if (key === 'categorias') {
      setContent(
        <div style={{ padding: '20px' }}>
          <h2> Gestión de Categorías</h2>
          <p>Este módulo está en desarrollo. Próximamente podrás gestionar todas tus categorías.</p>
        </div>
      )
      return
    }

    // CATÁLOGO - SUBCATEGORÍAS
    if (key === 'subcategorias') {
      setContent(
        <div style={{ padding: '20px' }}>
          <h2>Gestión de Subcategorías</h2>
          <p>Este módulo está en desarrollo. Próximamente podrás gestionar todas tus subcategorías.</p>
        </div>
      )
      return
    }

    // DOCUMENTOS - PROFORMAS
    if (key === 'proformas') {
      const mod = await import('../modules/cotizacion/components/CotizacionNueva.jsx')
      const CotizacionNueva = mod.default
      setContent(<CotizacionNueva />)
      return
    }

    // DOCUMENTOS - HISTORIAL DE COTIZACIONES
    if (key === 'historial-cotizaciones') {
      setContent(<HistorialCotizaciones />)
      return
    }

    // DOCUMENTOS - VENTAS
    if (key === 'ventas') {
      setContent(
        <div style={{ padding: '20px' }}>
          <h2>Gestión de Ventas</h2>
          <p>Este módulo está en desarrollo.</p>
        </div>
      )
      return
    }

    // DOCUMENTOS - CONTRATOS
    if (key === 'contratos') {
      setContent(
        <div style={{ padding: '20px' }}>
          <h2> Gestión de Contratos</h2>
          <p>Este módulo está en desarrollo.</p>
        </div>
      )
      return
    }

    // CLIENTES
    if (key === 'clientes') {
      setContent(
        <div style={{ padding: '20px' }}>
          <h2>👥 Gestión de Clientes</h2>
          <p>Este módulo está en desarrollo.</p>
        </div>
      )
      return
    }

    // LEADS
    if (key === 'leads') {
      setContent(
        <div style={{ padding: '20px' }}>
          <h2> Gestión de Leads</h2>
          <p>Este módulo está en desarrollo.</p>
        </div>
      )
      return
    }

    // INVENTARIO - STOCK
    if (key === 'stock') {
      setContent(
        <div style={{ padding: '20px' }}>
          <h2> Gestión de Stock</h2>
          <p>Este módulo está en desarrollo.</p>
        </div>
      )
      return
    }

    // INVENTARIO - MOVIMIENTOS
    if (key === 'movimientos') {
      setContent(
        <div style={{ padding: '20px' }}>
          <h2> Movimientos de Stock</h2>
          <p>Este módulo está en desarrollo.</p>
        </div>
      )
      return
    }

    // DESCARGAS
    if (key === 'descargas') {
      setContent(
        <div style={{ padding: '20px' }}>
          <h2>⬇ Descargas</h2>
          <p>Este módulo está en desarrollo.</p>
        </div>
      )
      return
    }

    // CONFIGURACIÓN
    if (key === 'configuracion') {
      setContent(
        <div style={{ padding: '20px' }}>
          <h2> Configuración</h2>
          <p>Este módulo está en desarrollo.</p>
        </div>
      )
      return
    }

    // DEFAULT - DASHBOARD
    setContent(children)
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        style={{ background: '#0f172a' }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
          }}
        >
          {collapsed ? 'J' : 'JDBLab'}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          items={items}
          selectedKeys={[selectedKey]}
          onClick={({ key }) => handleNavigation(key)}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 20px',
            background: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {collapsed ? (
              <MenuUnfoldOutlined onClick={() => setCollapsed(false)} />
            ) : (
              <MenuFoldOutlined onClick={() => setCollapsed(true)} />
            )}
            <Input.Search placeholder="Buscar..." style={{ width: 300 }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Badge count={3}>
              <BellOutlined />
            </Badge>
            <Dropdown overlay={userMenu}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                }}
              >
                <Avatar icon={<UserOutlined />} />
                <span>Admin</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ margin: '20px' }}>
          <Breadcrumb style={{ marginBottom: 16 }} items={breadcrumbItems} />

          <div
            style={{
              padding: 24,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            {content}
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
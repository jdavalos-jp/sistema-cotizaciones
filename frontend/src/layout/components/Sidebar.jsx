import { useState, useMemo } from 'react'
import { Layout, Menu } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BgColorsOutlined,
  UnorderedListOutlined,
  InboxOutlined,
  DownloadOutlined,
  SettingOutlined,
} from '@ant-design/icons'

const { Sider } = Layout

/**
 * Componente Sidebar
 * - Menú lateral con navegación
 * - Se colapsa automáticamente en pantallas pequeñas
 * - Resalta la ruta activa
 */
function getItem(label, key, icon, children) {
  return { key, icon, children, label }
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Mapeo de rutas a keys del menú
  const routeToMenuKey = {
    '/': 'dashboard',
    '/dashboard': 'dashboard',
    
    '/productos': 'productos',
    '/categorias': 'categorias',
    '/componentes': 'componentes',
    '/clientes': 'clientes',
    '/cotizaciones/nueva': 'nueva-cotizacion',
    '/cotizaciones/historial': 'historial-cotizaciones',
    '/proformas': 'proformas',
  }

  const selectedKey = routeToMenuKey[location.pathname] || 'dashboard'

  const menuItems = useMemo(() => [
    getItem('Dashboard', 'dashboard', <DashboardOutlined />),

    getItem('Catálogo', 'catalogo-group', <ShoppingOutlined />, [
      //getItem('Ver Catálogo', 'catalogo', <ShoppingOutlined />),
      getItem('Productos', 'productos', <ShoppingOutlined />),
      getItem('Componentes', 'componentes', <ShoppingOutlined />),
      getItem('Categorías', 'categorias', <BgColorsOutlined />),
    ]),

    getItem('Clientes', 'clientes', <UserOutlined />),

    getItem('Documentos', 'documentos', <FileTextOutlined />, [
     // getItem('Proformas', 'proformas', <FileTextOutlined />),
      getItem('Nueva Cotización', 'nueva-cotizacion', <ShoppingOutlined />),
      getItem('Historial de Cotizaciones', 'historial-cotizaciones', <FileTextOutlined />),
    ]),

    getItem('Inventario', 'inventario', <InboxOutlined />, [
      getItem('Stock', 'inventario-stock', <InboxOutlined />),
      getItem('Movimientos', 'inventario-movimientos', <InboxOutlined />),
    ]),

    getItem('Descargas', 'descargas', <DownloadOutlined />),
    getItem('Configuración', 'configuracion', <SettingOutlined />),
  ], [])

  // Mapeo de keys a rutas
  const menuKeyToRoute = {
    dashboard: '/',
    catalogo: '/catalogo',
    productos: '/productos',
    componentes: '/componentes',
    categorias: '/categorias',
    clientes: '/clientes',
    proformas: '/proformas',
    'nueva-cotizacion': '/cotizaciones/nueva',
    'historial-cotizaciones': '/cotizaciones/historial',
  }

  const handleMenuClick = ({ key }) => {
    const route = menuKeyToRoute[key]
    if (route) {
      navigate(route)
    }
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={() => setCollapsed(!collapsed)}
      style={{
        background: '#0f172a',
        position: 'sticky',
        left: 0,
        top: 0,
        bottom: 0,
      }}
      width={220}
    >
      {/* Logo */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: collapsed ? 16 : 18,
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        {collapsed ? 'JDB' : ' JDBLab & TECNOequip'}
      </div>

      {/* Menú */}
      <Menu
        theme="dark"
        mode="inline"
        items={menuItems}
        selectedKeys={[selectedKey]}
        onClick={handleMenuClick}
      />
    </Sider>
  )
}

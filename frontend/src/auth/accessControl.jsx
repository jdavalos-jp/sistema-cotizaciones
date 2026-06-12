import {
  BarChartOutlined,
  BgColorsOutlined,
  CloudDownloadOutlined,
  DashboardOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  InboxOutlined,
  SettingOutlined,
  ShoppingOutlined,
  TeamOutlined,
  ToolOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons'

export const ROLES = {
  ADMIN: 'administrador',
  SELLER: 'vendedor',
}

export const menuByRole = {
  [ROLES.ADMIN]: [
    { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: <DashboardOutlined /> },
    {
      key: 'catalogo',
      label: 'Catálogo',
      icon: <FolderOpenOutlined />,
      children: [
        { key: 'productos', label: 'Productos', path: '/productos', icon: <ShoppingOutlined /> },
        { key: 'componentes', label: 'Componentes', path: '/componentes', icon: <ToolOutlined /> },
        { key: 'categorias', label: 'Categorías', path: '/categorias', icon: <BgColorsOutlined /> },
      ],
    },
    { key: 'clientes', label: 'Clientes', path: '/clientes', icon: <UserOutlined /> },
    {
      key: 'documentos',
      label: 'Documentos',
      icon: <FileTextOutlined />,
      children: [
        { key: 'cotizaciones-nueva', label: 'Nueva Cotización', path: '/cotizaciones/nueva', icon: <FileTextOutlined /> },
        { key: 'cotizaciones-historial', label: 'Historial de Cotizaciones', path: '/cotizaciones/historial', icon: <FileTextOutlined /> },
      ],
    },
    {
      key: 'inventario',
      label: 'Inventario',
      icon: <InboxOutlined />,
      children: [
        { key: 'inventario-stock', label: 'Stock', path: '/inventario/stock', icon: <InboxOutlined /> },
        { key: 'inventario-movimientos', label: 'Movimientos', path: '/inventario/movimientos', icon: <InboxOutlined /> },
      ],
    },
    { key: 'descargas', label: 'Descargas', path: '/descargas', icon: <CloudDownloadOutlined /> },
    {
      key: 'configuracion-grupo',
      label: 'Configuración',
      icon: <SettingOutlined />,
      children: [
        { key: 'configuracion', label: 'General', path: '/configuracion', icon: <SettingOutlined /> },
        { key: 'usuarios', label: 'Usuarios', path: '/usuarios', icon: <TeamOutlined /> },
        { key: 'reportes', label: 'Reportes', path: '/reportes', icon: <BarChartOutlined /> },
      ],
    },
  ],
  [ROLES.SELLER]: [
    { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: <DashboardOutlined /> },
    {
      key: 'catalogo',
      label: 'Catálogo',
      icon: <FolderOpenOutlined />,
      children: [
        { key: 'productos', label: 'Productos', path: '/productos', icon: <ShoppingOutlined /> },
        { key: 'componentes', label: 'Componentes', path: '/componentes', icon: <ToolOutlined /> },
      ],
    },
    { key: 'clientes', label: 'Clientes', path: '/clientes', icon: <UserOutlined /> },
    { key: 'clientes-crear', label: 'Registrar cliente', path: '/clientes/crear', icon: <UserAddOutlined /> },
    {
      key: 'documentos',
      label: 'Documentos',
      icon: <FileTextOutlined />,
      children: [
        { key: 'cotizaciones-nueva', label: 'Nueva Cotización', path: '/cotizaciones/nueva', icon: <FileTextOutlined /> },
        { key: 'cotizaciones-historial', label: 'Historial de Cotizaciones', path: '/cotizaciones/historial', icon: <FileTextOutlined /> },
      ],
    },
  ],
}

export const routeRoles = {
  '/dashboard': [ROLES.ADMIN, ROLES.SELLER],
  '/productos': [ROLES.ADMIN, ROLES.SELLER],
  '/clientes': [ROLES.ADMIN, ROLES.SELLER],
  '/clientes/crear': [ROLES.ADMIN, ROLES.SELLER],
  '/cotizaciones/nueva': [ROLES.ADMIN, ROLES.SELLER],
  '/cotizaciones/historial': [ROLES.ADMIN, ROLES.SELLER],
  '/productos/crear': [ROLES.ADMIN],
  '/productos/editar/:id': [ROLES.ADMIN],
  '/componentes': [ROLES.ADMIN, ROLES.SELLER],
  '/componentes/crear': [ROLES.ADMIN],
  '/componentes/editar/:id': [ROLES.ADMIN],
  '/categorias': [ROLES.ADMIN],
  '/categorias/crear': [ROLES.ADMIN],
  '/categorias/editar/:id': [ROLES.ADMIN],
  '/usuarios': [ROLES.ADMIN],
  '/reportes': [ROLES.ADMIN],
  '/configuracion': [ROLES.ADMIN],
  '/inventario/stock': [ROLES.ADMIN],
  '/inventario/movimientos': [ROLES.ADMIN],
  '/descargas': [ROLES.ADMIN],
  '/proformas': [ROLES.ADMIN],
}

export function getMenuItemsForRole(role) {
  return menuByRole[role] || []
}

export function flattenMenuItems(items = []) {
  return items.flatMap((item) => [item, ...flattenMenuItems(item.children || [])])
}

export function getMenuKeyByPath(pathname, role) {
  const items = flattenMenuItems(getMenuItemsForRole(role))
  const exact = items.find((item) => item.path === pathname)
  if (exact) return exact.key

  const editMatch = items.find((item) => pathname.startsWith(item.path) && item.path !== '/dashboard')
  return editMatch?.key || 'dashboard'
}

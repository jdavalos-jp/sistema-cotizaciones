import { useMemo, useState } from 'react'
import { Layout, Menu } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { flattenMenuItems, getMenuItemsForRole, getMenuKeyByPath } from '../../auth/accessControl.jsx'
import { useAuthUser } from '../../auth/useAuthUser.js'
import './Sidebar.css'

const { Sider } = Layout

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthUser()

  const role = user?.role
  const menuConfig = useMemo(() => getMenuItemsForRole(role), [role])
  const flatMenuConfig = useMemo(() => flattenMenuItems(menuConfig), [menuConfig])
  const selectedKey = getMenuKeyByPath(location.pathname, role)

  const menuItems = useMemo(
    () =>
      menuConfig.map((item) => ({
        key: item.key,
        icon: item.icon,
        label: item.label,
        children: item.children?.map((child) => ({
          key: child.key,
          icon: child.icon,
          label: child.label,
        })),
      })),
    [menuConfig]
  )

  const handleMenuClick = ({ key }) => {
    const item = flatMenuConfig.find((entry) => entry.key === key)
    if (item?.path) navigate(item.path)
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      className="app-sidebar"
      width={214}
    >
      <div className="app-sidebar__brand">
        {collapsed ? 'JDB' : 'JDBlab & TECNOequip'}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        items={menuItems}
        selectedKeys={[selectedKey]}
        onClick={handleMenuClick}
        className="app-sidebar__menu"
      />
    </Sider>
  )
}

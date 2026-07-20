import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import { useIsMobile } from '../hooks/useIsMobile.js'

const { Content } = Layout
export default function MainLayout() {
  const isMobile = useIsMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleToggleSidebar = useCallback(() => {
    setDrawerOpen((prev) => !prev)
  }, [])

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false)
  }, [])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar
        isMobile={isMobile}
        drawerOpen={drawerOpen}
        onDrawerClose={handleDrawerClose}
      />
      <Layout>
        <Header isMobile={isMobile} onToggleSidebar={handleToggleSidebar} />
        <Content
          style={{
            margin: isMobile ? '8px 8px' : '20px 16px',
            padding: isMobile ? '12px' : '24px',
            background: '#fff',
            borderRadius: '8px',
            minHeight: 'calc(100vh - 100px)',
            overflow: 'auto',
            boxShadow: '0 6px 20px rgba(15, 23, 42, 0.06)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

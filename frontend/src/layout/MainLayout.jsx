import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'

const { Content } = Layout

/**
 * Layout principal de la aplicación
 * - Contiene el Sidebar y Header
 * - Las páginas se renderizan en el Outlet
 * - Responsive: sidebar colapsable en móvil
 */
export default function MainLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Header />
        <Content
          style={{
            margin: '24px 16px',
            padding: '24px',
            background: '#fff',
            borderRadius: '8px',
            minHeight: 'calc(100vh - 100px)',
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

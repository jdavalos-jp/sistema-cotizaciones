import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'

const { Content } = Layout
export default function MainLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Header />
        <Content
          style={{
            margin: '20px 16px',
            padding: '24px',
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

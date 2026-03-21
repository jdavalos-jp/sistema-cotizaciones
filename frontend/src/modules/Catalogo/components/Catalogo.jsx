import React, { useState } from 'react'
import { Tabs, Space, Typography } from 'antd'
import ListaProductos from './ListaProductos'
import ListaComponentes from './ListaComponentes'

export default function Catalogo() {
  const [activeTab, setActiveTab] = useState('productos')

  return (
    <div style={{ padding: '24px' }}>
      <Space orientation="vertical" size={24} style={{ width: '100%' }}>
        <div>
          <Typography.Title level={2} style={{ marginTop: 0, marginBottom: 8 }}>
            Catálogo
          </Typography.Title>
          <Typography.Text type="secondary">
            Gestiona tus productos y componentes
          </Typography.Text>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'productos',
              label: 'Productos',
              children: <ListaProductos />,
            },
            {
              key: 'componentes',
              label: 'Componentes',
              children: <ListaComponentes />,
            },
          ]}
        />
      </Space>
    </div>
  )
}

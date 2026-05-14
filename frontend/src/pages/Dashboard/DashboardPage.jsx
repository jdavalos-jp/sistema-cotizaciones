import { Card, Row, Col, Statistic, Table, Space, Button, Typography } from 'antd'
import {
  ShoppingOutlined,
  UserOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

/**
 * Página Dashboard
 * - Muestra estadísticas genera les del sistema
 * - Accesos rápidos a secciones principales
 * - Últimas cotizaciones
 */
export default function DashboardPage() {
  const navigate = useNavigate()

  // Datos simulados
  const stats = {
    productos: 156,
    componentes: 89,
    clientes: 42,
    cotizacionesActivas: 12,
  }

  // Últimas cotizaciones
  const ultimasCotizaciones = [
    {
      id: 1,
      numero: 'COT-001',
      cliente: 'Cliente A',
      fecha: '2024-03-21',
      estado: 'En proceso',
      total: 'Bs 5,000.00',
    },
    {
      id: 2,
      numero: 'COT-002',
      cliente: 'Cliente B',
      fecha: '2024-03-20',
      estado: 'Enviada',
      total: 'Bs 8,500.00',
    },
    {
      id: 3,
      numero: 'COT-003',
      cliente: 'Cliente C',
      fecha: '2024-03-19',
      estado: 'Aceptada',
      total: 'Bs 12,000.00',
    },
  ]

  const columns = [
    { title: 'Número', dataIndex: 'numero', key: 'numero' },
    { title: 'Cliente', dataIndex: 'cliente', key: 'cliente' },
    { title: 'Fecha', dataIndex: 'fecha', key: 'fecha' },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado) => {
        const colors = {
          'En proceso': 'blue',
          Enviada: 'orange',
          Aceptada: 'green',
          Rechazada: 'red',
        }
        return (
          <Typography.Text style={{ color: colors[estado] || '#999', fontWeight: 500 }}>
            {estado}
          </Typography.Text>
        )
      },
    },
    { title: 'Total', dataIndex: 'total', key: 'total', align: 'right' },
  ]

  return (
    <div>
      {/* Título */}
      <div style={{ marginBottom: 32 }}>
        <Typography.Title level={1} style={{ marginTop: 0, marginBottom: 8 }}>Dashboard</Typography.Title>
        <Typography.Text type="secondary" style={{ marginTop: 8 }}>
          Resumen general del sistema de cotizaciones
        </Typography.Text>
      </div>

      {/* Estadísticas */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Productos"
              value={stats.productos}
              prefix={<ShoppingOutlined />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Componentes"
              value={stats.componentes}
              prefix={<ThunderboltOutlined />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Clientes"
              value={stats.clientes}
              prefix={<UserOutlined />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Cotizaciones Activas"
              value={stats.cotizacionesActivas}
              prefix={<FileTextOutlined />}
              styles={{ content: { color: '#f5222d' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Accesos Rápidos */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24}>
          <Card title="Accesos Rápidos">
            <Space>
              <Button
                type="primary"
                onClick={() => navigate('/cotizaciones/nueva')}
              >
                Nueva Cotización
              </Button>
              <Button onClick={() => navigate('/productos')}>Agregar Producto</Button>
              <Button onClick={() => navigate('/clientes')}>Nuevo Cliente</Button>
              <Button onClick={() => navigate('/cotizaciones/historial')}>
                Ver Historial
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Últimas Cotizaciones */}
      <Card title="Últimas Cotizaciones">
        <Table
          columns={columns}
          dataSource={ultimasCotizaciones}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  )
}

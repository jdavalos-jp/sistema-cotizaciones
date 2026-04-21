import React from 'react'
import { Badge, Select, Space, Typography, Input, Card, Statistic, Row, Col } from 'antd'
import { SearchOutlined, FileTextOutlined, CheckOutlined, CheckCircleOutlined } from '@ant-design/icons'

function StatItem({ label, count, color, icon }) {
  return (
    <Card
      style={{
        borderLeft: `4px solid ${color}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        flex: 1,
        minWidth: 180,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 4px 12px ${color}33`
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
      bodyStyle={{ padding: 12 }}
    >
      <Row gutter={12} align="middle">
        <Col>
          <div
            style={{
              fontSize: 24,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </div>
        </Col>
        <Col flex="auto">
          <div>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {label}
            </Typography.Text>
            <div>
              <Typography.Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: color,
                }}
              >
                {count}
              </Typography.Text>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  )
}

function CotizacionesFiltros({ cotizaciones, filtro, setFiltro, busqueda, setBusqueda }) {
  const borradores = cotizaciones.filter(c => c.estado === 'borrador').length
  const enviadas = cotizaciones.filter(c => c.estado === 'enviada').length
  const aceptadas = cotizaciones.filter(c => c.estado === 'aceptada').length

  return (
    <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats mejorados */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatItem
            label="Borradores"
            count={borradores}
            color="#fa8c16"
            icon={<FileTextOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatItem
            label="Enviadas"
            count={enviadas}
            color="#1890ff"
            icon={<CheckOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatItem
            label="Aceptadas"
            count={aceptadas}
            color="#52c41a"
            icon={<CheckCircleOutlined />}
          />
        </Col>
      </Row>

      {/* Buscador y Filtro */}
      <div style={{ display: 'flex', gap: '16px', width: '100%', alignItems: 'center' }}>
        <Input
          placeholder="Buscar por número o nombre de cliente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ flex: 1 }}
          suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
          allowClear
        />

        <Select
          value={filtro}
          onChange={setFiltro}
          style={{ width: 200 }}
          options={[
            { label: 'Todas', value: 'todos' },
            { label: 'Borradores', value: 'borrador' },
            { label: 'Enviadas', value: 'enviada' },
            { label: 'Aceptadas', value: 'aceptada' },
            { label: 'Rechazadas', value: 'rechazada' },
          ]}
        />
      </div>
    </div>
  )
}

export default CotizacionesFiltros
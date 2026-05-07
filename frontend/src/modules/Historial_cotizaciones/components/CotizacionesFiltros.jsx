import React, { useMemo } from 'react'
import { Select, Typography, Input, Card, Row, Col } from 'antd'
import {
  SearchOutlined,
  FileTextOutlined,
  CheckOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'

function StatItem({ label, count, color, icon }) {
  return (
    <Card
      variant="borderless"
      className="cotizacion-stat-card"
      style={{
        borderLeft: `4px solid ${color}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        flex: 1,
        minWidth: 180,
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.boxShadow = `0 4px 12px ${color}33`
        event.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
        event.currentTarget.style.transform = 'translateY(0)'
      }}
      styles={{
        body: {
          padding: 16,
        },
      }}
    >
      <Row gutter={12} align="middle" wrap={false}>
        <Col>
          <div
            style={{
              fontSize: 24,
              color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </div>
        </Col>

        <Col flex="auto">
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {label}
          </Typography.Text>

          <div>
            <Typography.Text
              strong
              style={{
                fontSize: 20,
                color,
              }}
            >
              {count}
            </Typography.Text>
          </div>
        </Col>
      </Row>
    </Card>
  )
}

function CotizacionesFiltros({
  cotizaciones = [],
  filtro,
  setFiltro,
  busqueda,
  setBusqueda,
}) {
  const estadisticas = useMemo(() => {
    return {
      borradores: cotizaciones.filter((item) => item.estado === 'borrador').length,
      enviadas: cotizaciones.filter((item) => item.estado === 'enviada').length,
      aceptadas: cotizaciones.filter((item) => item.estado === 'aceptada').length,
    }
  }, [cotizaciones])

  const opcionesFiltro = useMemo(() => {
    return [
      { label: 'Todas', value: 'todos' },
      { label: 'Borradores', value: 'borrador' },
      { label: 'Enviadas', value: 'enviada' },
      { label: 'Aceptadas', value: 'aceptada' },
      { label: 'Rechazadas', value: 'rechazada' },
    ]
  }, [])

  return (
    <div
      style={{
        marginBottom: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatItem
            label="Borradores"
            count={estadisticas.borradores}
            color="#fa8c16"
            icon={<FileTextOutlined />}
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <StatItem
            label="Enviadas"
            count={estadisticas.enviadas}
            color="#1890ff"
            icon={<CheckOutlined />}
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <StatItem
            label="Aceptadas"
            count={estadisticas.aceptadas}
            color="#52c41a"
            icon={<CheckCircleOutlined />}
          />
        </Col>
      </Row>

      <div
        style={{
          display: 'flex',
          gap: 16,
          width: '100%',
          alignItems: 'center',
        }}
      >
        <Input
          placeholder="Buscar por número o nombre de cliente..."
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          style={{ flex: 1 }}
          suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
          allowClear
        />

        <Select
          value={filtro}
          onChange={setFiltro}
          style={{ width: 200 }}
          options={opcionesFiltro}
        />
      </div>
    </div>
  )
}

export default CotizacionesFiltros
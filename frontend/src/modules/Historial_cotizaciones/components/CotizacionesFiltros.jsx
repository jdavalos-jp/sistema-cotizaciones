import React, { useMemo } from 'react'
import { Select, Typography, Input, Row, Col } from 'antd'
import {
  SearchOutlined,
  FileTextOutlined,
  CheckOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'

function StatItem({ label, count, tone, icon }) {
  return (
    <div className={`cotizacion-stat cotizacion-stat--${tone}`}>
      <span className="cotizacion-stat__icon">{icon}</span>
      <div>
        <Typography.Text className="cotizacion-stat__label">
          {label}
        </Typography.Text>
        <div className="cotizacion-stat__count">{count}</div>
      </div>
    </div>
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
    <div className="cotizaciones-toolbar">
      <Row gutter={[12, 12]} className="cotizaciones-stats">
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatItem
            label="Borradores"
            count={estadisticas.borradores}
            tone="draft"
            icon={<FileTextOutlined />}
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <StatItem
            label="Enviadas"
            count={estadisticas.enviadas}
            tone="sent"
            icon={<CheckOutlined />}
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <StatItem
            label="Aceptadas"
            count={estadisticas.aceptadas}
            tone="accepted"
            icon={<CheckCircleOutlined />}
          />
        </Col>
      </Row>

      <div className="cotizaciones-filters">
        <Input
          placeholder="Buscar por numero o cliente"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          className="cotizaciones-search"
          prefix={<SearchOutlined />}
          allowClear
        />

        <Select
          value={filtro}
          onChange={setFiltro}
          className="cotizaciones-select"
          options={opcionesFiltro}
        />
      </div>
    </div>
  )
}

export default CotizacionesFiltros

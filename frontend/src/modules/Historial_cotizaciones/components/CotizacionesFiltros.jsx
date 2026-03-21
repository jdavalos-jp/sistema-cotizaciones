import React from 'react'
import { Badge, Select, Space, Typography } from 'antd'

function StatItem({ label, count, color, bg }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        borderRadius: 20,
        background: bg,
        border: `1px solid ${color}`,
        fontWeight: 500,
      }}
    >
      <Badge
        count={count}
        showZero
        style={{
          backgroundColor: color,
        }}
      />
      <Typography.Text style={{ color }}>
        {label}
      </Typography.Text>
    </div>
  )
}

function CotizacionesFiltros({ cotizaciones, filtro, setFiltro }) {
  const borradores = cotizaciones.filter(c => c.estado === 'borrador').length
  const enviadas = cotizaciones.filter(c => c.estado === 'enviada').length
  const aceptadas = cotizaciones.filter(c => c.estado === 'aceptada').length

  return (
    <Space
      style={{
        width: '100%',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexWrap: 'wrap',
      }}
    >
      {/* 🔥 Stats mejoradas */}
      <Space wrap>
        <StatItem
          label="Borradores"
          count={borradores}
          color="#fa8c16"
          bg="#fff7e6"
        />

        <StatItem
          label="Enviadas"
          count={enviadas}
          color="#1890ff"
          bg="#e6f7ff"
        />

        <StatItem
          label="Aceptadas"
          count={aceptadas}
          color="#52c41a"
          bg="#f6ffed"
        />
      </Space>

      {/* 🔽 Filtro */}
      <Select
        value={filtro}
        onChange={setFiltro}
        style={{
          width: 200,
          borderRadius: 8,
        }}
        options={[
          { label: 'Todas', value: 'todos' },
          { label: 'Borradores', value: 'borrador' },
          { label: 'Enviadas', value: 'enviada' },
          { label: 'Aceptadas', value: 'aceptada' },
          { label: 'Rechazadas', value: 'rechazada' },
        ]}
      />
    </Space>
  )
}

export default CotizacionesFiltros
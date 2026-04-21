import React from 'react'
import { Typography } from 'antd'

function CotizacionesHeader() {
  return (
    <div style={{ marginBottom: 24 }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        Historial de Cotizaciones
      </Typography.Title>
      <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
        Inicio / Historial de Cotizaciones
      </Typography.Text>
    </div>
  )
}

export default CotizacionesHeader
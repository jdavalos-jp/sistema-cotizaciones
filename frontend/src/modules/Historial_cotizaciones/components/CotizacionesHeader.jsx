import React from 'react'
import { Typography } from 'antd'

function CotizacionesHeader() {
  return (
    <div style={{ marginBottom: 16 }}>
      <Typography.Title level={3}>
        Historial de Cotizaciones
      </Typography.Title>
      <Typography.Text type="secondary">
        Gestiona todas tus cotizaciones
      </Typography.Text>
    </div>
  )
}

export default CotizacionesHeader
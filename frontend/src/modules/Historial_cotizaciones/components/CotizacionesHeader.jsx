import React from 'react'
import { Typography } from 'antd'

function CotizacionesHeader() {
  return (
    <header className="cotizaciones-header">
      <div>
        <Typography.Text className="cotizaciones-eyebrow">
          Cotizaciones
        </Typography.Text>
        <Typography.Title level={2} className="cotizaciones-title">
          Historial
        </Typography.Title>
      </div>

      <Typography.Text className="cotizaciones-subtitle">
        Consulta, edita y da seguimiento a tus cotizaciones.
      </Typography.Text>
    </header>
  )
}

export default CotizacionesHeader

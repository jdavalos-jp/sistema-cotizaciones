import { Button, Typography } from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

function CotizacionesHeader({ loading = false, onRefresh }) {
  const navigate = useNavigate()

  return (
    <header className="cotizaciones-header">
      <div>
        <Typography.Title level={3} className="cotizaciones-title">
          Historial de cotizaciones
        </Typography.Title>
        <Typography.Text className="cotizaciones-subtitle">
          Seguimiento operativo de borradores, envios y decisiones comerciales.
        </Typography.Text>
      </div>

      <div className="cotizaciones-header__actions">
        <Button icon={<ReloadOutlined />} loading={loading} onClick={onRefresh} />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/cotizaciones/nueva')}>
          Nueva cotizacion
        </Button>
      </div>
    </header>
  )
}

export default CotizacionesHeader

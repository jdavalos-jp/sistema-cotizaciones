import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'

export default function AccessDeniedPage() {
  const navigate = useNavigate()

  return (
    <Result
      status="403"
      title="Acceso denegado"
      subTitle="Tu rol no tiene permisos para acceder a este módulo."
      extra={
        <Button type="primary" onClick={() => navigate('/dashboard', { replace: true })}>
          Volver al dashboard
        </Button>
      }
    />
  )
}

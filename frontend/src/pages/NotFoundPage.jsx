import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'

/**
 * Página 404
 * - Se muestra cuando la ruta no existe
 */
export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <Result
      status="404"
      title="404"
      subTitle="Lo siento, la página que buscas no existe."
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          Volver al Inicio
        </Button>
      }
    />
  )
}

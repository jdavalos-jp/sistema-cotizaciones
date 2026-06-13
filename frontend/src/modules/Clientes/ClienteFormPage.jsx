import { useNavigate, useParams } from 'react-router-dom'
import ClienteForm from '../../modules/Clientes/components/ClienteForm'

export default function ClienteFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const handleSuccess = () => {
    navigate('/clientes')
  }

  const handleCancel = () => {
    navigate('/clientes')
  }

  return (
    <ClienteForm
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      idClienteEdit={id || null}
    />
  )
}

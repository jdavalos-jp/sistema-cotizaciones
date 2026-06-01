import { useNavigate, useParams } from 'react-router-dom'
import ClienteForm from '../../modules/Clientes/components/ClienteForm'

/**
 * Página Formulario de Cliente
 * - Permite crear nuevos clientes (/clientes/crear)
 * - Permite editar clientes existentes (/clientes/editar/:id)
 * - Wrapper para ClienteForm
 */
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

import { useNavigate, useParams } from 'react-router-dom'
import ComponenteForm from '../../modules/Componentes/components/ComponenteForm'

/**
 * Página Formulario de Componente
 * - Permite crear nuevos componentes
 * - Permite editar componentes existentes
 * - Wrapper para ComponenteForm
 */
export default function ComponenteFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  // Convertir id a número si existe
  const idComponenteEdit = id ? Number(id) : null

  const handleSuccess = () => {
    navigate('/componentes')
  }

  const handleCancel = () => {
    navigate('/componentes')
  }

  return (
    <ComponenteForm
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      idComponenteEdit={idComponenteEdit}
    />
  )
}

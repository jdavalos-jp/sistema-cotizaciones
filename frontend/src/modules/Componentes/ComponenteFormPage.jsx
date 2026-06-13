import { useNavigate, useParams } from 'react-router-dom'
import ComponenteForm from '../../modules/Componentes/components/ComponenteForm'

export default function ComponenteFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()

 
  const idComponenteEdit = id || null

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

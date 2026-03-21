import { useNavigate } from 'react-router-dom'
import ProductoForm from '../../modules/Producto/components/ProductoForm'

/**
 * Página Formulario de Producto
 * - Permite crear nuevos productos
 * - Wrapper para ProductoForm
 */
export default function ProductoFormPage() {
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate('/productos')
  }

  const handleCancel = () => {
    navigate('/productos')
  }

  return <ProductoForm onSuccess={handleSuccess} onCancel={handleCancel} />
}

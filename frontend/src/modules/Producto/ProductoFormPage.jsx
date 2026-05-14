import { useNavigate, useParams } from 'react-router-dom'
import ProductoForm from '../../modules/Producto/components/ProductoForm'

/**
 * Página Formulario de Producto
 * - Permite crear y editar productos
 * - Wrapper para ProductoForm
 */
export default function ProductoFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const handleSuccess = () => {
    navigate('/productos')
  }

  const handleCancel = () => {
    navigate('/productos')
  }

  return <ProductoForm onSuccess={handleSuccess} onCancel={handleCancel} idProductoEdit={id ? Number(id) : null} />
}

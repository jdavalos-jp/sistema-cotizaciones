import { useParams } from 'react-router-dom'
import CategoriasListPage from '../../modules/Categorias/components/CategoriasListPage'
import CategoriaFormPage from '../../modules/Categorias/components/CategoriaFormPage'

/**
 * Página Wrapper - Categorías
 * Maneja la lógica de ruteo entre lista y formulario
 */
export default function CategoriasPage({ mode = 'lista' }) {
  const { id } = useParams()

  if (mode === 'crear') {
    return <CategoriaFormPage />
  }

  if (mode === 'editar' && id) {
    return <CategoriaFormPage idCategoriaEdit={parseInt(id)} />
  }

  return <CategoriasListPage />
}

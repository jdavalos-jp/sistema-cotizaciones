import { useParams } from 'react-router-dom'
import CategoriasListPage from './components/listaCategorias/CategoriasListPage'
import CategoriaFormPage from './components/crearCategorias/CategoriaFormPage'
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

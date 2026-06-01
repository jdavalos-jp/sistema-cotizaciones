import CategoriasListPage from './components/listaCategorias/CategoriasListPage'
import CategoriaFormPage from './components/crearCategorias/CategoriaFormPage'
import { useParams } from 'react-router-dom'

export default function CategoriasPage({ mode = 'lista' }) {
  const { id } = useParams()
  const idCategoria = Number(id)

  if (mode === 'crear') {
    return <CategoriaFormPage />
  }

  if (mode === 'editar' && Number.isInteger(idCategoria) && idCategoria > 0) {
    return <CategoriaFormPage idCategoriaEdit={idCategoria} />
  }

  return <CategoriasListPage />
}

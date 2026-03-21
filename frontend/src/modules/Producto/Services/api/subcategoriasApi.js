import axios from 'axios';

export async function getSubcategorias(idCategoria) {
  const { data } = await axios.get('/api/subcategorias', {
    params: idCategoria ? { idCategoria } : {},
  });
  return data;
}
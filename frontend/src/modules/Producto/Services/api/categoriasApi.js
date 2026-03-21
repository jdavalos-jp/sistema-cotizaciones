import axios from 'axios';

export async function getCategorias() {
  const { data } = await axios.get('/api/categorias');
  return data;
}

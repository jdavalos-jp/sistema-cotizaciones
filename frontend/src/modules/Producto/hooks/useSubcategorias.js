import { useEffect, useState } from 'react';
import { getSubcategorias } from '../Services/api/subcategoriasApi';

export function useSubcategorias(idCategoria) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idCategoria) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const fetchSubcategorias = async () => {
      try {
        const res = await getSubcategorias(idCategoria);
        setData(Array.isArray(res.data) ? res.data : res.data?.data || []);
      } catch (error) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSubcategorias();
  }, [idCategoria]);

  return { data, loading };
}
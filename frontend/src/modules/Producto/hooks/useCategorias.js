import { useEffect, useState } from 'react'
import { getCategorias } from '../Services/api/categoriasApi'

export function useCategorias() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await getCategorias()

        // 🔥 IMPORTANTE: adapta según tu backend
        setData(Array.isArray(res.data) ? res.data : res.data?.data || [])
      } catch (error) {
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategorias()
  }, [])

  return { data, loading }
}
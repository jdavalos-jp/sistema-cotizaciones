import { useEffect, useMemo, useState } from 'react'
import { message } from 'antd'

import { previewCotizacion } from '../services/api/cotizacionesApi'
import { useDebouncedValue } from './useDebouncedValue'

export function useCotizacionPreview({ idCliente, moneda, cart }) {
  const debouncedCart = useDebouncedValue(cart, 0)

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function run() {
      if (!debouncedCart || debouncedCart.length === 0) {
        setData(null)
        return
      }

      const productos = debouncedCart
        .filter((x) => x.tipo === 'producto')
        .map((x) => ({ idProducto: String(x.id), cantidad: x.cantidad }))

      const componentes = debouncedCart
        .filter((x) => x.tipo === 'componente')
        .map((x) => ({ idComponente: String(x.id), cantidad: x.cantidad }))

      setLoading(true)
      try {
        const preview = await previewCotizacion(
          { idCliente: idCliente ? String(idCliente) : null, moneda, productos, componentes },
          { signal: controller.signal },
        )
        setData(preview.data)
      } catch (err) {
        if (controller.signal.aborted) return
        message.error(String(err?.message || err))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    run()
    return () => controller.abort()
  }, [idCliente, moneda, debouncedCart])

  return useMemo(() => ({ loading, data }), [loading, data])
}

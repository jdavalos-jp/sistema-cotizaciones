import { useEffect, useMemo, useRef, useState } from 'react'
import { message } from 'antd'

import { previewCotizacion } from '../services/api/cotizacionesApi'
import { useDebouncedValue } from './useDebouncedValue'

export function useCotizacionPreview({ idCliente, moneda, cart, removeItem }) {
  const debouncedCart = useDebouncedValue(cart, 0)

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)

  // Track which IDs we've already warned about so we don't spam
  const warnedRef = useRef(new Set())

  useEffect(() => {
    const controller = new AbortController()

    async function run() {
      if (!debouncedCart || debouncedCart.length === 0) {
        setData(null)
        return
      }

      const productos = debouncedCart
        .filter((x) => x.tipo === 'producto')
        .map((x) => ({
          idProducto: String(x.id),
          cantidad: x.cantidad,
          ...(x.precioUnitario !== undefined && { precioUnitario: x.precioUnitario }),
        }))

      const componentes = debouncedCart
        .filter((x) => x.tipo === 'componente')
        .map((x) => ({
          idComponente: String(x.id),
          cantidad: x.cantidad,
          ...(x.precioUnitario !== undefined && { precioUnitario: x.precioUnitario }),
        }))

      setLoading(true)
      try {
        const preview = await previewCotizacion(
          { idCliente: idCliente ? String(idCliente) : null, moneda, productos, componentes },
          { signal: controller.signal },
        )
        setData(preview.data)

        // Auto-remove deleted items from cart
        if (preview.data?.removedIds?.length && removeItem) {
          for (const removed of preview.data.removedIds) {
            removeItem(removed.tipo, String(removed.id))
          }
        }

        // Show warnings (only once per item)
        if (preview.data?.warnings?.length) {
          for (const w of preview.data.warnings) {
            if (!warnedRef.current.has(w)) {
              warnedRef.current.add(w)
              message.warning(w, 5)
            }
          }
        }
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


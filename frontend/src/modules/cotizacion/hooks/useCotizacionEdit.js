import { useEffect, useState, useCallback } from 'react'
import { message } from 'antd'
import { getCotizacion, updateCotizacion } from '../services/api/cotizacionesApi'
import { useCatalogSearch } from './useCatalogSearch'
import { useCotizacionCart } from './useCotizacionCart'
import { useClientesSearch } from './useClientesSearch'
import { fetchProductos, fetchComponentes } from '../services/api/catalogoApi'

/**
 * Hook para manejar la edición de cotizaciones existentes.
 * - Carrito sin localStorage (persistent: false) para no interferir con CotizacionNueva.
 * - Restauración atómica vía setItems (una sola mutación de estado).
 */
export function useCotizacionEdit(idCotizacion) {
  const [cotizacion, setCotizacion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Hooks de catálogo
  const productos = useCatalogSearch(fetchProductos)
  const componentes = useCatalogSearch(fetchComponentes)
  const clientes = useClientesSearch()

  // Carrito SIN localStorage — datos vienen del backend, no de sesión previa
  const cart = useCotizacionCart({ persistent: false })

  // Efecto: cargar cotización + restaurar carrito de forma atómica
  useEffect(() => {
    if (!idCotizacion) return

    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)
      cart.clear()

      try {
        const response = await getCotizacion(idCotizacion, { signal: controller.signal })
        if (controller.signal.aborted) return

        // La respuesta tiene estructura { ok: true, data: cotizacion }
        const data = response.data

        // Construir todos los items con precio incluido
        const productosArray = data.productos ?? []
        const componentesArray = data.componentes ?? []

        console.log(
          `[useCotizacionEdit] Cotización ${idCotizacion} cargada:`,
          { productos: productosArray.length, componentes: componentesArray.length }
        )

        const items = [
          ...productosArray.map((p) => {
            // Verificar que tienen los campos necesarios
            if (!p.idProducto || !p.nombreItem) {
              console.warn('[useCotizacionEdit] Producto sin idProducto o nombreItem:', p)
            }
            return {
              tipo: 'producto',
              id: String(p.idProducto),
              nombre: p.nombreItem || 'Producto sin nombre',
              descripcion: p.descripcionItem || '',
              observaciones: p.observaciones || '',
              cantidad: Number(p.cantidad) || 1,
              precioUnitario: Number(p.precioUnitario) || 0,
            }
          }),
          ...componentesArray.map((c) => {
            // Verificar que tienen los campos necesarios
            if (!c.idComponente || !c.nombreItem) {
              console.warn('[useCotizacionEdit] Componente sin idComponente o nombreItem:', c)
            }
            return {
              tipo: 'componente',
              id: String(c.idComponente),
              nombre: c.nombreItem || 'Componente sin nombre',
              descripcion: c.descripcionItem || '',
              observaciones: c.observaciones || '',
              cantidad: Number(c.cantidad) || 1,
              precioUnitario: Number(c.precioUnitario) || 0,
            }
          }),
        ]

        console.log('[useCotizacionEdit] Items mapeados:', items.length)

        // Una sola mutación atómica — no hay race conditions
        console.log('[useCotizacionEdit] Antes de setItems. Items:', JSON.stringify(items, null, 2))
        cart.setItems(items)
        console.log('[useCotizacionEdit] Después de setItems. Cart.cart:', cart.cart.length)

        setCotizacion(data)

        // Cargar catálogos para poder agregar más productos
        productos.setSearch('')
        componentes.setSearch('')
      } catch (err) {
        if (controller.signal.aborted) return
        const msg = String(err?.message || err)
        console.error('[useCotizacionEdit] Error cargando cotización:', msg)
        setError(msg)
        message.error(msg)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    load()
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idCotizacion])

  // Guardar cambios
  const handleSave = useCallback(
    async (payload) => {
      if (!idCotizacion) return

      setSaving(true)
      try {
        const response = await updateCotizacion(idCotizacion, {
          productos: payload.productos.map(x => ({
            ...x,
            observaciones: x.observaciones
          })),
          componentes: payload.componentes.map(x => ({
            ...x,
            observaciones: x.observaciones
          })),
          moneda: payload.moneda,
          observaciones: payload.observaciones,
          descuento: payload.descuento,
          impuestos: payload.impuestos,
          diasValidez: payload.diasValidez,
          diasEntrega: payload.diasEntrega,
        })

        // La respuesta tiene estructura { ok: true, data: cotizacion }
        const updated = response.data
        setCotizacion(updated)
        message.success('Cotización actualizada exitosamente')
        return updated
      } catch (err) {
        const msg = String(err?.message || err)
        message.error(msg)
        throw err
      } finally {
        setSaving(false)
      }
    },
    [idCotizacion]
  )

  return {
    cotizacion,
    loading,
    saving,
    error,
    productos,
    componentes,
    clientes,
    cart,
    handleSave,
  }
}

import { useEffect, useState, useCallback, useRef } from 'react'
import { message } from 'antd'
import { getCotizacion, updateCotizacion } from '../services/api/cotizacionesApi'
import { useCatalogSearch } from './useCatalogSearch'
import { useCotizacionCart } from './useCotizacionCart'
import { fetchProductos, fetchComponentes } from '../services/api/catalogoApi'

/**
 * Hook para manejar la edición de cotizaciones existentes
 * Carga datos de la cotización y permite modificar productos/componentes/precios
 */
export function useCotizacionEdit(idCotizacion) {
  const [cotizacion, setCotizacion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [carritoCargado, setCarritoCargado] = useState(false)
  const cotizacionDataRef = useRef(null)

  // Reutilizar hooks existentes para búsqueda de catálogos
  const productos = useCatalogSearch(fetchProductos)
  const componentes = useCatalogSearch(fetchComponentes)
  const cart = useCotizacionCart()

  // Efecto 1: Cargar datos de la cotización
  useEffect(() => {
    if (!idCotizacion) return

    const controller = new AbortController()

    const loadCotizacion = async () => {
      setLoading(true)
      setError(null)
      setCarritoCargado(false)
      
      // IMPORTANTE: Limpiar carrito cuando se carga una nueva cotización
      cart.clear()
      
      try {
        const data = await getCotizacion(idCotizacion, { signal: controller.signal })
        setCotizacion(data)
        cotizacionDataRef.current = data

        // Trigger búsquedas vacías para cargar todos los catálogos
        productos.setSearch('')
        componentes.setSearch('')
      } catch (err) {
        // Ignorar errores de abort
        if (controller.signal.aborted) return
        
        const errorMsg = String(err?.message || err)
        setError(errorMsg)
        message.error(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    loadCotizacion()
    
    // Cleanup: cancelar petición si el componente se desmonta o cambia idCotizacion
    return () => controller.abort()
  }, [idCotizacion])

  // Efecto 2: Restaurar carrito DESPUÉS de que cotizacion esté cargada
  useEffect(() => {
    if (!cotizacion || carritoCargado) return

    try {
      // Limpiar primero para evitar duplicados
      cart.clear()

      // Restaurar productos
      if (cotizacion.productos && cotizacion.productos.length > 0) {
        cotizacion.productos.forEach((p) => {
          cart.addItem({
            tipo: 'producto',
            id: p.idProducto,
            nombre: p.nombreItem,
            cantidad: p.cantidad,
          })
        })
      }

      // Restaurar componentes
      if (cotizacion.componentes && cotizacion.componentes.length > 0) {
        cotizacion.componentes.forEach((c) => {
          cart.addItem({
            tipo: 'componente',
            id: c.idComponente,
            nombre: c.nombreItem,
            cantidad: c.cantidad,
          })
        })
      }

      setCarritoCargado(true)
    } catch (err) {
      console.error('Error restaurando carrito:', err)
      setCarritoCargado(true)
    }
  }, [cotizacion, carritoCargado])

  // Efecto 3: Actualizar precios unitarios una vez que los items estén en el carrito
  useEffect(() => {
    if (!cotizacion || !carritoCargado || !cart.cart || cart.cart.length === 0) return

    try {
      // Actualizar precios de productos
      if (cotizacion.productos && cotizacion.productos.length > 0) {
        cotizacion.productos.forEach((p) => {
          cart.setPrecioUnitario('producto', String(p.idProducto), p.precioUnitario)
        })
      }

      // Actualizar precios de componentes
      if (cotizacion.componentes && cotizacion.componentes.length > 0) {
        cotizacion.componentes.forEach((c) => {
          cart.setPrecioUnitario('componente', String(c.idComponente), c.precioUnitario)
        })
      }
    } catch (err) {
      console.error('Error actualizando precios:', err)
    }
  }, [cotizacion, carritoCargado])

  // Guardar cambios
  const handleSave = useCallback(
    async (payload) => {
      if (!idCotizacion) return

      setSaving(true)
      try {
        const updated = await updateCotizacion(idCotizacion, {
          productos: payload.productos,
          componentes: payload.componentes,
          moneda: payload.moneda,
          observaciones: payload.observaciones,
          descuento: payload.descuento,
          impuestos: payload.impuestos,
          diasValidez: payload.diasValidez,
          diasEntrega: payload.diasEntrega,
        })

        setCotizacion(updated)
        message.success('Cotización actualizada exitosamente')
        return updated
      } catch (err) {
        const errorMsg = String(err?.message || err)
        message.error(errorMsg)
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
    cart,
    handleSave,
  }
}

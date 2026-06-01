import { useCallback, useMemo, useState, useEffect, useRef } from 'react'

const STORAGE_KEY = 'cotizacion_cart'

function keyOf(item) {
  return `${item.tipo}:${item.id}`
}

function normalizeItem(item) {
  if (!item || !['producto', 'componente'].includes(item.tipo) || item.id === undefined || item.id === null) {
    return null
  }

  return {
    id: String(item.id),
    tipo: item.tipo,
    cantidad: Math.max(1, Number(item.cantidad) || 1),
    nombre: item.nombre,
    descripcion: item.descripcion,
    observaciones: item.observaciones,
    precioUnitario: item.precioUnitario === undefined ? undefined : Math.max(0, Number(item.precioUnitario) || 0),
  }
}

export function useCotizacionCart({ persistent = false } = {}) {
  const [cart, setCart] = useState([])
  const isMountedRef = useRef(true)

  // ✅ CARGAR DESDE STORAGE - Solo si persistent=true
  useEffect(() => {
    if (!persistent) return

    let savedCart = []
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved && isMountedRef.current) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          savedCart = parsed.map(normalizeItem).filter(Boolean)
        }
      }
    } catch {
      savedCart = []
    }

    // Solo actualizar si hay datos guardados
    if (savedCart.length > 0 && isMountedRef.current) {
      setCart(savedCart)
    }

    // ✅ Cleanup
    return () => {
      isMountedRef.current = false
    }
  }, [persistent])

  // ✅ GUARDAR A STORAGE - Solo si persistent=true
  useEffect(() => {
    if (!persistent) return

    try {
      if (cart.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // El navegador puede bloquear storage; el carrito sigue funcionando en memoria.
    }
  }, [cart, persistent])

  // ✅ REST DEL CÓDIGO...
  const selectedKeys = useMemo(() => cart.map((x) => keyOf(x)), [cart])

  const setCantidad = useCallback((tipo, id, cantidad) => {
    const safe = Math.max(1, Number(cantidad) || 1)
    setCart((prev) =>
      prev.map((x) => 
        x.tipo === tipo && String(x.id) === String(id) 
          ? { ...x, cantidad: safe } 
          : x
      ),
    )
  }, [])

  const setPrecioUnitario = useCallback((tipo, id, precio) => {
    const safe = Math.max(0, Number(precio) || 0)
    setCart((prev) =>
      prev.map((x) => 
        x.tipo === tipo && String(x.id) === String(id) 
          ? { ...x, precioUnitario: safe } 
          : x
      ),
    )
  }, [])

  const setNombre = useCallback((tipo, id, nombre) => {
    setCart((prev) =>
      prev.map((x) => 
        x.tipo === tipo && String(x.id) === String(id) 
          ? { ...x, nombre } 
          : x
      ),
    )
  }, [])

  const setDescripcion = useCallback((tipo, id, descripcion) => {
    setCart((prev) =>
      prev.map((x) => 
        x.tipo === tipo && String(x.id) === String(id) 
          ? { ...x, descripcion } 
          : x
      ),
    )
  }, [])

  const setObservaciones = useCallback((tipo, id, observaciones) => {
    setCart((prev) =>
      prev.map((x) => 
        x.tipo === tipo && String(x.id) === String(id) 
          ? { ...x, observaciones } 
          : x
      ),
    )
  }, [])

  const addItem = useCallback((item) => {
    setCart((prev) => {
      const exists = prev.some((x) => x.tipo === item.tipo && String(x.id) === String(item.id))
      if (exists) return prev
      return [
        ...prev,
        {
          id: item.id,
          tipo: item.tipo,
          cantidad: item.cantidad ?? 1,
          nombre: item.nombre,
          descripcion: item.descripcion,
          observaciones: item.observaciones,
          precioUnitario: item.precioUnitario,
        },
      ]
    })
  }, [])

  const removeItem = useCallback((tipo, id) => {
    setCart((prev) => prev.filter((x) => !(x.tipo === tipo && String(x.id) === String(id))))
  }, [])

  const clear = useCallback(() => setCart([]), [])

  // Reemplaza todo el carrito de forma atómica (una sola mutación de estado)
  const setItems = useCallback((items) => {
    setCart(
      items.map(normalizeItem).filter(Boolean)
    )
  }, [])

  const setSelectionFromList = useCallback((tipo, selectedIds, list) => {
    const selectedSet = new Set(selectedIds.map(String))

    setCart((prev) => {
      const kept = prev.filter((x) => x.tipo !== tipo || selectedSet.has(String(x.id)))
      const existingIds = new Set(kept.filter((x) => x.tipo === tipo).map((x) => String(x.id)))

      const toAdd = list
        .filter((x) => selectedSet.has(String(x.id)) && !existingIds.has(String(x.id)))
        .map((x) => ({ id: String(x.id), tipo, cantidad: 1 }))

      return [...kept, ...toAdd]
    })
  }, [])

  return {
    cart,
    selectedKeys,
    addItem,
    removeItem,
    setCantidad,
    setPrecioUnitario,
    setNombre,
    setDescripcion,
    setObservaciones,
    setSelectionFromList,
    clear,
    setItems,
  }
}

import { useCallback, useMemo, useState } from 'react'

function keyOf(item) {
  return `${item.tipo}:${item.id}`
}

export function useCotizacionCart() {
  const [cart, setCart] = useState([])

  const selectedKeys = useMemo(() => cart.map((x) => keyOf(x)), [cart])

  const setCantidad = useCallback((tipo, id, cantidad) => {
    const safe = Math.max(1, Number(cantidad) || 1)
    setCart((prev) =>
      prev.map((x) => (x.tipo === tipo && String(x.id) === String(id) ? { ...x, cantidad: safe } : x)),
    )
  }, [])

  const setPrecioUnitario = useCallback((tipo, id, precio) => {
    const safe = Math.max(0, Number(precio) || 0)
    setCart((prev) =>
      prev.map((x) => (x.tipo === tipo && String(x.id) === String(id) ? { ...x, precioUnitario: safe } : x)),
    )
  }, [])

  const setNombre = useCallback((tipo, id, nombre) => {
    setCart((prev) =>
      prev.map((x) => (x.tipo === tipo && String(x.id) === String(id) ? { ...x, nombre } : x)),
    )
  }, [])

  const setDescripcion = useCallback((tipo, id, descripcion) => {
    setCart((prev) =>
      prev.map((x) => (x.tipo === tipo && String(x.id) === String(id) ? { ...x, descripcion } : x)),
    )
  }, [])

  const addItem = useCallback((item) => {
    setCart((prev) => {
      const exists = prev.some((x) => x.tipo === item.tipo && String(x.id) === String(item.id))
      if (exists) return prev
      return [...prev, { 
        id: item.id, 
        tipo: item.tipo, 
        cantidad: item.cantidad ?? 1,
        nombre: item.nombre,
        descripcion: item.descripcion,
        precioUnitario: item.precioUnitario,
      }]
    })
  }, [])

  const removeItem = useCallback((tipo, id) => {
    setCart((prev) => prev.filter((x) => !(x.tipo === tipo && String(x.id) === String(id))))
  }, [])

  const clear = useCallback(() => setCart([]), [])

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
    setSelectionFromList,
    clear,
  }
}

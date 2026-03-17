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
      prev.map((x) => (x.tipo === tipo && x.id === id ? { ...x, cantidad: safe } : x)),
    )
  }, [])

  const addItem = useCallback((item) => {
    setCart((prev) => {
      const exists = prev.some((x) => x.tipo === item.tipo && x.id === item.id)
      if (exists) return prev
      return [...prev, { ...item, cantidad: item.cantidad ?? 1 }]
    })
  }, [])

  const removeItem = useCallback((tipo, id) => {
    setCart((prev) => prev.filter((x) => !(x.tipo === tipo && x.id === id)))
  }, [])

  const clear = useCallback(() => setCart([]), [])

  const setSelectionFromList = useCallback((tipo, selectedIds, list) => {
    const selectedSet = new Set(selectedIds)

    setCart((prev) => {
      const kept = prev.filter((x) => x.tipo !== tipo || selectedSet.has(String(x.id)))
      const existingIds = new Set(kept.filter((x) => x.tipo === tipo).map((x) => String(x.id)))

      const toAdd = list
        .filter((x) => selectedSet.has(String(x.id)) && !existingIds.has(String(x.id)))
        .map((x) => ({ ...x, tipo, cantidad: 1 }))

      return [...kept, ...toAdd]
    })
  }, [])

  return {
    cart,
    selectedKeys,
    addItem,
    removeItem,
    setCantidad,
    setSelectionFromList,
    clear,
  }
}

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'tecnoequip.rotulos'

function loadRotulos() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

function createId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function useRotulos() {
  const [rotulos, setRotulos] = useState(loadRotulos)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rotulos))
    } catch {
      // The in-memory history remains usable if browser storage is unavailable.
    }
  }, [rotulos])

  const saveRotulo = useCallback((values, editingId = null) => {
    const now = new Date().toISOString()

    setRotulos((current) => {
      if (editingId) {
        const existing = current.find((rotulo) => rotulo.id === editingId)
        const updated = { ...existing, ...values, id: editingId, updatedAt: now }
        return current.map((rotulo) => (rotulo.id === editingId ? updated : rotulo))
      }

      const created = { ...values, id: createId(), createdAt: now, updatedAt: now }
      return [created, ...current]
    })
  }, [])

  const deleteRotulo = useCallback((id) => {
    setRotulos((current) => current.filter((rotulo) => rotulo.id !== id))
  }, [])

  return { rotulos, saveRotulo, deleteRotulo }
}

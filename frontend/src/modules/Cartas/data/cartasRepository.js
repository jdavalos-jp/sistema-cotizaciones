import { normalizeCarta } from '../domain/carta.js'

const STORAGE_KEY = 'jdb-lab-cartas-v1'

function readAll() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(stored) ? stored.map(normalizeCarta) : []
  } catch {
    return []
  }
}

function writeAll(cartas) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartas))
  } catch {
    throw new Error('No se pudo guardar la carta. Reduce el tamaño de las imágenes e inténtalo nuevamente.')
  }
}

function createId() {
  return globalThis.crypto?.randomUUID?.() || `carta-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const cartasRepository = {
  list: readAll,

  save(values, id) {
    const now = new Date().toISOString()
    const cartas = readAll()
    const current = id ? cartas.find((item) => item.id === id) : null
    const saved = {
      ...normalizeCarta(values),
      id: current?.id || createId(),
      createdAt: current?.createdAt || now,
      updatedAt: now,
    }
    const next = current
      ? cartas.map((item) => (item.id === id ? saved : item))
      : [saved, ...cartas]
    writeAll(next)
    return saved
  },

  remove(id) {
    writeAll(readAll().filter((item) => item.id !== id))
  },
}

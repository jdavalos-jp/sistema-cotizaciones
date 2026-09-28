import { normalizeNota } from '../domain/nota.js'

const STORAGE_KEY = 'jdb-lab-notas-entrega-v1'

function readAll() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.map(normalizeNota) : []
  } catch {
    return []
  }
}

function writeAll(notas) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notas))
  } catch {
    throw new Error('No se pudo guardar la nota en este navegador.')
  }
}

export const notasRepository = {
  list: readAll,
  save(values, id) {
    const list = readAll()
    const current = id ? list.find((item) => item.id === id) : null
    const now = new Date().toISOString()
    const saved = {
      ...normalizeNota(values),
      id: current?.id || globalThis.crypto?.randomUUID?.() || `nota-${Date.now()}`,
      createdAt: current?.createdAt || now,
      updatedAt: now,
    }
    writeAll(current ? list.map((item) => (item.id === id ? saved : item)) : [saved, ...list])
    return saved
  },
  remove(id) {
    writeAll(readAll().filter((item) => item.id !== id))
  },
}

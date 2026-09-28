import { normalizeCertificado } from '../domain/certificado.js'

const STORAGE_KEY = 'jdb-lab-certificados-v1'

function readAll() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.map(normalizeCertificado) : []
  } catch {
    return []
  }
}

function writeAll(certificados) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(certificados))
  } catch {
    throw new Error('No se pudo guardar el certificado. Reduce el tamaño de la firma.')
  }
}

export const certificadosRepository = {
  list: readAll,
  save(values, id) {
    const currentList = readAll()
    const current = id ? currentList.find((item) => item.id === id) : null
    const now = new Date().toISOString()
    const saved = {
      ...normalizeCertificado(values),
      id: current?.id || globalThis.crypto?.randomUUID?.() || `cert-${Date.now()}`,
      createdAt: current?.createdAt || now,
      updatedAt: now,
    }
    writeAll(current
      ? currentList.map((item) => (item.id === id ? saved : item))
      : [saved, ...currentList])
    return saved
  },
  remove(id) {
    writeAll(readAll().filter((item) => item.id !== id))
  },
}


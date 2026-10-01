export const CERTIFICADO_STATUS = Object.freeze({ DRAFT: 'borrador', FINAL: 'finalizado' })

export const DEFAULT_GUARANTEE_HTML = `
  <p><strong>JDBlab</strong> garantiza el funcionamiento de los productos contra cualquier defecto de fabricación que fallara en condiciones normales de uso.</p>
  <p><strong>JDBlab</strong> se reserva el derecho de reparar y/o sustituir las partes defectuosas o dañadas. Las fallas, roturas, accidentes o desgastes producidos por malos tratos o uso indebido del equipo no serán contempladas por esta cobertura.</p>
`

function todayLocalIso() {
  const date = new Date()
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
}

export function addWarrantyYears(value, years) {
  if (!value) return ''
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return ''
  date.setFullYear(date.getFullYear() + Number(years || 0))
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
}

export function createEmptyCertificado() {
  const fechaDesde = todayLocalIso()
  return {
    clienteId: undefined,
    clienteEntidad: '',
    objetoContratacion: '',
    codigo: 'R-TNE-21',
    revision: '1',
    garantiaAnos: 1,
    fechaDesde,
    fechaHasta: addWarrantyYears(fechaDesde, 1),
    items: [],
    condicionesHtml: DEFAULT_GUARANTEE_HTML,
    empresaFirmante: undefined,
    firmanteNombre: '',
    firmanteCargo: 'JDBlab Equipamiento Didáctico y Técnico.',
    firmanteDocumento: '',
    firmanteTelefono: '',
    firmaImagen: '',
    selloImagen: '',
    papel: 'a4',
    estado: CERTIFICADO_STATUS.DRAFT,
  }
}

export function normalizeCertificado(values) {
  const normalized = { ...createEmptyCertificado(), ...values }
  Object.keys(normalized).forEach((key) => {
    if (typeof normalized[key] === 'string') normalized[key] = normalized[key].trim()
  })
  normalized.garantiaAnos = Math.max(1, Number(normalized.garantiaAnos || 1))
  normalized.items = Array.isArray(normalized.items)
    ? normalized.items.map((item) => ({
        ...item,
        descripcion: String(item.descripcion || '').trim(),
        marca: String(item.marca || '').trim(),
        modelo: String(item.modelo || '').trim(),
        cantidad: Math.max(1, Number(item.cantidad || 1)),
        aclaraciones: String(item.aclaraciones || '').trim(),
      }))
    : []
  normalized.papel = ['letter', 'a4'].includes(normalized.papel) ? normalized.papel : 'a4'
  return normalized
}

export function duplicateCertificado(certificado) {
  return {
    ...normalizeCertificado(certificado),
    id: undefined,
    estado: CERTIFICADO_STATUS.DRAFT,
    createdAt: undefined,
    updatedAt: undefined,
  }
}

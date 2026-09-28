export const CARTA_STATUS = Object.freeze({
  DRAFT: 'borrador',
  FINAL: 'finalizada',
})

export const PAPER_SIZES = Object.freeze({
  letter: { label: 'Carta', format: 'letter' },
  legal: { label: 'Oficio', format: 'legal' },
  a4: { label: 'A4', format: 'a4' },
})

function todayLocalIso() {
  const date = new Date()
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

export const EMPTY_CARTA = Object.freeze({
  clienteId: undefined,
  ciudadFecha: 'Cochabamba',
  fecha: todayLocalIso(),
  tratamiento: 'Señora:',
  destinatario: '',
  cargoDestinatario: '',
  institucion: '',
  referencia: '',
  numero: '',
  presente: 'Presente.-',
  cuerpoHtml: '',
  despedida: 'Atentamente:',
  firmanteNombre: '',
  firmanteCargo: '',
  firmanteDocumento: '',
  firmanteTelefono: '',
  firmaImagen: '',
  selloImagen: '',
  papel: 'letter',
  estado: CARTA_STATUS.DRAFT,
})

export function createEmptyCarta() {
  return { ...EMPTY_CARTA }
}

export function normalizeCarta(values) {
  const normalized = { ...createEmptyCarta(), ...values }

  Object.keys(normalized).forEach((key) => {
    if (typeof normalized[key] === 'string') normalized[key] = normalized[key].trim()
  })

  normalized.papel = PAPER_SIZES[normalized.papel] ? normalized.papel : 'letter'
  normalized.estado = Object.values(CARTA_STATUS).includes(normalized.estado)
    ? normalized.estado
    : CARTA_STATUS.DRAFT

  return normalized
}

export function duplicateCarta(carta) {
  return {
    ...normalizeCarta(carta),
    id: undefined,
    numero: '',
    estado: CARTA_STATUS.DRAFT,
    createdAt: undefined,
    updatedAt: undefined,
  }
}

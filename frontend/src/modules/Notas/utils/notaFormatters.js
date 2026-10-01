export function formatNotaDate(value) {
  if (!value) return '-'
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

export function formatMoney(value) {
  return Number(value || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const UNITS = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE']
const TEENS = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE']
const TENS = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA']
const HUNDREDS = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS']

function belowOneHundred(value) {
  if (value < 10) return UNITS[value]
  if (value < 20) return TEENS[value - 10]
  if (value < 30) return value === 20 ? 'VEINTE' : `VEINTI${UNITS[value - 20]}`
  const tens = TENS[Math.floor(value / 10)]
  return value % 10 ? `${tens} Y ${UNITS[value % 10]}` : tens
}

function belowOneThousand(value) {
  if (!value) return ''
  if (value === 100) return 'CIEN'
  return `${HUNDREDS[Math.floor(value / 100)]} ${belowOneHundred(value % 100)}`.trim()
}

function masculine(value) {
  return value.replace(/VEINTIUNO$/, 'VEINTIÚN').replace(/UNO$/, 'UN')
}

function numberInWords(value) {
  if (!value) return 'CERO'
  const groups = []
  const billions = Math.floor(value / 1_000_000_000)
  const millions = Math.floor((value % 1_000_000_000) / 1_000_000)
  const thousands = Math.floor((value % 1_000_000) / 1_000)
  const rest = value % 1_000

  if (billions) groups.push(billions === 1 ? 'MIL MILLONES' : `${masculine(belowOneThousand(billions))} MIL MILLONES`)
  if (millions) groups.push(millions === 1 ? 'UN MILLÓN' : `${masculine(belowOneThousand(millions))} MILLONES`)
  if (thousands) groups.push(thousands === 1 ? 'MIL' : `${masculine(belowOneThousand(thousands))} MIL`)
  if (rest) groups.push(belowOneThousand(rest))
  return groups.join(' ')
}

export function formatMoneyInWords(value) {
  const cents = Math.round(Math.max(0, Number(value) || 0) * 100)
  const whole = Math.floor(cents / 100)
  const decimal = String(cents % 100).padStart(2, '0')
  return `${numberInWords(whole)} ${decimal}/100 BOLIVIANOS`
}

export function safeNotaFileName(value) {
  return String(value || 'nota-entrega')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'nota-entrega'
}

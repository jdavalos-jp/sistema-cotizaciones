const { Prisma } = require('@prisma/client');

/**
 * Convierte recursivamente todos los valores Decimal de Prisma a números
 */
function decimalToNumber(value) {
  if (value === null || value === undefined) {
    return value;
  }

  // BigInt no es serializable a JSON. Convertimos a Number si es seguro;
  // si no, lo dejamos como string para no perder precisión.
  if (typeof value === 'bigint') {
    const maxSafe = BigInt(Number.MAX_SAFE_INTEGER);
    const minSafe = BigInt(Number.MIN_SAFE_INTEGER);
    if (value <= maxSafe && value >= minSafe) {
      return Number(value);
    }
    return value.toString();
  }

  // IMPORTANT: preserve Date instances (Prisma DateTime/@db.Date)
  // Otherwise they become plain objects {} and end up as [object Object].
  if (value instanceof Date) {
    return value;
  }

  if (value instanceof Prisma.Decimal) {
    return Number(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => decimalToNumber(item));
  }

  if (typeof value === 'object' && value !== null) {
    const converted = {};
    for (const [key, val] of Object.entries(value)) {
      converted[key] = decimalToNumber(val);
    }
    return converted;
  }

  return value;
}

module.exports = { decimalToNumber };

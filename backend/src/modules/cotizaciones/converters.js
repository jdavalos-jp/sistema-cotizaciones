/**
 * Convertidores centralizados para el módulo de cotizaciones
 * Todo se maneja en enteros (sin Decimal)
 */

const { HttpError } = require('../../utils/httpError');

/**
 * Convierte un valor a BigInt con validación
 * @param {*} value - Valor a convertir
 * @param {string} fieldName - Nombre del campo (para mensajes de error)
 * @returns {BigInt}
 */
function toBigInt(value, fieldName = 'value') {
  if (value === null || value === undefined) {
    throw new HttpError(400, `${fieldName} es requerido`);
  }

  try {
    const bigIntValue = BigInt(value);
    if (bigIntValue <= 0n) {
      throw new HttpError(400, `${fieldName} debe ser mayor a 0`);
    }
    return bigIntValue;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(400, `${fieldName} inválido (valor numérico esperado)`);
  }
}

/**
 * Convierte un valor a número entero positivo con validación
 * @param {*} value - Valor a convertir
 * @param {string} fieldName - Nombre del campo
 * @param {Object} options - { min, max, allowZero }
 * @returns {number}
 */
function toInt(value, fieldName = 'value', { min = 1, max = Number.MAX_SAFE_INTEGER, allowZero = false } = {}) {
  if (value === null || value === undefined) {
    throw new HttpError(400, `${fieldName} es requerido`);
  }

  const num = Number(value);

  if (!Number.isInteger(num)) {
    throw new HttpError(400, `${fieldName} debe ser un número entero`);
  }

  const minVal = allowZero ? 0 : min;
  if (num < minVal || num > max) {
    throw new HttpError(400, `${fieldName} debe estar entre ${minVal} y ${max}`);
  }

  return num;
}

/**
 * Valida y convierte un precio a entero positivo
 * @param {*} value - Valor a convertir
 * @param {string} fieldName - Nombre del campo
 * @returns {number} - Precio como entero (0 o positivo)
 */
function toPriceInt(value, fieldName = 'precio') {
  if (value === null || value === undefined) {
    return 0; // Precio por defecto es 0
  }

  let num;

  if (typeof value === 'string') {
    num = parseInt(value, 10);
  } else {
    num = Number(value);
  }

  if (!Number.isInteger(num) || num < 0) {
    throw new HttpError(400, `${fieldName} debe ser un número entero no negativo`);
  }

  return num;
}

/**
 * Valida moneda permitida
 * @param {*} value - Valor a validar
 * @returns {string} - Moneda validada
 */
function validateCurrency(value = 'Bs') {
  const VALID_CURRENCIES = ['Bs', 'USD', 'EUR', 'ARS'];
  const input = String(value || 'Bs').trim();

  const match = VALID_CURRENCIES.find(
    (c) => c.toUpperCase() === input.toUpperCase()
  );

  if (!match) {
    throw new HttpError(400, `Moneda inválida. Permitidas: ${VALID_CURRENCIES.join(', ')}`);
  }

  return match;
}

/**
 * Suma de días con manejo de errores
 * @param {Date|string} date - Fecha inicial
 * @param {number} days - Días a agregar
 * @returns {Date|null} - Nueva fecha o null si hay error
 */
function addDaysToDate(date, days) {
  try {
    let dateStr = '';

    if (date instanceof Date) {
      if (isNaN(date.getTime())) {
        return null;
      }
      dateStr = date.toISOString().split('T')[0];
    } else if (typeof date === 'string') {
      dateStr = date.trim();
    } else {
      return null;
    }

    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return null;
    }

    const d = new Date(dateStr + 'T00:00:00Z');

    if (isNaN(d.getTime())) {
      return null;
    }

    const newDate = new Date(d);
    const daysToAdd = Number(days) || 0;
    newDate.setUTCDate(newDate.getUTCDate() + daysToAdd);

    return newDate;
  } catch (err) {
    return null;
  }
}

/**
 * Calcula días hábiles entre dos fechas (L-V)
 * @param {Date|string} desde - Fecha inicio
 * @param {Date|string} hasta - Fecha fin
 * @returns {number} - Cantidad de días hábiles
 */
function countBusinessDays(desde, hasta) {
  try {
    if (!desde || !hasta) {
      return 0;
    }

    let startDate;
    let endDate;

    if (typeof desde === 'string') {
      startDate = new Date(desde + 'T00:00:00Z');
    } else {
      startDate = new Date(desde);
    }

    if (typeof hasta === 'string') {
      endDate = new Date(hasta + 'T00:00:00Z');
    } else {
      endDate = new Date(hasta);
    }

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 0;
    }

    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getUTCDay();
      // 0 = Domingo, 1 = Lunes, 5 = Viernes, 6 = Sábado
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setUTCDate(current.getUTCDate() + 1);
    }

    return count;
  } catch (err) {
    return 0;
  }
}

/**
 * Formatea un número como moneda para mostrar
 * @param {number} value - Valor a formatear
 * @param {string} currency - Código de moneda
 * @returns {string} - Valor formateado
 */
function formatCurrency(value, currency = 'Bs') {
  const num = Number(value) || 0;
  const safe = Math.floor(Math.abs(num));
  return `${currency} ${safe.toLocaleString('es-BO')}`;
}

module.exports = {
  toBigInt,
  toInt,
  toPriceInt,
  validateCurrency,
  addDaysToDate,
  countBusinessDays,
  formatCurrency,
};

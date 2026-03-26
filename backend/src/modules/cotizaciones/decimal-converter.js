/**
 * DEPRECATED: Esta función es solo para compatibilidad
 * Ya que todo está en enteros (Int), simplemente devolvemos el valor
 * NO HAGAS MÁS CONVERSIONES AQUÍ
 */
function decimalToNumber(value) {
  // Si es array, mapea recursivamente
  if (Array.isArray(value)) {
    return value.map((item) => decimalToNumber(item));
  }

  // Si es objeto, retorna tal cual - ya está en formato correcto (Int)
  if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
    return value;
  }

  // Si es valor primitivo, retorna tal cual
  return value;
}

module.exports = { decimalToNumber };

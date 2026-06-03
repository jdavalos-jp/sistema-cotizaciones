const { z } = require('zod');

const emptyStringToNull = (value) =>
  typeof value === 'string' && value.trim() === '' ? null : value;

const toBigIntInput = (value) => {
  if (value === null || value === undefined || value === '') return value;
  try {
    return BigInt(value);
  } catch {
    return value;
  }
};

const optionalText = (max, label) =>
  z.preprocess(
    emptyStringToNull,
    z.string().trim().max(max, `${label} no puede exceder ${max} caracteres`).nullable().optional(),
  );

const positiveBigInt = (label) =>
  z.preprocess(toBigIntInput, z.bigint(`${label} invalido`).positive(`${label} invalido`));

const optionalPositiveBigInt = (label) =>
  z.preprocess(
    (value) => toBigIntInput(emptyStringToNull(value)),
    z.bigint(`${label} invalido`).positive(`${label} invalido`).nullable().optional(),
  );

const positiveInt = (label) =>
  z.union([z.number(), z.string()]).pipe(
    z.coerce.number().int(`${label} debe ser entero`).positive(`${label} debe ser mayor que 0`),
  );

const optionalPositiveInt = (label) =>
  z.preprocess(
    emptyStringToNull,
    z
      .union([z.number(), z.string()])
      .pipe(z.coerce.number().int(`${label} debe ser entero`).positive(`${label} debe ser mayor que 0`))
      .nullable()
      .optional(),
  );

const productoComponenteSchema = z.object({
  idComponente: positiveBigInt('idComponente'),
  cantidad: positiveInt('Cantidad').default(1),
  precioReferencial: optionalPositiveInt('Precio referencial'),
  observaciones: optionalText(500, 'Observaciones'),
});

const productoFields = {
  nombre: z
    .string()
    .trim()
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(200, 'Nombre no puede exceder 200 caracteres'),
  descripcion: optionalText(1000, 'Descripcion'),
  precioBase: positiveInt('Precio'),
  cantidad: positiveInt('Cantidad'),
  sku: z.preprocess(
    emptyStringToNull,
    z
      .string()
      .trim()
      .max(100, 'SKU no puede exceder 100 caracteres')
      .regex(/^[A-Za-z0-9._-]+$/, 'SKU solo permite letras, numeros, puntos, guiones y guion bajo')
      .nullable()
      .optional(),
  ),
  idCategoria: positiveBigInt('idCategoria'),
  idSubcategoria: optionalPositiveBigInt('idSubcategoria'),
  componentes: z.array(productoComponenteSchema).optional(),
};

const createProductoSchema = z.object({
  ...productoFields,
  cantidad: productoFields.cantidad.default(1),
  componentes: productoFields.componentes.default([]),
});

const updateProductoSchema = z.object({
  nombre: productoFields.nombre.optional(),
  descripcion: productoFields.descripcion,
  precioBase: productoFields.precioBase.optional(),
  cantidad: productoFields.cantidad.optional(),
  sku: productoFields.sku,
  idCategoria: productoFields.idCategoria.optional(),
  idSubcategoria: productoFields.idSubcategoria,
  componentes: productoFields.componentes,
}).refine(
  (value) => Object.keys(value).length > 0,
  'Debe enviar al menos un campo para actualizar',
);

function formatZodError(error) {
  return error.issues.map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`).join('; ');
}

module.exports = {
  createProductoSchema,
  updateProductoSchema,
  formatZodError,
};

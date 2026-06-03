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

const nonNegativeInt = (label) =>
  z.union([z.number(), z.string()]).pipe(
    z.coerce.number().int(`${label} debe ser entero`).min(0, `${label} no puede ser negativo`),
  );

const positiveInt = (label) =>
  z.union([z.number(), z.string()]).pipe(
    z.coerce.number().int(`${label} debe ser entero`).positive(`${label} debe ser mayor que 0`),
  );

const optionalNonNegativeInt = (label) =>
  z.preprocess(
    emptyStringToNull,
    z
      .union([z.number(), z.string()])
      .pipe(z.coerce.number().int(`${label} debe ser entero`).min(0, `${label} no puede ser negativo`))
      .nullable()
      .optional(),
  );

const componenteFields = {
  nombre: z
    .string()
    .trim()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(200, 'Nombre no puede exceder 200 caracteres'),
  descripcion: optionalText(1000, 'Descripcion'),
  precioBase: nonNegativeInt('Precio'),
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
};

const createComponenteSchema = z.object(componenteFields);

const updateComponenteSchema = z.object({
  nombre: componenteFields.nombre.optional(),
  descripcion: componenteFields.descripcion,
  precioBase: componenteFields.precioBase.optional(),
  sku: componenteFields.sku,
}).refine(
  (value) => Object.keys(value).length > 0,
  'Debe enviar al menos un campo para actualizar',
);

const addProductoComponenteSchema = z.object({
  idProducto: positiveBigInt('idProducto'),
  cantidad: positiveInt('Cantidad').default(1),
  precioReferencial: optionalNonNegativeInt('Precio referencial'),
  observaciones: optionalText(500, 'Observaciones'),
});

const updateProductoComponenteSchema = z.object({
  cantidad: positiveInt('Cantidad').optional(),
  precioReferencial: optionalNonNegativeInt('Precio referencial'),
  observaciones: optionalText(500, 'Observaciones'),
}).refine(
  (value) => Object.keys(value).length > 0,
  'Debe enviar al menos un campo para actualizar',
);

function formatZodError(error) {
  return error.issues.map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`).join('; ');
}

module.exports = {
  createComponenteSchema,
  updateComponenteSchema,
  addProductoComponenteSchema,
  updateProductoComponenteSchema,
  formatZodError,
};

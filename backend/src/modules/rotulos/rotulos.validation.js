const { z } = require('zod');

const optionalText = (max, label) =>
  z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
    z.string().trim().max(max, `${label} no puede exceder ${max} caracteres`).nullable().optional(),
  );

const idClienteSchema = z
  .union([z.number(), z.string(), z.bigint()])
  .pipe(z.coerce.bigint().positive('idCliente inválido'));

const tamanoPapelSchema = z.enum(['letter', 'legal']);

const rotuloBaseSchema = z.object({
  idCliente: idClienteSchema,
  nombre: z.string().trim().min(3, 'Nombre debe tener al menos 3 caracteres').max(200, 'Nombre no puede exceder 200 caracteres'),
  cargo: optionalText(150, 'Cargo'),
  correo: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
    z.string().trim().email('Correo inválido').max(150, 'Correo no puede exceder 150 caracteres').nullable().optional(),
  ),
  telefono: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
    z.string().trim().regex(/^[\d\s\-+()]+$/, 'Teléfono inválido').max(30, 'Teléfono no puede exceder 30 caracteres').nullable().optional(),
  ),
  ciudad: optionalText(100, 'Ciudad'),
  tamanoPapel: tamanoPapelSchema,
});

const createRotuloSchema = rotuloBaseSchema.extend({ tamanoPapel: tamanoPapelSchema.default('letter') });
const updateRotuloSchema = rotuloBaseSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Debe enviar al menos un campo para actualizar',
);

function formatZodError(error) {
  return error.issues.map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`).join('; ');
}

module.exports = { createRotuloSchema, updateRotuloSchema, formatZodError };

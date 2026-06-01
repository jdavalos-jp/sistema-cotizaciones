const { z } = require('zod');

const optionalText = (max, label) =>
  z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
    z.string().trim().max(max, `${label} no puede exceder ${max} caracteres`).nullable().optional(),
  );

const clienteBaseSchema = z.object({
  nombreCompleto: z
    .string()
    .trim()
    .min(3, 'Nombre completo debe tener al menos 3 caracteres')
    .max(200, 'Nombre completo no puede exceder 200 caracteres'),
  email: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
    z.string().trim().email('Email invalido').max(150, 'Email no puede exceder 150 caracteres').nullable().optional(),
  ),
  telefono: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
    z.string().trim().regex(/^[\d\s\-+()]+$/, 'Telefono invalido').max(30, 'Telefono no puede exceder 30 caracteres').nullable().optional(),
  ),
  ciudad: optionalText(100, 'Ciudad'),
  cargo: optionalText(150, 'Cargo'),
  institucion: optionalText(150, 'Institucion'),
  direccion: optionalText(500, 'Direccion'),
  observaciones: optionalText(1000, 'Observaciones'),
});

const createClienteSchema = clienteBaseSchema;
const updateClienteSchema = clienteBaseSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Debe enviar al menos un campo para actualizar',
);

function formatZodError(error) {
  return error.issues.map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`).join('; ');
}

module.exports = {
  createClienteSchema,
  updateClienteSchema,
  formatZodError,
};

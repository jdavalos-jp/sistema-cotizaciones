const { z } = require('zod');

const optionalText = (max, label) =>
  z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
    z.string().trim().max(max, `${label} no puede exceder ${max} caracteres`).nullable().optional(),
  );

const positiveClientIdSchema = z.union([z.number(), z.string(), z.bigint()]).pipe(z.coerce.bigint().positive('idCliente inválido'));

const idClienteSchema = z.preprocess(
  (value) => (value === '' || value === undefined ? null : value),
  z.union([positiveClientIdSchema, z.null()]),
);
const cartaBaseSchema = z.object({
  idCliente: idClienteSchema.optional(),
  ciudadFecha: z.string().trim().min(1, 'Ciudad requerida').max(100, 'Ciudad no puede exceder 100 caracteres'),
  fecha: z.coerce.date(),
  numero: optionalText(50, 'Número'),
  tratamiento: optionalText(50, 'Tratamiento'),
  destinatario: z.string().trim().min(1, 'Destinatario requerido').max(200, 'Destinatario no puede exceder 200 caracteres'),
  cargoDestinatario: optionalText(150, 'Cargo del destinatario'),
  institucion: optionalText(150, 'Institución'),
  presente: optionalText(100, 'Presente'),
  referencia: z.string().trim().min(1, 'Referencia requerida').max(300, 'Referencia no puede exceder 300 caracteres'),
  cuerpoHtml: z.string().trim().min(1, 'Contenido de carta requerido'),
  despedida: optionalText(100, 'Despedida'),
  empresaFirmante: z.enum(['tecnoequip', 'jdblab']).optional().nullable(),
  firmanteNombre: optionalText(200, 'Nombre del firmante'),
  firmanteCargo: optionalText(200, 'Cargo del firmante'),
  firmanteDocumento: optionalText(50, 'Documento del firmante'),
  firmanteTelefono: optionalText(30, 'Teléfono del firmante'),
  papel: z.enum(['letter', 'legal', 'a4']).default('letter'),
  estado: z.enum(['borrador', 'finalizada']).default('borrador'),
});

const createCartaSchema = cartaBaseSchema;
const updateCartaSchema = cartaBaseSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Debe enviar al menos un campo para actualizar',
);

function formatZodError(error) {
  return error.issues.map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`).join('; ');
}

module.exports = { createCartaSchema, updateCartaSchema, formatZodError };

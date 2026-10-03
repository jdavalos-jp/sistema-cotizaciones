const { z } = require('zod');

const optionalText = (max, label) => z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.string().trim().max(max, `${label} no puede exceder ${max} caracteres`).nullable().optional(),
);

const nullableId = (label) => z.preprocess(
  (value) => (value === '' || value === undefined || value === null ? null : value),
  z.union([z.number(), z.string(), z.bigint()]).pipe(z.coerce.bigint().positive(`${label} inválido`)).nullable(),
);

const optionalDate = z.preprocess(
  (value) => (value === '' || value === undefined || value === null ? null : value),
  z.coerce.date().nullable(),
);

const certificadoItemSchema = z.object({
  tipoCatalogo: z.enum(['producto', 'componente']),
  idProducto: nullableId('idProducto'),
  idComponente: nullableId('idComponente'),
  descripcion: z.string().trim().min(1, 'Descripción requerida').max(300, 'Descripción no puede exceder 300 caracteres'),
  marca: optionalText(150, 'Marca'),
  modelo: optionalText(150, 'Modelo'),
  cantidad: z.coerce.number().int().positive('Cantidad debe ser mayor a cero'),
  aclaraciones: optionalText(250, 'Aclaraciones'),
  ordenVisual: z.coerce.number().int().min(0, 'Orden inválido'),
}).superRefine((item, context) => {
  if (item.idProducto && item.idComponente) {
    context.addIssue({ code: 'custom', message: 'Un ítem no puede referenciar producto y componente', path: ['idProducto'] });
  }
  if (item.idProducto && item.tipoCatalogo !== 'producto') {
    context.addIssue({ code: 'custom', message: 'El tipo de catálogo debe ser producto', path: ['tipoCatalogo'] });
  }
  if (item.idComponente && item.tipoCatalogo !== 'componente') {
    context.addIssue({ code: 'custom', message: 'El tipo de catálogo debe ser componente', path: ['tipoCatalogo'] });
  }
});

const certificadoBaseSchema = z.object({
  idCliente: nullableId('idCliente').optional(),
  idNotaOrigen: nullableId('idNotaOrigen').optional(),
  clienteEntidad: z.string().trim().min(1, 'Cliente o entidad requerida').max(250, 'Cliente o entidad no puede exceder 250 caracteres'),
  objetoContratacion: z.string().trim().min(1, 'Objeto de contratación requerido'),
  codigo: z.string().trim().min(1, 'Código requerido').max(50, 'Código no puede exceder 50 caracteres'),
  revision: optionalText(20, 'Revisión'),
  garantiaAnos: z.preprocess(
    (value) => (value === '' || value === undefined || value === null ? null : value),
    z.coerce.number().int().min(1, 'Garantía mínima de un año').max(20, 'Garantía máxima de 20 años').nullable(),
  ),
  fechaDesde: optionalDate,
  fechaHasta: optionalDate,
  condicionesHtml: z.string().trim().min(1, 'Condiciones de garantía requeridas'),
  empresaFirmante: z.enum(['tecnoequip', 'jdblab']).nullable().optional(),
  firmanteNombre: optionalText(200, 'Nombre del firmante'),
  firmanteCargo: optionalText(200, 'Cargo del firmante'),
  firmanteDocumento: optionalText(50, 'Documento del firmante'),
  firmanteTelefono: optionalText(30, 'Teléfono del firmante'),
  papel: z.enum(['a4', 'letter']).default('a4'),
  estado: z.enum(['borrador', 'finalizado']).default('borrador'),
  items: z.array(certificadoItemSchema).min(1, 'Debe incluir al menos un ítem'),
});

const createCertificadoSchema = certificadoBaseSchema;
const updateCertificadoSchema = certificadoBaseSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Debe enviar al menos un campo para actualizar',
);

function formatZodError(error) {
  return error.issues.map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`).join('; ');
}

module.exports = { createCertificadoSchema, updateCertificadoSchema, formatZodError };

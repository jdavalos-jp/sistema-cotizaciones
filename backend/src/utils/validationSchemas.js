const { z } = require('zod');

/**
 * Schemas de validación Zod para el proyecto
 * Estos schemas validan la entrada de datos en todos los endpoints
 */

// ==================== PRODUCTOS ====================

const ComponenteSchema = z.object({
  idComponente: z
    .union([z.number(), z.string(), z.bigint()])
    .pipe(z.coerce.bigint().positive('idComponente debe ser un número positivo')),
  cantidad: z
    .union([z.number(), z.string()])
    .pipe(z.coerce.number().int().positive('Cantidad de componente debe ser positiva'))
    .default(1),
  precioReferencial: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .optional()
    .nullable()
    .transform((val) => {
      if (val === null || val === undefined) return null;
      const num = Number(val);
      if (isNaN(num) || num <= 0) throw new Error('Precio referencial debe ser un número positivo');
      return num;
    }),
  observaciones: z
    .string()
    .max(500, 'Observaciones no pueden exceder 500 caracteres')
    .optional()
    .nullable(),
});

const CreateProductoSchema = z.object({
  nombre: z
    .string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(200, 'Nombre no puede exceder 200 caracteres')
    .trim(),
  descripcion: z
    .string()
    .max(1000, 'Descripción no puede exceder 1000 caracteres')
    .trim()
    .optional()
    .nullable(),
  precioBase: z
    .union([z.number(), z.string()])
    .pipe(z.coerce.number().int().positive('Precio debe ser un número entero positivo')),
  cantidad: z
    .union([z.number(), z.string()])
    .pipe(z.coerce.number().int().positive('Cantidad debe ser un número positivo'))
    .default(1),
  sku: z
    .string()
    .max(100, 'SKU no puede exceder 100 caracteres')
    .trim()
    .optional()
    .nullable(),
  idCategoria: z
    .union([z.number(), z.string(), z.bigint()])
    .pipe(z.coerce.bigint().positive('idCategoria debe ser un número positivo')),
  idSubcategoria: z
    .union([z.number(), z.string(), z.bigint()])
    .pipe(z.coerce.bigint().positive('idSubcategoria debe ser un número positivo'))
    .optional()
    .nullable(),
  imagenPrincipal: z.string().url('imagenPrincipal debe ser una URL válida').optional().nullable(),
  componentes: z
    .array(ComponenteSchema)
    .optional()
    .nullable()
    .transform((val) => val || []),
});

const UpdateProductoSchema = CreateProductoSchema.partial();

// ==================== COMPONENTES ====================

const CreateComponenteSchema = z.object({
  nombre: z
    .string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(200, 'Nombre no puede exceder 200 caracteres')
    .trim(),
  descripcion: z
    .string()
    .max(1000, 'Descripción no puede exceder 1000 caracteres')
    .trim()
    .optional()
    .nullable(),
  precioBase: z
    .union([z.number(), z.string()])
    .pipe(z.coerce.number().int().positive('Precio debe ser un número entero positivo')),
  sku: z
    .string()
    .max(100, 'SKU no puede exceder 100 caracteres')
    .trim()
    .optional()
    .nullable(),
});

const UpdateComponenteSchema = CreateComponenteSchema.partial();

// ==================== CLIENTES ====================

const CreateClienteSchema = z.object({
  nombreCompleto: z
    .string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(200, 'Nombre no puede exceder 200 caracteres')
    .trim(),
  email: z
    .string()
    .email('Email inválido')
    .max(150, 'Email no puede exceder 150 caracteres')
    .optional()
    .nullable(),
  telefono: z
    .string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Teléfono inválido')
    .max(30, 'Teléfono no puede exceder 30 caracteres')
    .optional()
    .nullable(),
  ciudad: z
    .string()
    .max(100, 'Ciudad no puede exceder 100 caracteres')
    .trim()
    .optional()
    .nullable(),
  cargo: z
    .string()
    .max(150, 'Cargo no puede exceder 150 caracteres')
    .trim()
    .optional()
    .nullable(),
  idInstitucion: z
    .union([z.number(), z.string(), z.bigint()])
    .pipe(z.coerce.bigint().positive())
    .optional()
    .nullable(),
  direccion: z.string().max(500).trim().optional().nullable(),
  observaciones: z.string().max(1000).trim().optional().nullable(),
});

const UpdateClienteSchema = CreateClienteSchema.partial();

// ==================== COTIZACIONES ====================

const CotizacionItemSchema = z.object({
  id: z.union([z.number(), z.string(), z.bigint()]).pipe(z.coerce.bigint().positive()),
  cantidad: z.union([z.number(), z.string()]).pipe(z.coerce.number().int().positive()),
  nombre: z.string().max(200).optional(),
  descripcion: z.string().optional(),
  observaciones: z.string().optional(),
  precioUnitario: z.union([z.number(), z.string()]).pipe(z.coerce.number().min(0)).optional(),
});

const CreateCotizacionSchema = z.object({
  idCliente: z
    .union([z.number(), z.string(), z.bigint()])
    .pipe(z.coerce.bigint().positive('idCliente inválido')),
  productos: z.array(CotizacionItemSchema).optional().default([]),
  componentes: z.array(CotizacionItemSchema).optional().default([]),
  fechaInicio: z
    .union([z.string(), z.date()])
    .pipe(z.coerce.date('fechaInicio debe ser una fecha válida'))
    .optional(),
  fechaValidez: z
    .union([z.string(), z.date()])
    .pipe(z.coerce.date('fechaValidez debe ser una fecha válida'))
    .optional(),
  moneda: z.enum(['Bs', 'USD', 'EUR']).default('Bs'),
  observaciones: z.string().max(1000).trim().optional().nullable(),
});

// ==================== VALIDACIÓN DE HELPERS ====================

/**
 * Middleware para validar request body contra un schema
 * @param {z.ZodSchema} schema - Schema de Zod a validar
 * @returns {Function} Middleware de Express
 */
function validateBody(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        return res.status(400).json({
          ok: false,
          error: 'Validación fallida',
          details: messages,
        });
      }
      next(error);
    }
  };
}

/**
 * Wrapper para validar datos con un schema
 * Lanza error si la validación falla
 * @param {z.ZodSchema} schema - Schema de Zod
 * @param {*} data - Datos a validar
 * @returns {*} Datos validados
 */
function validate(schema, data) {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError && error.errors) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      const { HttpError } = require('./httpError');
      throw new HttpError(400, messages.join('; '));
    }
    throw error;
  }
}

module.exports = {
  // Schemas
  CreateProductoSchema,
  UpdateProductoSchema,
  CreateComponenteSchema,
  UpdateComponenteSchema,
  CreateClienteSchema,
  UpdateClienteSchema,
  CreateCotizacionSchema,
  // Helpers
  validateBody,
  validate,
};

const { prisma } = require('../../db/prisma');
const { HttpError } = require('../../utils/httpError');

// ==================== SELECT ====================

const componenteSelect = {
  idComponente: true,
  nombre: true,
  descripcion: true,
  precioBase: true,
  sku: true,
  estado: true,
};

// ==================== HELPERS ====================

/**
 * Convierte Decimal de Prisma a Number
 */
function convertDecimals(componente) {
  if (!componente) return null;
  return {
    ...componente,
    precioBase: Number(componente.precioBase),
  };
}

/**
 * Parsea un ID a BigInt
 */
function parseId(param, fieldName = 'id') {
  try {
    return BigInt(param);
  } catch {
    throw new HttpError(400, `${fieldName} inválido`);
  }
}

// ==================== CRUD OPERATIONS ====================

async function listComponentes({ take = 50, skip = 0, search } = {}) {
  const q = search?.trim();
  const where = q
    ? {
        OR: [
          { nombre: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
        ],
      }
    : undefined;

  const [componentes, total] = await Promise.all([
    prisma.componente.findMany({
      take,
      skip,
      where,
      orderBy: { idComponente: 'desc' },
      select: componenteSelect,
    }),
    prisma.componente.count({ where }),
  ]);

  return { data: componentes.map(convertDecimals), total };
}

async function getComponenteById(idComponente) {
  const componente = await prisma.componente.findUnique({
    where: { idComponente },
    select: componenteSelect,
  });

  if (!componente) throw new HttpError(404, 'Componente no encontrado');
  return convertDecimals(componente);
}

async function createComponente({ nombre, descripcion, precioBase, sku }) {
  // Validaciones básicas
  if (!nombre?.trim()) throw new HttpError(400, 'Nombre es requerido');
  if (!precioBase && precioBase !== 0) throw new HttpError(400, 'Precio es requerido');

  // Verificar SKU único si se proporciona
  if (sku?.trim()) {
    const existing = await prisma.componente.findFirst({
      where: { sku: sku.trim() },
    });
    if (existing) throw new HttpError(400, 'SKU ya existe');
  }

  const precio = Number(precioBase);
  if (isNaN(precio) || precio < 0) throw new HttpError(400, 'Precio inválido');

  const componente = await prisma.componente.create({
    data: {
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      precioBase: precio,
      sku: sku?.trim() || null,
      estado: 'activo',
    },
    select: componenteSelect,
  });

  return convertDecimals(componente);
}

async function updateComponente(idComponente, updateData) {
  const compId = parseId(idComponente, 'idComponente');

  // Verificar que existe
  const existing = await prisma.componente.findUnique({
    where: { idComponente: compId },
  });
  if (!existing) throw new HttpError(404, 'Componente no encontrado');

  const data = {};

  if (updateData.nombre !== undefined) {
    if (!updateData.nombre?.trim()) throw new HttpError(400, 'Nombre no puede estar vacío');
    data.nombre = updateData.nombre.trim();
  }

  if (updateData.descripcion !== undefined) {
    data.descripcion = updateData.descripcion?.trim() || null;
  }

  if (updateData.precioBase !== undefined) {
    const precio = Number(updateData.precioBase);
    if (isNaN(precio) || precio < 0) throw new HttpError(400, 'Precio inválido');
    data.precioBase = precio;
  }

  if (updateData.sku !== undefined) {
    const newSku = updateData.sku?.trim() || null;
    if (newSku && newSku !== existing.sku) {
      const conflicts = await prisma.componente.findFirst({
        where: {
          sku: newSku,
          idComponente: { not: compId },
        },
      });
      if (conflicts) throw new HttpError(400, 'SKU ya existe');
    }
    data.sku = newSku;
  }

  if (Object.keys(data).length === 0) {
    return convertDecimals(existing);
  }

  const componente = await prisma.componente.update({
    where: { idComponente: compId },
    data,
    select: componenteSelect,
  });

  return convertDecimals(componente);
}

async function deleteComponente(idComponente) {
  const compId = parseId(idComponente, 'idComponente');

  const existing = await prisma.componente.findUnique({
    where: { idComponente: compId },
    select: { idComponente: true },
  });

  if (!existing) throw new HttpError(404, 'Componente no encontrado');

  // Eliminar - Prisma manejará cascadas
  await prisma.componente.delete({
    where: { idComponente: compId },
  });

  return { ok: true, message: 'Componente eliminado' };
}

// ==================== PRODUCTO_COMPONENTE OPERATIONS ====================

/**
 * Agregar producto a un componente
 * Crea relación en tabla producto_componentes
 */
async function addProductToComponente(idComponente, idProducto, { cantidad = 1, precioReferencial = null, observaciones = null } = {}) {
  const compId = parseId(idComponente, 'idComponente');
  const prodId = parseId(idProducto, 'idProducto');

  // Verificar que existen ambos
  const [componente, producto] = await Promise.all([
    prisma.componente.findUnique({ where: { idComponente: compId }, select: { idComponente: true } }),
    prisma.producto.findUnique({ where: { idProducto: prodId }, select: { idProducto: true } }),
  ]);

  if (!componente) throw new HttpError(404, 'Componente no encontrado');
  if (!producto) throw new HttpError(404, 'Producto no encontrado');

  // Verificar que no exista ya
  const existing = await prisma.productoComponente.findFirst({
    where: {
      idComponente: compId,
      idProducto: prodId,
    },
  });

  if (existing) throw new HttpError(400, 'Este componente ya está asociado a este producto');

  // Crear relación
  const productoComponente = await prisma.productoComponente.create({
    data: {
      idComponente: compId,
      idProducto: prodId,
      cantidad: Math.max(1, cantidad),
      precioReferencial: precioReferencial ? Number(precioReferencial) : null,
      observaciones: observaciones?.trim() || null,
    },
    select: {
      idProductoComponente: true,
      idProducto: true,
      idComponente: true,
      cantidad: true,
      precioReferencial: true,
      observaciones: true,
      producto: {
        select: {
          idProducto: true,
          nombre: true,
          sku: true,
          precioBase: true,
        },
      },
    },
  });

  return productoComponente;
}

/**
 * Obtener productos asociados a un componente
 */
async function getProductsInComponente(idComponente) {
  const compId = parseId(idComponente, 'idComponente');

  // Verificar que existe el componente
  const componente = await prisma.componente.findUnique({
    where: { idComponente: compId },
    select: { idComponente: true },
  });

  if (!componente) throw new HttpError(404, 'Componente no encontrado');

  // Obtener relationships
  const items = await prisma.productoComponente.findMany({
    where: { idComponente: compId },
    select: {
      idProductoComponente: true,
      idProducto: true,
      cantidad: true,
      precioReferencial: true,
      observaciones: true,
      producto: {
        select: {
          idProducto: true,
          nombre: true,
          sku: true,
          precioBase: true,
        },
      },
    },
    orderBy: { idProductoComponente: 'desc' },
  });

  return items;
}

/**
 * Remover producto de componente
 */
async function removeProductFromComponente(idProductoComponente) {
  const relId = parseId(idProductoComponente, 'idProductoComponente');

  const existing = await prisma.productoComponente.findUnique({
    where: { idProductoComponente: relId },
  });

  if (!existing) throw new HttpError(404, 'Relación no encontrada');

  await prisma.productoComponente.delete({
    where: { idProductoComponente: relId },
  });

  return { ok: true, message: 'Producto removido del componente' };
}

/**
 * Actualizar relación producto_componente
 */
async function updateProductInComponente(idProductoComponente, updateData) {
  const relId = parseId(idProductoComponente, 'idProductoComponente');

  const existing = await prisma.productoComponente.findUnique({
    where: { idProductoComponente: relId },
  });

  if (!existing) throw new HttpError(404, 'Relación no encontrada');

  const data = {};

  if (updateData.cantidad !== undefined) {
    const qty = Number(updateData.cantidad);
    if (isNaN(qty) || qty < 1) throw new HttpError(400, 'Cantidad debe ser >= 1');
    data.cantidad = qty;
  }

  if (updateData.precioReferencial !== undefined) {
    data.precioReferencial = updateData.precioReferencial ? Number(updateData.precioReferencial) : null;
  }

  if (updateData.observaciones !== undefined) {
    data.observaciones = updateData.observaciones?.trim() || null;
  }

  if (Object.keys(data).length === 0) return existing;

  const updated = await prisma.productoComponente.update({
    where: { idProductoComponente: relId },
    data,
    select: {
      idProductoComponente: true,
      idProducto: true,
      idComponente: true,
      cantidad: true,
      precioReferencial: true,
      observaciones: true,
      producto: {
        select: {
          idProducto: true,
          nombre: true,
          sku: true,
          precioBase: true,
        },
      },
    },
  });

  return updated;
}

// ==================== EXPORTS ====================

module.exports = {
  listComponentes,
  getComponenteById,
  createComponente,
  updateComponente,
  deleteComponente,
  addProductToComponente,
  getProductsInComponente,
  removeProductFromComponente,
  updateProductInComponente,
};

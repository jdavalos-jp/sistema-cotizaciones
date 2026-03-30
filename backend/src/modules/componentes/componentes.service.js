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

// ==================== EXPORTS ====================

module.exports = {
  listComponentes,
  getComponenteById,
  createComponente,
  updateComponente,
  deleteComponente,
};

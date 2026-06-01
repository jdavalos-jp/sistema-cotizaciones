const { Prisma } = require('@prisma/client');

const { prisma } = require('../../db/prisma');
const { HttpError } = require('../../utils/httpError');
const { deleteImageByPublicUrl } = require('../../services/storage/imageService');

const componenteSelect = {
  idComponente: true,
  nombre: true,
  descripcion: true,
  precioBase: true,
  sku: true,
  estado: true,
  imagenes: {
    where: { estado: 'activo' },
    select: { idImagen: true, urlImagen: true, principal: true, orden: true },
    orderBy: [{ principal: 'desc' }, { orden: 'asc' }],
  },
  productos: {
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
  },
};

const productoComponenteSelect = {
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
};

function parseId(param, fieldName = 'id') {
  if (param === undefined || param === null || param === '') return null;

  try {
    const id = BigInt(param);
    if (id <= 0n) throw new Error('invalid');
    return id;
  } catch {
    throw new HttpError(400, `${fieldName} invalido`);
  }
}

function parseNonNegativeInt(value, fieldName) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) {
    throw new HttpError(400, `${fieldName} debe ser un entero no negativo`);
  }
  return number;
}

function parsePositiveInt(value, fieldName) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw new HttpError(400, `${fieldName} debe ser un entero positivo`);
  }
  return number;
}

function convertDecimals(value) {
  if (Array.isArray(value)) return value.map(convertDecimals);
  if (value instanceof Prisma.Decimal) return Number(value);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, convertDecimals(item)]));
  }
  return value;
}

function buildComponenteWhere({ search }) {
  const where = { estado: 'activo' };
  const q = search?.trim();

  if (q) {
    where.OR = [
      { nombre: { contains: q, mode: 'insensitive' } },
      { sku: { contains: q, mode: 'insensitive' } },
      { descripcion: { contains: q, mode: 'insensitive' } },
    ];
  }

  return where;
}

async function assertComponenteActivo(idComponente) {
  const componente = await prisma.componente.findFirst({
    where: { idComponente, estado: 'activo' },
    select: { idComponente: true, sku: true },
  });

  if (!componente) throw new HttpError(404, 'Componente no encontrado');

  return componente;
}

async function assertProductoActivo(idProducto) {
  const producto = await prisma.producto.findFirst({
    where: { idProducto, estado: 'activo' },
    select: { idProducto: true },
  });

  if (!producto) throw new HttpError(404, 'Producto no encontrado');

  return producto;
}

async function assertSkuDisponible(sku, idComponente = null) {
  if (!sku) return;

  const conflict = await prisma.componente.findFirst({
    where: {
      sku,
      estado: 'activo',
      ...(idComponente ? { idComponente: { not: idComponente } } : {}),
    },
    select: { idComponente: true },
  });

  if (conflict) throw new HttpError(409, `SKU '${sku}' ya esta en uso por otro componente`);
}

async function listComponentes({ take = 50, skip = 0, search } = {}) {
  const where = buildComponenteWhere({ search });
  const [componentes, total] = await prisma.$transaction([
    prisma.componente.findMany({
      take,
      skip,
      where,
      orderBy: { idComponente: 'desc' },
      select: componenteSelect,
    }),
    prisma.componente.count({ where }),
  ]);

  return { data: convertDecimals(componentes), total };
}

async function getComponenteById(idComponente) {
  const compId = parseId(idComponente, 'idComponente');
  const componente = await prisma.componente.findFirst({
    where: { idComponente: compId, estado: 'activo' },
    select: componenteSelect,
  });

  if (!componente) throw new HttpError(404, 'Componente no encontrado');

  return convertDecimals(componente);
}

async function createComponente({ nombre, descripcion, precioBase, sku }) {
  const normalizedSku = sku?.trim() || null;
  await assertSkuDisponible(normalizedSku);

  const componente = await prisma.componente.create({
    data: {
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      precioBase: parseNonNegativeInt(precioBase, 'Precio'),
      sku: normalizedSku,
      estado: 'activo',
    },
    select: componenteSelect,
  });

  return convertDecimals(componente);
}

async function updateComponente(idComponente, updateData) {
  const compId = parseId(idComponente, 'idComponente');
  await assertComponenteActivo(compId);

  const data = {};

  if (updateData.nombre !== undefined) data.nombre = updateData.nombre.trim();
  if (updateData.descripcion !== undefined) data.descripcion = updateData.descripcion?.trim() || null;
  if (updateData.precioBase !== undefined) data.precioBase = parseNonNegativeInt(updateData.precioBase, 'Precio');
  if (updateData.sku !== undefined) {
    const normalizedSku = updateData.sku?.trim() || null;
    await assertSkuDisponible(normalizedSku, compId);
    data.sku = normalizedSku;
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
  await assertComponenteActivo(compId);

  await prisma.$transaction([
    prisma.productoComponente.deleteMany({
      where: { idComponente: compId },
    }),
    prisma.componente.update({
      where: { idComponente: compId },
      data: { estado: 'inactivo' },
    }),
  ]);

  return { ok: true, message: 'Componente eliminado' };
}

async function addProductToComponente(idComponente, idProducto, { cantidad = 1, precioReferencial = null, observaciones = null } = {}) {
  const compId = parseId(idComponente, 'idComponente');
  const prodId = parseId(idProducto, 'idProducto');

  await Promise.all([
    assertComponenteActivo(compId),
    assertProductoActivo(prodId),
  ]);

  const existing = await prisma.productoComponente.findFirst({
    where: {
      idComponente: compId,
      idProducto: prodId,
    },
  });

  if (existing) throw new HttpError(409, 'Este componente ya esta asociado a este producto');

  const productoComponente = await prisma.productoComponente.create({
    data: {
      idComponente: compId,
      idProducto: prodId,
      cantidad: parsePositiveInt(cantidad, 'Cantidad'),
      precioReferencial: precioReferencial == null ? null : parseNonNegativeInt(precioReferencial, 'Precio referencial'),
      observaciones: observaciones?.trim() || null,
    },
    select: productoComponenteSelect,
  });

  return convertDecimals(productoComponente);
}

async function getProductsInComponente(idComponente) {
  const compId = parseId(idComponente, 'idComponente');
  await assertComponenteActivo(compId);

  const items = await prisma.productoComponente.findMany({
    where: { idComponente: compId },
    select: productoComponenteSelect,
    orderBy: { idProductoComponente: 'desc' },
  });

  return convertDecimals(items);
}

async function removeProductFromComponente(idProductoComponente) {
  const relId = parseId(idProductoComponente, 'idProductoComponente');
  const existing = await prisma.productoComponente.findUnique({
    where: { idProductoComponente: relId },
  });

  if (!existing) throw new HttpError(404, 'Relacion no encontrada');

  await prisma.productoComponente.delete({
    where: { idProductoComponente: relId },
  });

  return { ok: true, message: 'Producto removido del componente' };
}

async function updateProductInComponente(idProductoComponente, updateData) {
  const relId = parseId(idProductoComponente, 'idProductoComponente');
  const existing = await prisma.productoComponente.findUnique({
    where: { idProductoComponente: relId },
  });

  if (!existing) throw new HttpError(404, 'Relacion no encontrada');

  const data = {};

  if (updateData.cantidad !== undefined) data.cantidad = parsePositiveInt(updateData.cantidad, 'Cantidad');
  if (updateData.precioReferencial !== undefined) {
    data.precioReferencial = updateData.precioReferencial == null
      ? null
      : parseNonNegativeInt(updateData.precioReferencial, 'Precio referencial');
  }
  if (updateData.observaciones !== undefined) data.observaciones = updateData.observaciones?.trim() || null;

  const updated = await prisma.productoComponente.update({
    where: { idProductoComponente: relId },
    data,
    select: productoComponenteSelect,
  });

  return convertDecimals(updated);
}

async function deleteComponenteImage(idImagen) {
  const imgId = parseId(idImagen, 'idImagen');
  const existing = await prisma.componenteImagen.findUnique({
    where: { idImagen: imgId },
  });

  if (!existing) throw new HttpError(404, 'Imagen no encontrada');

  await deleteImageByPublicUrl(existing.urlImagen);
  await prisma.componenteImagen.delete({
    where: { idImagen: imgId },
  });

  return { ok: true, message: 'Imagen eliminada' };
}

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
  deleteComponenteImage,
};

const { prisma } = require('../../db/prisma');
const { Prisma } = require('@prisma/client');
const { HttpError } = require('../../utils/httpError');
const { deleteImage } = require('../../services/storage/imageService');

/* ---------- HELPERS ---------- */

// Convertir BigInt y validar
function parseId(value, fieldName) {
  if (value === undefined || value === null) return null;
  try {
    return BigInt(value);
  } catch {
    throw new HttpError(400, `${fieldName} inválido`);
  }
}

// Convertir número positivo
function parseNumber(value, fieldName) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) throw new HttpError(400, `${fieldName} debe ser un número positivo`);
  return n;
}

// Convertir Decimal de Prisma a Number recursivamente
function convertDecimals(obj) {
  if (Array.isArray(obj)) return obj.map(convertDecimals);
  if (obj instanceof Prisma.Decimal) return Number(obj);
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, convertDecimals(v)]));
  }
  return obj;
}

/* ---------- SELECTOR REUTILIZABLE ---------- */

const productoSelect = {
  idProducto: true,
  nombre: true,
  descripcion: true,
  precioBase: true,
  cantidad: true,
  sku: true,
  estado: true,
  imagenes: {
    where: { estado: 'activo' },
    select: { idImagen: true, urlImagen: true, principal: true, orden: true },
    orderBy: [{ principal: 'desc' }, { orden: 'asc' }],
  },
  categoria: { select: { idCategoria: true, nombre: true } },
  subcategoria: { select: { idSubcategoria: true, nombre: true } },
  componentes: {
    select: {
      idProductoComponente: true,
      cantidad: true,
      precioReferencial: true,
      observaciones: true,
      componente: { select: { idComponente: true, nombre: true, precioBase: true } },
    },
  },
};

/* ---------- VALIDACIONES ---------- */

async function validateCategoria(catId) {
  const cat = await prisma.categoria.findUnique({ where: { idCategoria: catId } });
  if (!cat) throw new HttpError(400, 'Categoría no existe');
  return cat;
}

async function validateSubcategoria(subCatId, catId) {
  if (!subCatId) return null;
  const sub = await prisma.subcategoria.findUnique({ where: { idSubcategoria: subCatId } });
  if (!sub || sub.idCategoria !== catId) throw new HttpError(400, 'Subcategoría no válida');
  return sub;
}

async function validateComponentes(componentes = []) {
  return Promise.all(componentes.map(async (c) => {
    const compId = parseId(c.idComponente, 'idComponente');
    const comp = await prisma.componente.findUnique({ where: { idComponente: compId } });
    if (!comp) throw new HttpError(400, `Componente con ID ${c.idComponente} no existe`);
    return { ...c, idComponente: compId };
  }));
}

/* ---------- BUILD WHERE PARA FILTROS ---------- */

function buildProductoWhere({ search, idCategoria, idSubcategoria }) {
  const where = { estado: 'activo' };
  if (search?.trim()) {
    const q = search.trim();
    where.OR = [
      { nombre: { contains: q, mode: 'insensitive' } },
      { sku: { contains: q, mode: 'insensitive' } },
      { descripcion: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (idCategoria) where.idCategoria = parseId(idCategoria, 'idCategoria');
  if (idSubcategoria) where.idSubcategoria = parseId(idSubcategoria, 'idSubcategoria');
  return where;
}

/* ---------- FUNCIONES PRINCIPALES ---------- */

async function getCategorias() {
  return prisma.categoria.findMany({
    where: { estado: 'activo' },
    select: { idCategoria: true, nombre: true, descripcion: true },
    orderBy: { nombre: 'asc' },
  });
}

async function getCategoriesWithSubcategories() {
  return prisma.categoria.findMany({
    where: { estado: 'activo' },
    select: {
      idCategoria: true,
      nombre: true,
      descripcion: true,
      subcategorias: { select: { idSubcategoria: true, nombre: true, descripcion: true }, orderBy: { nombre: 'asc' } },
    },
    orderBy: { nombre: 'asc' },
  });
}

async function getSubcategoriasByCategoria(idCategoria) {
  const catId = parseId(idCategoria, 'idCategoria');
  return prisma.subcategoria.findMany({
    where: { idCategoria: catId },
    select: { idSubcategoria: true, nombre: true, descripcion: true },
    orderBy: { nombre: 'asc' },
  });
}

async function listProductos({ take = 50, skip = 0, search, idCategoria, idSubcategoria } = {}) {
  const where = buildProductoWhere({ search, idCategoria, idSubcategoria });
  const [productos, total] = await Promise.all([
    prisma.producto.findMany({ take, skip, where, orderBy: { idProducto: 'desc' }, select: productoSelect }),
    prisma.producto.count({ where }),
  ]);

  return { data: convertDecimals(productos), total };
}

async function getProductoById(idProducto) {
  const prodId = parseId(idProducto, 'idProducto');
  const producto = await prisma.producto.findUnique({ where: { idProducto: prodId }, select: productoSelect });
  if (!producto) throw new HttpError(404, 'Producto no encontrado');
  return convertDecimals(producto);
}

async function createProducto({ nombre, descripcion, precioBase, cantidad, sku, idCategoria, idSubcategoria, componentes = [] }) {
  if (!nombre?.trim()) throw new HttpError(400, 'Nombre es requerido');
  if (!precioBase) throw new HttpError(400, 'Precio es requerido');
  if (!idCategoria) throw new HttpError(400, 'Categoría es requerida');

  const catId = parseId(idCategoria, 'idCategoria');
  const subCatId = parseId(idSubcategoria, 'idSubcategoria');
  const precio = new Prisma.Decimal(precioBase);
  const cant = Number(cantidad) || 1;

  await validateCategoria(catId);
  await validateSubcategoria(subCatId, catId);
  const comps = await validateComponentes(componentes);

  const producto = await prisma.producto.create({
    data: {
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      precioBase: precio,
      cantidad: cant,
      sku: sku?.trim() || null,
      idCategoria: catId,
      idSubcategoria: subCatId,
      estado: 'activo',
      ...(comps.length && { componentes: { create: comps.map(c => ({
        idComponente: c.idComponente,
        cantidad: Number(c.cantidad) || 1,
        precioReferencial: c.precioReferencial ? new Prisma.Decimal(c.precioReferencial) : null,
        observaciones: c.observaciones?.trim() || null,
      })) } }),
    },
    select: productoSelect,
  });

  return convertDecimals(producto);
}

async function updateProducto(idProducto, updateData) {
  const prodId = parseId(idProducto, 'idProducto');
  const existing = await prisma.producto.findUnique({ where: { idProducto: prodId } });
  if (!existing) throw new HttpError(404, 'Producto no encontrado');

  const data = {};

  if (updateData.nombre !== undefined) {
    if (!updateData.nombre?.trim()) throw new HttpError(400, 'Nombre no puede estar vacío');
    data.nombre = updateData.nombre.trim();
  }
  if (updateData.descripcion !== undefined) data.descripcion = updateData.descripcion?.trim() || null;
  if (updateData.precioBase !== undefined) data.precioBase = new Prisma.Decimal(updateData.precioBase);
  if (updateData.cantidad !== undefined) data.cantidad = Math.max(1, Number(updateData.cantidad) || 1);
  if (updateData.sku !== undefined) data.sku = updateData.sku?.trim() || null;

  if (updateData.idCategoria !== undefined) {
    const catId = parseId(updateData.idCategoria, 'idCategoria');
    await validateCategoria(catId);
    data.idCategoria = catId;
  }

  if (updateData.idSubcategoria !== undefined) {
    const subCatId = updateData.idSubcategoria ? parseId(updateData.idSubcategoria, 'idSubcategoria') : null;
    if (subCatId) await validateSubcategoria(subCatId, data.idCategoria || existing.idCategoria);
    data.idSubcategoria = subCatId;
  }

  if (updateData.componentes !== undefined) {
    await prisma.productoComponente.deleteMany({ where: { idProducto: prodId } });
    if (Array.isArray(updateData.componentes) && updateData.componentes.length > 0) {
      const comps = await validateComponentes(updateData.componentes);
      data.componentes = { create: comps.map(c => ({
        idComponente: c.idComponente,
        cantidad: Number(c.cantidad) || 1,
        precioReferencial: c.precioReferencial ? new Prisma.Decimal(c.precioReferencial) : null,
        observaciones: c.observaciones?.trim() || null,
      })) };
    }
  }

  const producto = await prisma.producto.update({ where: { idProducto: prodId }, data, select: productoSelect });
  return convertDecimals(producto);
}

async function deleteProducto(idProducto) {
  const prodId = parseId(idProducto, 'idProducto');
  const producto = await prisma.producto.findUnique({ where: { idProducto: prodId }, include: { imagenes: true } });
  if (!producto) throw new HttpError(404, 'Producto no encontrado');

  // Eliminar imágenes en paralelo
  await Promise.all(
    (producto.imagenes || []).map(async (img) => img.rutaBucket && deleteImage(img.rutaBucket).catch(console.error))
  );

  await prisma.producto.delete({ where: { idProducto: prodId } });
  return { message: 'Producto eliminado' };
}

/* ---------- EXPORTS ---------- */

module.exports = {
  getCategorias,
  getCategoriesWithSubcategories,
  getSubcategoriasByCategoria,
  listProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
};
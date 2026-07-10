const { Prisma } = require('@prisma/client');

const { prisma } = require('../../db/prisma');
const { HttpError } = require('../../utils/httpError');

function parseId(value, fieldName) {
  if (value === undefined || value === null || value === '') return null;

  try {
    const id = BigInt(value);
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
      componente: {
        select: {
          idComponente: true,
          nombre: true,
          sku: true,
          precioBase: true,
        },
      },
    },
  },
};

async function validateCategoria(catId) {
  const categoria = await prisma.categoria.findUnique({
    where: { idCategoria: catId },
    select: { idCategoria: true, estado: true },
  });

  if (!categoria || categoria.estado !== 'activo') {
    throw new HttpError(400, 'Categoria no existe');
  }

  return categoria;
}

async function validateSubcategoria(subCatId, catId) {
  if (!subCatId) return null;

  const subcategoria = await prisma.subcategoria.findUnique({
    where: { idSubcategoria: subCatId },
    select: { idSubcategoria: true, idCategoria: true },
  });

  if (!subcategoria || subcategoria.idCategoria !== catId) {
    throw new HttpError(400, 'Subcategoria no valida');
  }

  return subcategoria;
}

async function validateComponentes(componentes = []) {
  if (!Array.isArray(componentes) || componentes.length === 0) return [];

  const normalized = componentes.map((componente) => ({
    idComponente: parseId(componente.idComponente, 'idComponente'),
    cantidad: parsePositiveInt(componente.cantidad ?? 1, 'Cantidad de componente'),
    precioReferencial: componente.precioReferencial == null
      ? null
      : parsePositiveInt(componente.precioReferencial, 'Precio referencial'),
    observaciones: componente.observaciones?.trim() || null,
  }));
  const ids = [...new Set(normalized.map((item) => item.idComponente.toString()))].map((id) => BigInt(id));
  const existentes = await prisma.componente.findMany({
    where: { idComponente: { in: ids }, estado: 'activo' },
    select: { idComponente: true },
  });
  const existentesSet = new Set(existentes.map((item) => item.idComponente.toString()));
  const missing = ids.find((id) => !existentesSet.has(id.toString()));

  if (missing) {
    throw new HttpError(400, `Componente con ID ${missing.toString()} no existe`);
  }

  return normalized;
}

async function assertSkuDisponible(sku, idProducto = null) {
  if (!sku) return;

  const conflict = await prisma.producto.findFirst({
    where: {
      sku,
      estado: 'activo',
      ...(idProducto ? { idProducto: { not: idProducto } } : {}),
    },
    select: { idProducto: true },
  });

  if (conflict) {
    throw new HttpError(409, `SKU '${sku}' ya esta en uso por otro producto`);
  }
}

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
      subcategorias: {
        select: { idSubcategoria: true, nombre: true, descripcion: true },
        orderBy: { nombre: 'asc' },
      },
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
    prisma.producto.findMany({
      take,
      skip,
      where,
      orderBy: { idProducto: 'desc' },
      select: productoSelect,
    }),
    prisma.producto.count({ where }),
  ]);

  return { data: convertDecimals(productos), total };
}

async function getProductoById(idProducto) {
  const prodId = parseId(idProducto, 'idProducto');
  const producto = await prisma.producto.findFirst({
    where: { idProducto: prodId, estado: 'activo' },
    select: productoSelect,
  });

  if (!producto) throw new HttpError(404, 'Producto no encontrado');

  return convertDecimals(producto);
}

async function createProducto({ nombre, descripcion, precioBase, cantidad, sku, idCategoria, idSubcategoria, componentes = [] }) {
  const catId = parseId(idCategoria, 'idCategoria');
  const subCatId = parseId(idSubcategoria, 'idSubcategoria');
  const comps = await validateComponentes(componentes);
  const normalizedSku = sku?.trim() || null;

  await Promise.all([
    validateCategoria(catId),
    validateSubcategoria(subCatId, catId),
    assertSkuDisponible(normalizedSku),
  ]);

  const producto = await prisma.producto.create({
    data: {
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      precioBase: parseNonNegativeInt(precioBase, 'Precio'),
      cantidad: parsePositiveInt(cantidad ?? 1, 'Cantidad'),
      sku: normalizedSku,
      idCategoria: catId,
      idSubcategoria: subCatId,
      estado: 'activo',
      ...(comps.length > 0 && {
        componentes: {
          create: comps.map((componente) => ({
            idComponente: componente.idComponente,
            cantidad: componente.cantidad,
            precioReferencial: componente.precioReferencial,
            observaciones: componente.observaciones,
          })),
        },
      }),
    },
    select: productoSelect,
  });

  return convertDecimals(producto);
}

async function updateProducto(idProducto, updateData) {
  const prodId = parseId(idProducto, 'idProducto');
  const existing = await prisma.producto.findFirst({
    where: { idProducto: prodId, estado: 'activo' },
    select: { idProducto: true, idCategoria: true },
  });

  if (!existing) throw new HttpError(404, 'Producto no encontrado');

  const data = {};

  if (updateData.nombre !== undefined) data.nombre = updateData.nombre.trim();
  if (updateData.descripcion !== undefined) data.descripcion = updateData.descripcion?.trim() || null;
  if (updateData.precioBase !== undefined) data.precioBase = parseNonNegativeInt(updateData.precioBase, 'Precio');
  if (updateData.cantidad !== undefined) data.cantidad = parsePositiveInt(updateData.cantidad, 'Cantidad');
  if (updateData.sku !== undefined) {
    const normalizedSku = updateData.sku?.trim() || null;
    await assertSkuDisponible(normalizedSku, prodId);
    data.sku = normalizedSku;
  }

  if (updateData.idCategoria !== undefined) {
    const catId = parseId(updateData.idCategoria, 'idCategoria');
    await validateCategoria(catId);
    data.idCategoria = catId;
  }

  if (updateData.idSubcategoria !== undefined) {
    const subCatId = parseId(updateData.idSubcategoria, 'idSubcategoria');
    if (subCatId) await validateSubcategoria(subCatId, data.idCategoria || existing.idCategoria);
    data.idSubcategoria = subCatId;
  }

  const componentes = updateData.componentes !== undefined
    ? await validateComponentes(updateData.componentes)
    : null;

  const producto = await prisma.$transaction(async (tx) => {
    if (componentes) {
      await tx.productoComponente.deleteMany({ where: { idProducto: prodId } });
      if (componentes.length > 0) {
        data.componentes = {
          create: componentes.map((componente) => ({
            idComponente: componente.idComponente,
            cantidad: componente.cantidad,
            precioReferencial: componente.precioReferencial,
            observaciones: componente.observaciones,
          })),
        };
      }
    }

    return tx.producto.update({
      where: { idProducto: prodId },
      data,
      select: productoSelect,
    });
  });

  return convertDecimals(producto);
}

async function deleteProducto(idProducto) {
  const prodId = parseId(idProducto, 'idProducto');
  const producto = await prisma.producto.findFirst({
    where: { idProducto: prodId, estado: 'activo' },
    select: { idProducto: true },
  });

  if (!producto) throw new HttpError(404, 'Producto no encontrado');

  await prisma.producto.update({
    where: { idProducto: prodId },
    data: { estado: 'inactivo' },
  });

  return { message: 'Producto eliminado' };
}

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

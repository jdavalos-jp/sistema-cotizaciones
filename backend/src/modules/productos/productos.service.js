const { prisma } = require('../../db/prisma');

async function listProductos({ take = 50, search } = {}) {
  const q = search?.trim();
  const where = q
    ? {
        OR: [
          { nombre: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
        ],
      }
    : undefined;

  return prisma.producto.findMany({
    take,
    where,
    orderBy: { idProducto: 'desc' },
    select: {
      idProducto: true,
      sku: true,
      nombre: true,
      descripcion: true,
      precioBase: true,
      estado: true,
      idCategoria: true,
      idSubcategoria: true,
    },
  });
}

async function getProductoById(idProducto) {
  return prisma.producto.findUnique({
    where: { idProducto },
    select: {
      idProducto: true,
      sku: true,
      nombre: true,
      descripcion: true,
      precioBase: true,
      estado: true,
      idCategoria: true,
      idSubcategoria: true,
    },
  });
}

module.exports = { listProductos, getProductoById };

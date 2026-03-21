const { prisma } = require('../../db/prisma');

async function listSubcategorias({ idCategoria } = {}) {
  const where = idCategoria ? { idCategoria } : undefined;
  return prisma.subcategoria.findMany({
    where,
    orderBy: { idSubcategoria: 'desc' },
    select: {
      idSubcategoria: true,
      idCategoria: true,
      nombre: true,
      descripcion: true,
    },
  });
}

module.exports = { listSubcategorias };
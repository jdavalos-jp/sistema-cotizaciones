const { prisma } = require('../../db/prisma');

async function listCategorias() {
  return prisma.categoria.findMany({
    orderBy: { idCategoria: 'desc' },
    select: {
      idCategoria: true,
      nombre: true,
      descripcion: true,
      estado: true,
    },
  });
}

module.exports = { listCategorias };
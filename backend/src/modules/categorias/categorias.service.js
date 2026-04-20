const { prisma } = require('../../db/prisma');

async function listCategorias() {
  return prisma.categoria.findMany({
    orderBy: { idCategoria: 'desc' },
    include: {
      subcategorias: {
        select: {
          idSubcategoria: true,
          nombre: true,
          descripcion: true,
        },
      },
    },
  });
}

async function getCategoria(idCategoria) {
  return prisma.categoria.findUniqueOrThrow({
    where: { idCategoria: BigInt(idCategoria) },
    include: {
      subcategorias: {
        select: {
          idSubcategoria: true,
          nombre: true,
          descripcion: true,
        },
      },
    },
  });
}

async function createCategoria(payload) {
  const { nombre, descripcion, imagen } = payload;
  
  // TODO: Procesar imagen si existe (subir a storage)
  
  return prisma.categoria.create({
    data: {
      nombre,
      descripcion: descripcion || '',
      estado: 'activo',
    },
  });
}

async function updateCategoria(idCategoria, payload) {
  const { nombre, descripcion, imagen } = payload;
  
  // TODO: Procesar imagen si existe (actualizar en storage)
  
  return prisma.categoria.update({
    where: { idCategoria: BigInt(idCategoria) },
    data: {
      nombre,
      descripcion: descripcion || '',
    },
  });
}

async function deleteCategoria(idCategoria) {
  return prisma.categoria.delete({
    where: { idCategoria: BigInt(idCategoria) },
  });
}

module.exports = { listCategorias, getCategoria, createCategoria, updateCategoria, deleteCategoria };
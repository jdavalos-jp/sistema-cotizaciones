const { prisma } = require('../../db/prisma');

function rotuloWhere(search) {
  const value = search?.trim();
  if (!value) return undefined;

  return {
    OR: [
      { nombre: { contains: value, mode: 'insensitive' } },
      { cargo: { contains: value, mode: 'insensitive' } },
      { correo: { contains: value, mode: 'insensitive' } },
      { telefono: { contains: value, mode: 'insensitive' } },
      { ciudad: { contains: value, mode: 'insensitive' } },
    ],
  };
}

async function listRotulos({ take = 50, skip = 0, search } = {}) {
  const where = rotuloWhere(search);
  const [items, total] = await Promise.all([
    prisma.rotulo.findMany({ take, skip, where, orderBy: { fechaCreacion: 'desc' } }),
    prisma.rotulo.count({ where }),
  ]);

  return { items, total };
}

async function getRotuloById(idRotulo) {
  return prisma.rotulo.findUnique({ where: { idRotulo } });
}

async function createRotulo(payload, idUsuarioCreador) {
  return prisma.rotulo.create({
    data: { ...payload, idUsuarioCreador },
  });
}

async function updateRotulo(idRotulo, payload) {
  return prisma.rotulo.update({
    where: { idRotulo },
    data: payload,
  });
}

async function deleteRotulo(idRotulo) {
  return prisma.rotulo.delete({ where: { idRotulo } });
}

module.exports = { listRotulos, getRotuloById, createRotulo, updateRotulo, deleteRotulo };

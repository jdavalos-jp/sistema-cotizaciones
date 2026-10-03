const { prisma } = require('../../db/prisma');

function cartaWhere(search) {
  const value = search?.trim();
  if (!value) return undefined;

  return {
    OR: [
      { numero: { contains: value, mode: 'insensitive' } },
      { destinatario: { contains: value, mode: 'insensitive' } },
      { institucion: { contains: value, mode: 'insensitive' } },
      { referencia: { contains: value, mode: 'insensitive' } },
      { estado: { contains: value, mode: 'insensitive' } },
    ],
  };
}

async function listCartas({ take = 50, skip = 0, search } = {}) {
  const where = cartaWhere(search);
  const [items, total] = await Promise.all([
    prisma.carta.findMany({ take, skip, where, orderBy: { fechaActualizacion: 'desc' } }),
    prisma.carta.count({ where }),
  ]);
  return { items, total };
}

async function getCartaById(idCarta) {
  return prisma.carta.findUnique({ where: { idCarta } });
}

async function createCarta(payload, idUsuarioCreador) {
  return prisma.carta.create({ data: { ...payload, idUsuarioCreador } });
}

async function updateCarta(idCarta, payload) {
  return prisma.carta.update({ where: { idCarta }, data: payload });
}

async function deleteCarta(idCarta) {
  return prisma.carta.delete({ where: { idCarta } });
}

module.exports = { listCartas, getCartaById, createCarta, updateCarta, deleteCarta };

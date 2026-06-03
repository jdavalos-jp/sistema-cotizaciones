const { prisma } = require('../../db/prisma');

async function listClientes({ take = 50, skip = 0, search } = {}) {
  const q = search?.trim();
  const where = q
    ? {
        OR: [
          { nombreCompleto: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { telefono: { contains: q, mode: 'insensitive' } },
          { institucion: { contains: q, mode: 'insensitive' } },
          { ciudad: { contains: q, mode: 'insensitive' } },
        ],
      }
    : undefined;

  const [items, total] = await Promise.all([
    prisma.cliente.findMany({
      take,
      skip,
      where,
      orderBy: { idCliente: 'desc' },
    }),
    prisma.cliente.count({ where }),
  ]);

  return { items, total };
}

async function getClienteById(idCliente) {
  return prisma.cliente.findUnique({
    where: { idCliente },
  });
}

async function createCliente(payload) {
  return prisma.cliente.create({
    data: payload,
  });
}

async function updateCliente(idCliente, payload) {
  return prisma.cliente.update({
    where: { idCliente },
    data: payload,
  });
}

async function deleteCliente(idCliente) {
  return prisma.cliente.delete({
    where: { idCliente },
  });
}

module.exports = {
  listClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
};

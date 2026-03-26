const { prisma } = require('../../db/prisma');

async function listClientes({ take = 50, search } = {}) {
  const q = search?.trim();
  const where = q
    ? {
        OR: [
          { nombreCompleto: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { telefono: { contains: q, mode: 'insensitive' } },
        ],
      }
    : undefined;

  return prisma.cliente.findMany({
    take,
    where,
    orderBy: { idCliente: 'desc' },
  });
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

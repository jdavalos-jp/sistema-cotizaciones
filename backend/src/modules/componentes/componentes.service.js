const { prisma } = require('../../db/prisma');

async function listComponentes({ take = 50, search } = {}) {
  const q = search?.trim();
  const where = q
    ? {
        OR: [
          { nombre: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
        ],
      }
    : undefined;

  return prisma.componente.findMany({
    take,
    where,
    orderBy: { idComponente: 'desc' },
    select: {
      idComponente: true,
      sku: true,
      nombre: true,
      descripcion: true,
      precioBase: true,
      estado: true,
    },
  });
}

async function getComponenteById(idComponente) {
  return prisma.componente.findUnique({
    where: { idComponente },
    select: {
      idComponente: true,
      sku: true,
      nombre: true,
      descripcion: true,
      precioBase: true,
      estado: true,
    },
  });
}

module.exports = { listComponentes, getComponenteById };

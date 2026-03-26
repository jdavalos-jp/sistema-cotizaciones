const { prisma } = require('../../db/prisma');

async function listComponentes({ take = 50, skip = 0, search } = {}) {
  const q = search?.trim();
  const where = q
    ? {
        OR: [
          { nombre: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
        ],
      }
    : undefined;

  const [componentes, total] = await Promise.all([
    prisma.componente.findMany({
      take,
      skip,
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
    }),
    prisma.componente.count({ where }),
  ]);

  // Mapear precioBase a precio_base
  const data = componentes.map((c) => ({
    idComponente: c.idComponente,
    sku: c.sku,
    nombre: c.nombre,
    descripcion: c.descripcion,
    precio_base: Number(c.precioBase),
    estado: c.estado,
  }));

  return { data, total };
}

async function getComponenteById(idComponente) {
  const componente = await prisma.componente.findUnique({
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

  if (!componente) return null;

  // Mapear a snake_case
  return {
    idComponente: componente.idComponente,
    sku: componente.sku,
    nombre: componente.nombre,
    descripcion: componente.descripcion,
    precio_base: Number(componente.precioBase),
    estado: componente.estado,
  };
}

module.exports = { listComponentes, getComponenteById };

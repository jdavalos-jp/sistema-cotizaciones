const { prisma } = require('../../db/prisma');

function certificadoWhere(search) {
  const value = search?.trim();
  if (!value) return undefined;

  return {
    OR: [
      { codigo: { contains: value, mode: 'insensitive' } },
      { clienteEntidad: { contains: value, mode: 'insensitive' } },
      { objetoContratacion: { contains: value, mode: 'insensitive' } },
      { estado: { contains: value, mode: 'insensitive' } },
    ],
  };
}

function certificadoData(payload) {
  const { items, ...certificado } = payload;
  return {
    ...certificado,
    ...(items === undefined ? {} : {
      items: {
        create: items.map(({ ordenVisual, ...item }) => ({ ...item, ordenVisual })),
      },
    }),
  };
}

async function listCertificados({ take = 50, skip = 0, search } = {}) {
  const where = certificadoWhere(search);
  const [items, total] = await Promise.all([
    prisma.certificado.findMany({
      take,
      skip,
      where,
      include: { items: { orderBy: { ordenVisual: 'asc' } } },
      orderBy: { fechaActualizacion: 'desc' },
    }),
    prisma.certificado.count({ where }),
  ]);
  return { items, total };
}

async function getCertificadoById(idCertificado) {
  return prisma.certificado.findUnique({
    where: { idCertificado },
    include: { items: { orderBy: { ordenVisual: 'asc' } } },
  });
}

async function createCertificado(payload, idUsuarioCreador) {
  return prisma.certificado.create({
    data: { ...certificadoData(payload), idUsuarioCreador },
    include: { items: { orderBy: { ordenVisual: 'asc' } } },
  });
}

async function updateCertificado(idCertificado, payload) {
  const { items, ...certificado } = payload;
  return prisma.certificado.update({
    where: { idCertificado },
    data: {
      ...certificado,
      ...(items === undefined ? {} : {
        items: {
          deleteMany: {},
          create: items.map(({ ordenVisual, ...item }) => ({ ...item, ordenVisual })),
        },
      }),
    },
    include: { items: { orderBy: { ordenVisual: 'asc' } } },
  });
}

async function deleteCertificado(idCertificado) {
  return prisma.certificado.delete({ where: { idCertificado } });
}

module.exports = { listCertificados, getCertificadoById, createCertificado, updateCertificado, deleteCertificado };

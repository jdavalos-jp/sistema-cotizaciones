const { prisma } = require('../../db/prisma');

function where(search) {
  const value = search?.trim();
  return value ? { OR: [{ numero: { contains: value, mode: 'insensitive' } }, { codigo: { contains: value, mode: 'insensitive' } }, { clienteEntidad: { contains: value, mode: 'insensitive' } }, { institucion: { contains: value, mode: 'insensitive' } }, { objetoContratacion: { contains: value, mode: 'insensitive' } }, { estado: { contains: value, mode: 'insensitive' } }] } : undefined;
}
const include = { items: { orderBy: { ordenVisual: 'asc' } } };
async function listNotas({ take = 50, skip = 0, search } = {}) { const filter = where(search); const [items, total] = await Promise.all([prisma.nota.findMany({ take, skip, where: filter, include, orderBy: { fechaActualizacion: 'desc' } }), prisma.nota.count({ where: filter })]); return { items, total }; }
async function getNotaById(idNota) { return prisma.nota.findUnique({ where: { idNota }, include }); }
async function createNota(payload, idUsuarioCreador) { const { items, ...nota } = payload; return prisma.nota.create({ data: { ...nota, idUsuarioCreador, items: { create: items } }, include }); }
async function updateNota(idNota, payload) { const { items, ...nota } = payload; return prisma.nota.update({ where: { idNota }, data: { ...nota, ...(items === undefined ? {} : { items: { deleteMany: {}, create: items } }) }, include }); }
async function deleteNota(idNota) { return prisma.nota.delete({ where: { idNota } }); }
module.exports = { listNotas, getNotaById, createNota, updateNota, deleteNota };

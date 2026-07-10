const { prisma } = require('../../db/prisma');
const { HttpError } = require('../../utils/httpError');
const { hashPassword, normalizeRole } = require('../auth/auth.service');

const userSelect = {
  idUsuario: true,
  nombre: true,
  apellido: true,
  email: true,
  telefono: true,
  rol: true,
  estado: true,
  fechaCreacion: true,
};

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function toUserDto(usuario) {
  if (!usuario) return usuario;
  return {
    ...usuario,
    idUsuario: usuario.idUsuario?.toString?.() ?? usuario.idUsuario,
  };
}

function parseUserId(value) {
  try {
    const id = BigInt(value);
    if (id <= 0n) throw new Error('invalid');
    return id;
  } catch {
    throw new HttpError(400, 'idUsuario invalido');
  }
}

async function listUsuarios({ search } = {}) {
  const q = String(search || '').trim();
  const where = q
    ? {
        OR: [
          { nombre: { contains: q, mode: 'insensitive' } },
          { apellido: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      }
    : {};

  const usuarios = await prisma.usuario.findMany({
    where,
    select: userSelect,
    orderBy: { fechaCreacion: 'desc' },
  });

  return usuarios.map(toUserDto);
}

async function createUsuario({ nombre, apellido, email, telefono, password, rol }) {
  const normalizedEmail = normalizeEmail(email);
  const existing = await prisma.usuario.findUnique({ where: { email: normalizedEmail } });

  if (existing) {
    throw new HttpError(409, 'El email ya esta registrado');
  }

  const usuario = await prisma.usuario.create({
    data: {
      nombre: String(nombre).trim(),
      apellido: apellido ? String(apellido).trim() : null,
      email: normalizedEmail,
      telefono: telefono ? String(telefono).trim() : null,
      passwordHash: await hashPassword(password),
      rol: normalizeRole(rol),
      estado: 'activo',
    },
    select: userSelect,
  });

  return toUserDto(usuario);
}

async function updateUsuario(idUsuario, data) {
  const id = parseUserId(idUsuario);

  const existing = await prisma.usuario.findUnique({
    where: { idUsuario: id },
    select: { idUsuario: true, email: true },
  });

  if (!existing) {
    throw new HttpError(404, 'Usuario no encontrado');
  }

  const updateData = {};

  if (data.nombre !== undefined) updateData.nombre = String(data.nombre).trim();
  if (data.apellido !== undefined) updateData.apellido = data.apellido ? String(data.apellido).trim() : null;
  if (data.telefono !== undefined) updateData.telefono = data.telefono ? String(data.telefono).trim() : null;
  if (data.rol !== undefined) updateData.rol = normalizeRole(data.rol);
  if (data.estado !== undefined) updateData.estado = String(data.estado).trim();

  if (data.email !== undefined) {
    const normalizedEmail = normalizeEmail(data.email);
    const conflict = await prisma.usuario.findUnique({ where: { email: normalizedEmail } });

    if (conflict && conflict.idUsuario !== id) {
      throw new HttpError(409, 'El email ya esta registrado');
    }

    updateData.email = normalizedEmail;
  }

  if (data.password) {
    updateData.passwordHash = await hashPassword(data.password);
  }

  const usuario = await prisma.usuario.update({
    where: { idUsuario: id },
    data: updateData,
    select: userSelect,
  });

  return toUserDto(usuario);
}

async function deactivateUsuario(idUsuario) {
  const id = parseUserId(idUsuario);

  const usuario = await prisma.usuario.update({
    where: { idUsuario: id },
    data: { estado: 'inactivo' },
    select: userSelect,
  });

  return toUserDto(usuario);
}

async function getUsuarioById(idUsuario) {
  const id = parseUserId(idUsuario);
  const usuario = await prisma.usuario.findUnique({
    where: { idUsuario: id },
    select: userSelect,
  });

  if (!usuario) {
    throw new HttpError(404, 'Usuario no encontrado');
  }

  return toUserDto(usuario);
}

module.exports = {
  listUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deactivateUsuario,
};

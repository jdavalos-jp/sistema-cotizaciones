const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { prisma } = require('../../db/prisma');
const { HttpError } = require('../../utils/httpError');

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-muy-seguro-cambia-esto';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

/**
 * Hash de contraseña
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Comparar contraseña con hash
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generar JWT token
 */
function generateToken(userId, email, rol = 'user') {
  return jwt.sign(
    {
      userId: userId.toString(),
      email,
      rol,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

/**
 * Verificar JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new HttpError(401, 'Token inválido o expirado');
  }
}

/**
 * Registrar usuario
 */
async function registerUser(nombre, email, password) {
  // Validar que el usuario no exista
  const existingUser = await prisma.usuario.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new HttpError(400, 'El email ya está registrado');
  }

  // Hash de contraseña
  const passwordHash = await hashPassword(password);

  // Crear usuario
  const usuario = await prisma.usuario.create({
    data: {
      nombre,
      email,
      passwordHash,
      rol: 'admin', // Por defecto admin para MVP
      estado: 'activo',
    },
  });

  return {
    idUsuario: usuario.idUsuario.toString(),
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
  };
}

/**
 * Login usuario
 */
async function loginUser(email, password) {
  // Buscar usuario
  const usuario = await prisma.usuario.findUnique({
    where: { email },
  });

  if (!usuario) {
    throw new HttpError(401, 'Email o contraseña incorrectos');
  }

  // Verificar contraseña
  const isPasswordValid = await comparePassword(password, usuario.passwordHash);
  if (!isPasswordValid) {
    throw new HttpError(401, 'Email o contraseña incorrectos');
  }

  // Verificar estado
  if (usuario.estado !== 'activo') {
    throw new HttpError(403, 'Usuario inactivo');
  }

  // Generar token
  const token = generateToken(usuario.idUsuario, usuario.email, usuario.rol);

  return {
    token,
    usuario: {
      idUsuario: usuario.idUsuario.toString(),
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    },
  };
}

/**
 * Obtener usuario actual del token
 */
async function getCurrentUser(userId) {
  const usuario = await prisma.usuario.findUnique({
    where: { idUsuario: BigInt(userId) },
    select: {
      idUsuario: true,
      nombre: true,
      email: true,
      rol: true,
      estado: true,
    },
  });

  if (!usuario) {
    throw new HttpError(404, 'Usuario no encontrado');
  }

  return usuario;
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  registerUser,
  loginUser,
  getCurrentUser,
  JWT_SECRET,
  JWT_EXPIRY,
};

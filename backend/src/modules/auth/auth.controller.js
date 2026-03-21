const { HttpError } = require('../../utils/httpError');
const { validate } = require('../../utils/validationSchemas');
const { registerUser, loginUser, getCurrentUser } = require('./auth.service');
const { z } = require('zod');

// Schemas
const RegisterSchema = z.object({
  nombre: z.string().min(3, 'Nombre debe tener al menos 3 caracteres').max(100),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres').max(255),
});

const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

/**
 * POST /auth/register
 * Registrar nuevo usuario
 */
async function register(req, res) {
  const validated = validate(RegisterSchema, req.body);

  const usuario = await registerUser(validated.nombre, validated.email, validated.password);

  res.status(201).json({
    ok: true,
    message: 'Usuario registrado correctamente',
    data: usuario,
  });
}

/**
 * POST /auth/login
 * Login usuario
 */
async function login(req, res) {
  const validated = validate(LoginSchema, req.body);

  const result = await loginUser(validated.email, validated.password);

  res.json({
    ok: true,
    message: 'Login exitoso',
    data: result,
  });
}

/**
 * GET /auth/me
 * Obtener usuario actual (requiere token)
 */
async function getCurrentUserHandler(req, res) {
  const userId = req.userId; // Viene del middleware de JWT
  const usuario = await getCurrentUser(userId);

  res.json({
    ok: true,
    data: usuario,
  });
}

/**
 * POST /auth/logout
 * Logout (principalmente para frontend)
 */
async function logout(req, res) {
  // El token se elimina en el lado del cliente
  res.json({
    ok: true,
    message: 'Logout exitoso',
  });
}

module.exports = {
  register,
  login,
  getCurrentUserHandler,
  logout,
};

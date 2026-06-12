const { validate } = require('../../utils/validationSchemas');
const { registerUser, bootstrapAdmin, loginUser, getCurrentUser } = require('./auth.service');
const { z } = require('zod');

const RegisterSchema = z.object({
  nombre: z.string().min(3, 'Nombre debe tener al menos 3 caracteres').max(100),
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'Contrasena debe tener al menos 6 caracteres').max(255),
  rol: z.enum(['administrador', 'vendedor']).optional().default('vendedor'),
});

const LoginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(1, 'Contrasena requerida'),
});

async function register(req, res) {
  const validated = validate(RegisterSchema, req.body);

  const usuario = await registerUser(
    validated.nombre,
    validated.email,
    validated.password,
    validated.rol
  );

  res.status(201).json({
    ok: true,
    message: 'Usuario registrado correctamente',
    data: usuario,
  });
}

async function bootstrap(req, res) {
  const validated = validate(RegisterSchema.omit({ rol: true }), req.body);
  const usuario = await bootstrapAdmin(validated.nombre, validated.email, validated.password);

  res.status(201).json({
    ok: true,
    message: 'Administrador inicial creado correctamente',
    data: usuario,
  });
}

async function login(req, res) {
  const validated = validate(LoginSchema, req.body);
  const result = await loginUser(validated.email, validated.password);

  res.json({
    ok: true,
    message: 'Login exitoso',
    data: result,
  });
}

async function getCurrentUserHandler(req, res) {
  const usuario = await getCurrentUser(req.userId);

  res.json({
    ok: true,
    data: usuario,
  });
}

async function logout(req, res) {
  res.json({
    ok: true,
    message: 'Logout exitoso',
  });
}

module.exports = {
  register,
  bootstrap,
  login,
  getCurrentUserHandler,
  logout,
};

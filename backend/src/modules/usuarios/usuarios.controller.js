const { z } = require('zod');

const { validate } = require('../../utils/validationSchemas');
const service = require('./usuarios.service');

const roleSchema = z.enum(['administrador', 'vendedor']);

const CreateUsuarioSchema = z.object({
  nombre: z.string().min(2).max(100),
  apellido: z.string().max(100).optional().nullable(),
  email: z.string().email(),
  telefono: z.string().max(30).optional().nullable(),
  password: z.string().min(6).max(255),
  rol: roleSchema,
});

const UpdateUsuarioSchema = z.object({
  nombre: z.string().min(2).max(100).optional(),
  apellido: z.string().max(100).optional().nullable(),
  email: z.string().email().optional(),
  telefono: z.string().max(30).optional().nullable(),
  password: z.string().min(6).max(255).optional().or(z.literal('')),
  rol: roleSchema.optional(),
  estado: z.enum(['activo', 'inactivo']).optional(),
});

async function list(req, res) {
  const data = await service.listUsuarios({ search: req.query.search });
  res.json({ ok: true, data });
}

async function getById(req, res) {
  const data = await service.getUsuarioById(req.params.id);
  res.json({ ok: true, data });
}

async function create(req, res) {
  const payload = validate(CreateUsuarioSchema, req.body);
  const data = await service.createUsuario(payload);
  res.status(201).json({ ok: true, data });
}

async function update(req, res) {
  const payload = validate(UpdateUsuarioSchema, req.body);
  const data = await service.updateUsuario(req.params.id, payload);
  res.json({ ok: true, data });
}

async function remove(req, res) {
  const data = await service.deactivateUsuario(req.params.id);
  res.json({ ok: true, data });
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};

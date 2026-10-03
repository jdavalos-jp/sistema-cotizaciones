const { HttpError } = require('../../utils/httpError');
const {
  listRotulos,
  getRotuloById,
  createRotulo,
  updateRotulo,
  deleteRotulo,
} = require('./rotulos.service');
const { createRotuloSchema, updateRotuloSchema, formatZodError } = require('./rotulos.validation');

function parseId(value, label = 'id_rótulo') {
  try {
    const id = BigInt(value);
    if (id <= 0n) throw new Error('invalid');
    return id;
  } catch {
    throw new HttpError(400, `${label} inválido`);
  }
}

function parseBody(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) throw new HttpError(400, formatZodError(result.error));
  return result.data;
}

function mapPrismaError(error) {
  if (error?.code === 'P2025') throw new HttpError(404, 'Rótulo no encontrado');
  if (error?.code === 'P2003') throw new HttpError(400, 'El cliente seleccionado no existe');
  throw error;
}

async function list(req, res) {
  const take = Number(req.query.take ?? 50);
  const skip = Number(req.query.skip ?? 0);
  const safeTake = Number.isFinite(take) ? Math.min(Math.max(take, 1), 200) : 50;
  const safeSkip = Number.isFinite(skip) ? Math.max(skip, 0) : 0;
  const search = req.query.search ? String(req.query.search) : undefined;
  const { items, total } = await listRotulos({ take: safeTake, skip: safeSkip, search });

  res.json({ ok: true, data: items, meta: { total, take: safeTake, skip: safeSkip } });
}

async function getById(req, res) {
  const data = await getRotuloById(parseId(req.params.id));
  if (!data) throw new HttpError(404, 'Rótulo no encontrado');
  res.json({ ok: true, data });
}

async function create(req, res) {
  const payload = parseBody(createRotuloSchema, req.body);
  const idUsuarioCreador = parseId(req.userId, 'usuario');

  try {
    const data = await createRotulo(payload, idUsuarioCreador);
    res.status(201).json({ ok: true, data });
  } catch (error) {
    mapPrismaError(error);
  }
}

async function update(req, res) {
  const idRotulo = parseId(req.params.id);
  const payload = parseBody(updateRotuloSchema, req.body);

  try {
    const data = await updateRotulo(idRotulo, payload);
    res.json({ ok: true, data });
  } catch (error) {
    mapPrismaError(error);
  }
}

async function remove(req, res) {
  try {
    await deleteRotulo(parseId(req.params.id));
    res.status(204).send();
  } catch (error) {
    mapPrismaError(error);
  }
}

module.exports = { list, getById, create, update, remove };

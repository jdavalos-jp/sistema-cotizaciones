const { HttpError } = require('../../utils/httpError');
const {
  listCartas,
  getCartaById,
  createCarta,
  updateCarta,
  deleteCarta,
} = require('./cartas.service');
const { createCartaSchema, updateCartaSchema, formatZodError } = require('./cartas.validation');

function parseId(value, label = 'id_carta') {
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
  if (error?.code === 'P2025') throw new HttpError(404, 'Carta no encontrada');
  if (error?.code === 'P2003') throw new HttpError(400, 'El cliente seleccionado no existe');
  throw error;
}

async function list(req, res) {
  const take = Number(req.query.take ?? 50);
  const skip = Number(req.query.skip ?? 0);
  const safeTake = Number.isFinite(take) ? Math.min(Math.max(take, 1), 200) : 50;
  const safeSkip = Number.isFinite(skip) ? Math.max(skip, 0) : 0;
  const search = req.query.search ? String(req.query.search) : undefined;
  const { items, total } = await listCartas({ take: safeTake, skip: safeSkip, search });

  res.json({ ok: true, data: items, meta: { total, take: safeTake, skip: safeSkip } });
}

async function getById(req, res) {
  const data = await getCartaById(parseId(req.params.id));
  if (!data) throw new HttpError(404, 'Carta no encontrada');
  res.json({ ok: true, data });
}

async function create(req, res) {
  const payload = parseBody(createCartaSchema, req.body);
  const idUsuarioCreador = parseId(req.userId, 'usuario');

  try {
    const data = await createCarta(payload, idUsuarioCreador);
    res.status(201).json({ ok: true, data });
  } catch (error) {
    mapPrismaError(error);
  }
}

async function update(req, res) {
  const idCarta = parseId(req.params.id);
  const payload = parseBody(updateCartaSchema, req.body);

  try {
    const data = await updateCarta(idCarta, payload);
    res.json({ ok: true, data });
  } catch (error) {
    mapPrismaError(error);
  }
}

async function remove(req, res) {
  try {
    await deleteCarta(parseId(req.params.id));
    res.status(204).send();
  } catch (error) {
    mapPrismaError(error);
  }
}

module.exports = { list, getById, create, update, remove };

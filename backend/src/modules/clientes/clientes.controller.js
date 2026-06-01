const {
  listClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
} = require('./clientes.service');

const { HttpError } = require('../../utils/httpError');
const {
  createClienteSchema,
  updateClienteSchema,
  formatZodError,
} = require('./clientes.validation');

function parseId(param) {
  try {
    const id = BigInt(param);
    if (id <= 0n) throw new Error('invalid');
    return id;
  } catch {
    throw new HttpError(400, 'id_cliente invalido');
  }
}

function parseClienteBody(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new HttpError(400, formatZodError(result.error));
  }

  return result.data;
}

function mapPrismaError(err) {
  if (err?.code === 'P2025') {
    throw new HttpError(404, 'Cliente no encontrado');
  }

  if (err?.code === 'P2003') {
    throw new HttpError(409, 'No se puede eliminar: tiene cotizaciones relacionadas');
  }

  throw err;
}

async function list(req, res) {
  const take = req.query.take ? Number(req.query.take) : 50;
  const skip = req.query.skip ? Number(req.query.skip) : 0;
  const safeTake = Number.isFinite(take) ? Math.min(Math.max(take, 1), 200) : 50;
  const safeSkip = Number.isFinite(skip) ? Math.max(skip, 0) : 0;
  const search = req.query.search ? String(req.query.search) : undefined;

  const { items, total } = await listClientes({ take: safeTake, skip: safeSkip, search });

  res.json({
    ok: true,
    data: items,
    meta: {
      total,
      take: safeTake,
      skip: safeSkip,
    },
  });
}

async function getById(req, res) {
  const idCliente = parseId(req.params.id);
  const data = await getClienteById(idCliente);
  if (!data) throw new HttpError(404, 'Cliente no encontrado');
  res.json({ ok: true, data });
}

async function create(req, res) {
  const payload = parseClienteBody(createClienteSchema, req.body);
  const data = await createCliente(payload);
  res.status(201).json({ ok: true, data });
}

async function update(req, res) {
  const idCliente = parseId(req.params.id);
  const payload = parseClienteBody(updateClienteSchema, req.body);

  try {
    const data = await updateCliente(idCliente, payload);
    res.json({ ok: true, data });
  } catch (err) {
    mapPrismaError(err);
  }
}

async function remove(req, res) {
  const idCliente = parseId(req.params.id);

  try {
    await deleteCliente(idCliente);
    res.status(204).send();
  } catch (err) {
    mapPrismaError(err);
  }
}

module.exports = { list, getById, create, update, remove };

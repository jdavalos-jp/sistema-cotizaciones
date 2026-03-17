const {
  listClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
} = require('./clientes.service');

const { HttpError } = require('../../utils/httpError');

function parseId(param) {
  try {
    return BigInt(param);
  } catch {
    throw new HttpError(400, 'id_cliente inválido');
  }
}

function normalizeClienteBody(body) {
  const nombreCompleto = typeof body?.nombreCompleto === 'string' ? body.nombreCompleto.trim() : '';
  if (!nombreCompleto) throw new HttpError(400, 'nombreCompleto es requerido');

  const idInstitucion =
    body?.idInstitucion === null || body?.idInstitucion === undefined || body?.idInstitucion === ''
      ? null
      : (() => {
          try {
            return BigInt(body.idInstitucion);
          } catch {
            throw new HttpError(400, 'idInstitucion inválido');
          }
        })();

  return {
    nombreCompleto,
    telefono: body?.telefono ? String(body.telefono).trim() : null,
    email: body?.email ? String(body.email).trim() : null,
    ciudad: body?.ciudad ? String(body.ciudad).trim() : null,
    cargo: body?.cargo ? String(body.cargo).trim() : null,
    idInstitucion,
    direccion: body?.direccion ? String(body.direccion).trim() : null,
    observaciones: body?.observaciones ? String(body.observaciones).trim() : null,
  };
}

async function list(req, res) {
  const take = req.query.take ? Number(req.query.take) : 50;
  const safeTake = Number.isFinite(take) ? Math.min(Math.max(take, 1), 200) : 50;
  const search = req.query.search ? String(req.query.search) : undefined;
  const data = await listClientes({ take: safeTake, search });
  res.json({ ok: true, data });
}

async function getById(req, res) {
  const idCliente = parseId(req.params.id);
  const data = await getClienteById(idCliente);
  if (!data) throw new HttpError(404, 'Cliente no encontrado');
  res.json({ ok: true, data });
}

async function create(req, res) {
  const payload = normalizeClienteBody(req.body);
  const data = await createCliente(payload);
  res.status(201).json({ ok: true, data });
}

async function update(req, res) {
  const idCliente = parseId(req.params.id);
  const payload = normalizeClienteBody(req.body);
  const data = await updateCliente(idCliente, payload);
  res.json({ ok: true, data });
}

async function remove(req, res) {
  const idCliente = parseId(req.params.id);
  try {
    await deleteCliente(idCliente);
    res.status(204).send();
  } catch (err) {
    // Si hay cotizaciones apuntando al cliente, Postgres puede rechazar el delete.
    const msg = String(err?.message ?? err);
    if (msg.toLowerCase().includes('foreign key') || msg.toLowerCase().includes('constraint')) {
      throw new HttpError(409, 'No se puede eliminar: tiene cotizaciones relacionadas');
    }
    throw err;
  }
}

module.exports = { list, getById, create, update, remove };

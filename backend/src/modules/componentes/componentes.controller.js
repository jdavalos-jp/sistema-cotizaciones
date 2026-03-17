const { HttpError } = require('../../utils/httpError');
const { listComponentes, getComponenteById } = require('./componentes.service');

function parseId(param) {
  try {
    return BigInt(param);
  } catch {
    throw new HttpError(400, 'id_componente inválido');
  }
}

async function list(req, res) {
  const take = req.query.take ? Number(req.query.take) : 50;
  const safeTake = Number.isFinite(take) ? Math.min(Math.max(take, 1), 200) : 50;
  const search = req.query.search ? String(req.query.search) : undefined;

  const data = await listComponentes({ take: safeTake, search });
  res.json({ ok: true, data });
}

async function getById(req, res) {
  const idComponente = parseId(req.params.id);
  const data = await getComponenteById(idComponente);
  if (!data) throw new HttpError(404, 'Componente no encontrado');
  res.json({ ok: true, data });
}

module.exports = { list, getById };

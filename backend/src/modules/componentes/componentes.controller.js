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
  const skip = req.query.skip ? Number(req.query.skip) : 0;
  const safeTake = Number.isFinite(take) ? Math.min(Math.max(take, 1), 200) : 50;
  const safeSkip = Number.isFinite(skip) && skip >= 0 ? skip : 0;
  const search = req.query.search ? String(req.query.search) : undefined;

  const { data, total } = await listComponentes({ take: safeTake, skip: safeSkip, search });
  res.json({ ok: true, data, total });
}

async function getById(req, res) {
  const idComponente = parseId(req.params.id);
  const data = await getComponenteById(idComponente);
  if (!data) throw new HttpError(404, 'Componente no encontrado');
  res.json({ ok: true, data });
}

module.exports = { list, getById };

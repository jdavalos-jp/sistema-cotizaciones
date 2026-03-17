const { HttpError } = require('../../utils/httpError');
const { listProductos, getProductoById } = require('./productos.service');

function parseId(param) {
  try {
    return BigInt(param);
  } catch {
    throw new HttpError(400, 'id_producto inválido');
  }
}

async function list(req, res) {
  const take = req.query.take ? Number(req.query.take) : 50;
  const safeTake = Number.isFinite(take) ? Math.min(Math.max(take, 1), 200) : 50;
  const search = req.query.search ? String(req.query.search) : undefined;

  const data = await listProductos({ take: safeTake, search });
  res.json({ ok: true, data });
}

async function getById(req, res) {
  const idProducto = parseId(req.params.id);
  const data = await getProductoById(idProducto);
  if (!data) throw new HttpError(404, 'Producto no encontrado');
  res.json({ ok: true, data });
}

module.exports = { list, getById };

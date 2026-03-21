const { listSubcategorias } = require('./subcategorias.service');

async function list(req, res) {
  const idCategoria = req.query.idCategoria ? BigInt(req.query.idCategoria) : undefined;
  const data = await listSubcategorias({ idCategoria });
  res.json({ ok: true, data });
}

module.exports = { list };
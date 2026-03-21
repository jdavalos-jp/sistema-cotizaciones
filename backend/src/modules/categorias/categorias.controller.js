const { listCategorias } = require('./categorias.service');

async function list(req, res) {
  const data = await listCategorias();
  res.json({ ok: true, data });
}

module.exports = { list };
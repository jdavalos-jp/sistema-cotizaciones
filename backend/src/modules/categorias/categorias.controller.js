const { listCategorias, getCategoria, createCategoria, updateCategoria, deleteCategoria } = require('./categorias.service');

async function list(req, res) {
  const data = await listCategorias();
  res.json({ ok: true, data });
}

async function getById(req, res) {
  const { id } = req.params;
  const data = await getCategoria(id);
  res.json({ ok: true, data });
}

async function create(req, res) {
  const { nombre, descripcion } = req.body;
  const imagen = req.file;
  
  const result = await createCategoria({ nombre, descripcion, imagen });
  res.status(201).json({ ok: true, data: result });
}

async function update(req, res) {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  const imagen = req.file;
  
  const result = await updateCategoria(id, { nombre, descripcion, imagen });
  res.json({ ok: true, data: result });
}

async function remove(req, res) {
  const { id } = req.params;
  await deleteCategoria(id);
  res.json({ ok: true, message: 'Categoría eliminada' });
}

module.exports = { list, getById, create, update, remove };
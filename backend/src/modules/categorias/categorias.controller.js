const {
  listCategorias,
  getCategoria,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} = require('./categorias.service');

function parseSubcategorias(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function validarSubcategorias(subcategorias) {
  if (!Array.isArray(subcategorias)) return 'subcategorias debe ser un arreglo.';

  const nombres = new Set();

  for (const sub of subcategorias) {
    const nombre = sub.nombre?.trim();
    if (!nombre) return 'Cada subcategoría debe tener un nombre.';
    if (nombre.length < 2) return 'Cada subcategoría debe tener al menos 2 caracteres.';

    const normalized = nombre.toLowerCase();
    if (nombres.has(normalized)) return `La subcategoría "${nombre}" está duplicada.`;
    nombres.add(normalized);
  }

  return null;
}

async function list(_req, res) {
  const data = await listCategorias();
  res.json({ ok: true, data });
}

async function getById(req, res) {
  const data = await getCategoria(req.params.id);
  res.json({ ok: true, data });
}

async function create(req, res) {
  const { nombre, descripcion, estado } = req.body;
  const subcategorias = parseSubcategorias(req.body.subcategorias);

  if (!nombre?.trim()) {
    return res.status(400).json({ ok: false, message: 'El nombre es requerido.' });
  }

  const errorSubs = validarSubcategorias(subcategorias);
  if (errorSubs) {
    return res.status(400).json({ ok: false, message: errorSubs });
  }

  const data = await createCategoria({ nombre, descripcion, estado, subcategorias });
  res.status(201).json({ ok: true, data });
}

async function update(req, res) {
  const { nombre, descripcion, estado } = req.body;
  const subcategorias = parseSubcategorias(req.body.subcategorias);

  const errorSubs = validarSubcategorias(subcategorias);
  if (errorSubs) {
    return res.status(400).json({ ok: false, message: errorSubs });
  }

  const data = await updateCategoria(req.params.id, {
    nombre,
    descripcion,
    estado,
    subcategorias,
  });

  res.json({ ok: true, data });
}

async function remove(req, res) {
  await deleteCategoria(req.params.id);
  res.json({ ok: true, message: 'Categoría eliminada.' });
}

module.exports = { list, getById, create, update, remove };

const { HttpError } = require('../../utils/httpError');
const {
  getCategorias,
  getCategoriesWithSubcategories,
  getSubcategoriasByCategoria,
  listProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
} = require('./productos.service');
const {
  createProductoSchema,
  updateProductoSchema,
  formatZodError,
} = require('./productos.validation');

function parseId(param, fieldName = 'id') {
  try {
    const id = BigInt(param);
    if (id <= 0n) throw new Error('invalid');
    return id;
  } catch {
    throw new HttpError(400, `${fieldName} invalido`);
  }
}

function parseProductoBody(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new HttpError(400, formatZodError(result.error));
  }

  return result.data;
}

function mapPrismaError(err) {
  if (err?.statusCode || err?.status) throw err;

  if (err?.code === 'P2025') {
    throw new HttpError(404, 'Producto no encontrado');
  }

  if (err?.code === 'P2002') {
    const fields = Array.isArray(err?.meta?.target) ? err.meta.target.join(', ') : 'valor unico';
    throw new HttpError(409, `Ya existe un producto con ese ${fields}`);
  }

  if (err?.code === 'P2003') {
    throw new HttpError(409, 'No se puede completar la operacion por registros relacionados');
  }

  throw err;
}

async function listCategorias(_req, res) {
  const data = await getCategorias();
  res.json({ ok: true, data });
}

async function listCategoriasConSubcategorias(_req, res) {
  const data = await getCategoriesWithSubcategories();
  res.json({ ok: true, data });
}

async function listSubcategorias(req, res) {
  const idCategoria = parseId(req.params.idCategoria, 'idCategoria');
  const data = await getSubcategoriasByCategoria(idCategoria);
  res.json({ ok: true, data });
}

async function list(req, res) {
  const take = req.query.take ? Number(req.query.take) : 50;
  const skip = req.query.skip ? Number(req.query.skip) : 0;
  const safeTake = Number.isFinite(take) ? Math.min(Math.max(take, 1), 200) : 50;
  const safeSkip = Number.isFinite(skip) && skip >= 0 ? skip : 0;

  const { data, total } = await listProductos({
    take: safeTake,
    skip: safeSkip,
    search: req.query.search ? String(req.query.search) : undefined,
    idCategoria: req.query.idCategoria,
    idSubcategoria: req.query.idSubcategoria,
  });

  res.json({
    ok: true,
    data,
    total,
    meta: {
      total,
      take: safeTake,
      skip: safeSkip,
    },
  });
}

async function getById(req, res) {
  const idProducto = parseId(req.params.id, 'idProducto');
  const data = await getProductoById(idProducto);
  res.json({ ok: true, data });
}

async function create(req, res) {
  const payload = parseProductoBody(createProductoSchema, req.body);

  try {
    const producto = await createProducto(payload);
    res.status(201).json({ ok: true, data: producto });
  } catch (err) {
    mapPrismaError(err);
  }
}

async function update(req, res) {
  const idProducto = parseId(req.params.id, 'idProducto');
  const payload = parseProductoBody(updateProductoSchema, req.body);

  try {
    const producto = await updateProducto(idProducto, payload);
    res.json({ ok: true, data: producto });
  } catch (err) {
    mapPrismaError(err);
  }
}

async function deleteOne(req, res) {
  const idProducto = parseId(req.params.id, 'idProducto');

  try {
    await deleteProducto(idProducto);
    res.json({ ok: true, message: 'Producto eliminado' });
  } catch (err) {
    mapPrismaError(err);
  }
}

module.exports = {
  listCategorias,
  listCategoriasConSubcategorias,
  listSubcategorias,
  list,
  getById,
  create,
  update,
  deleteOne,
};

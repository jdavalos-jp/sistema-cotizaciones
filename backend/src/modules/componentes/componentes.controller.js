const { HttpError } = require('../../utils/httpError');
const { validate, CreateComponenteSchema, UpdateComponenteSchema } = require('../../utils/validationSchemas');
const {
  listComponentes,
  getComponenteById,
  createComponente,
  updateComponente,
  deleteComponente,
  addProductToComponente,
  getProductsInComponente,
  removeProductFromComponente,
  updateProductInComponente,
} = require('./componentes.service');

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
  const componente = await getComponenteById(BigInt(req.params.id));
  res.json({ ok: true, data: componente });
}

async function create(req, res) {
  const validatedData = validate(CreateComponenteSchema, req.body);
  const componente = await createComponente(validatedData);
  res.status(201).json({ ok: true, data: componente });
}

async function update(req, res) {
  const validatedData = validate(UpdateComponenteSchema, req.body);
  const componente = await updateComponente(req.params.id, validatedData);
  res.json({ ok: true, data: componente });
}

async function deleteOne(req, res) {
  const result = await deleteComponente(req.params.id);
  res.json({ ok: true, data: result });
}

// ==================== PRODUCTO_COMPONENTE HANDLERS ====================

async function addProduct(req, res) {
  const { idProducto, cantidad, precioReferencial, observaciones } = req.body;
  const idComponente = req.params.id;

  if (!idProducto) throw new HttpError(400, 'idProducto es requerido');

  const result = await addProductToComponente(idComponente, idProducto, {
    cantidad,
    precioReferencial,
    observaciones,
  });

  res.status(201).json({ ok: true, data: result });
}

async function getProducts(req, res) {
  const idComponente = req.params.id;
  const products = await getProductsInComponente(idComponente);
  res.json({ ok: true, data: products });
}

async function removeProduct(req, res) {
  const idProductoComponente = req.params.relId;
  const result = await removeProductFromComponente(idProductoComponente);
  res.json({ ok: true, data: result });
}

async function updateProduct(req, res) {
  const idProductoComponente = req.params.relId;
  const { cantidad, precioReferencial, observaciones } = req.body;

  const result = await updateProductInComponente(idProductoComponente, {
    cantidad,
    precioReferencial,
    observaciones,
  });

  res.json({ ok: true, data: result });
}

module.exports = { list, getById, create, update, deleteOne, addProduct, getProducts, removeProduct, updateProduct };

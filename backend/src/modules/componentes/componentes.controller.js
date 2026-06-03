const { HttpError } = require('../../utils/httpError');
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
  deleteComponenteImage,
} = require('./componentes.service');
const {
  createComponenteSchema,
  updateComponenteSchema,
  addProductoComponenteSchema,
  updateProductoComponenteSchema,
  formatZodError,
} = require('./componentes.validation');

function parseId(param, fieldName = 'id') {
  try {
    const id = BigInt(param);
    if (id <= 0n) throw new Error('invalid');
    return id;
  } catch {
    throw new HttpError(400, `${fieldName} invalido`);
  }
}

function parseBody(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new HttpError(400, formatZodError(result.error));
  }

  return result.data;
}

function mapPrismaError(err) {
  if (err?.statusCode || err?.status) throw err;

  if (err?.code === 'P2025') {
    throw new HttpError(404, 'Registro no encontrado');
  }

  if (err?.code === 'P2002') {
    const fields = Array.isArray(err?.meta?.target) ? err.meta.target.join(', ') : 'valor unico';
    throw new HttpError(409, `Ya existe un componente con ese ${fields}`);
  }

  if (err?.code === 'P2003') {
    throw new HttpError(409, 'No se puede completar la operacion por registros relacionados');
  }

  throw err;
}

async function list(req, res) {
  const take = req.query.take ? Number(req.query.take) : 50;
  const skip = req.query.skip ? Number(req.query.skip) : 0;
  const safeTake = Number.isFinite(take) ? Math.min(Math.max(take, 1), 200) : 50;
  const safeSkip = Number.isFinite(skip) && skip >= 0 ? skip : 0;
  const search = req.query.search ? String(req.query.search) : undefined;

  const { data, total } = await listComponentes({ take: safeTake, skip: safeSkip, search });

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
  const idComponente = parseId(req.params.id, 'idComponente');
  const componente = await getComponenteById(idComponente);
  res.json({ ok: true, data: componente });
}

async function create(req, res) {
  const payload = parseBody(createComponenteSchema, req.body);

  try {
    const componente = await createComponente(payload);
    res.status(201).json({ ok: true, data: componente });
  } catch (err) {
    mapPrismaError(err);
  }
}

async function update(req, res) {
  const idComponente = parseId(req.params.id, 'idComponente');
  const payload = parseBody(updateComponenteSchema, req.body);

  try {
    const componente = await updateComponente(idComponente, payload);
    res.json({ ok: true, data: componente });
  } catch (err) {
    mapPrismaError(err);
  }
}

async function deleteOne(req, res) {
  const idComponente = parseId(req.params.id, 'idComponente');

  try {
    const result = await deleteComponente(idComponente);
    res.json({ ok: true, data: result });
  } catch (err) {
    mapPrismaError(err);
  }
}

async function addProduct(req, res) {
  const idComponente = parseId(req.params.id, 'idComponente');
  const payload = parseBody(addProductoComponenteSchema, req.body);

  try {
    const result = await addProductToComponente(idComponente, payload.idProducto, {
      cantidad: payload.cantidad,
      precioReferencial: payload.precioReferencial,
      observaciones: payload.observaciones,
    });
    res.status(201).json({ ok: true, data: result });
  } catch (err) {
    mapPrismaError(err);
  }
}

async function getProducts(req, res) {
  const idComponente = parseId(req.params.id, 'idComponente');
  const products = await getProductsInComponente(idComponente);
  res.json({ ok: true, data: products });
}

async function removeProduct(req, res) {
  const idProductoComponente = parseId(req.params.relId, 'idProductoComponente');
  const result = await removeProductFromComponente(idProductoComponente);
  res.json({ ok: true, data: result });
}

async function updateProduct(req, res) {
  const idProductoComponente = parseId(req.params.relId, 'idProductoComponente');
  const payload = parseBody(updateProductoComponenteSchema, req.body);
  const result = await updateProductInComponente(idProductoComponente, payload);
  res.json({ ok: true, data: result });
}

async function deleteImage(req, res) {
  const idImagen = parseId(req.params.idImagen, 'idImagen');
  const result = await deleteComponenteImage(idImagen);
  res.json({ ok: true, data: result });
}

module.exports = {
  list,
  getById,
  create,
  update,
  deleteOne,
  addProduct,
  getProducts,
  removeProduct,
  updateProduct,
  deleteImage,
};

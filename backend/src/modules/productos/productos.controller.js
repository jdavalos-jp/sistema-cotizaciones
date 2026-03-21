const { HttpError } = require('../../utils/httpError');
const { validate, CreateProductoSchema, UpdateProductoSchema } = require('../../utils/validationSchemas');
const {
  getCategorias,
  getSubcategoriasByCategoria,
  listProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
  addImagenToProducto,
  deleteImagenFromProducto,
} = require('./productos.service');

/**
 * GET /productos/categorias
 * Obtener todas las categorías para filtros
 */
async function listCategorias(req, res) {
  const data = await getCategorias();
  res.json({ ok: true, data });
}

/**
 * GET /productos/subcategorias/:idCategoria
 * Obtener subcategorías de una categoría
 */
async function listSubcategorias(req, res) {
  const { idCategoria } = req.params;
  const data = await getSubcategoriasByCategoria(idCategoria);
  res.json({ ok: true, data });
}

/**
 * GET /productos
 * Listar productos con filtros
 */
async function list(req, res) {
  const take = req.query.take ? Number(req.query.take) : 50;
  const skip = req.query.skip ? Number(req.query.skip) : 0;
  const safeTake = Number.isFinite(take) ? Math.min(Math.max(take, 1), 200) : 50;
  const safeSkip = Number.isFinite(skip) && skip >= 0 ? skip : 0;
  const search = req.query.search ? String(req.query.search) : undefined;
  const idCategoria = req.query.idCategoria;
  const idSubcategoria = req.query.idSubcategoria;

  const { data, total } = await listProductos({
    take: safeTake,
    skip: safeSkip,
    search,
    idCategoria,
    idSubcategoria,
  });
  res.json({ ok: true, data, total });
}

/**
 * GET /productos/:id
 * Obtener producto por ID
 */
async function getById(req, res) {
  try {
    const idProducto = BigInt(req.params.id);
    const data = await getProductoById(idProducto);
    res.json({ ok: true, data });
  } catch (err) {
    throw new HttpError(400, 'ID de producto inválido');
  }
}

/**
 * POST /productos
 * Crear nuevo producto
 */
async function create(req, res) {
  // Validar con Zod
  const validated = validate(CreateProductoSchema, req.body);
  
  const producto = await createProducto({
    nombre: validated.nombre,
    descripcion: validated.descripcion,
    precioBase: validated.precioBase,
    cantidad: validated.cantidad,
    sku: validated.sku,
    idCategoria: validated.idCategoria,
    idSubcategoria: validated.idSubcategoria,
    imagenPrincipal: validated.imagenPrincipal,
  });

  res.status(201).json({ ok: true, data: producto });
}

/**
 * PUT /productos/:id
 * Actualizar producto
 */
async function update(req, res) {
  try {
    const idProducto = BigInt(req.params.id);
    
    // Validar con Zod
    const validated = validate(UpdateProductoSchema, req.body);

    const producto = await updateProducto(idProducto, {
      nombre: validated.nombre,
      descripcion: validated.descripcion,
      precioBase: validated.precioBase,
      cantidad: validated.cantidad,
      sku: validated.sku,
      idCategoria: validated.idCategoria,
      idSubcategoria: validated.idSubcategoria,
    });

    res.json({ ok: true, data: producto });
  } catch (err) {
    if (err.statusCode) throw err;
    throw new HttpError(400, 'ID de producto inválido');
  }
}

/**
 * DELETE /productos/:id
 * Eliminar producto
 */
async function deleteOne(req, res) {
  try {
    const idProducto = BigInt(req.params.id);
    await deleteProducto(idProducto);
    res.json({ ok: true, message: 'Producto eliminado' });
  } catch (err) {
    throw new HttpError(400, 'ID de producto inválido');
  }
}

/**
 * POST /productos/:id/imagenes
 * Agregar imagen a producto
 */
async function addImagen(req, res) {
  try {
    const idProducto = BigInt(req.params.id);
    const { urlImagen, principal = false, orden = 1 } = req.body;

    if (!urlImagen) {
      throw new HttpError(400, 'URL de imagen requerida');
    }

    const imagen = await addImagenToProducto(idProducto, {
      urlImagen,
      principal,
      orden,
    });

    res.status(201).json({ ok: true, data: imagen });
  } catch (err) {
    throw new HttpError(400, 'ID de producto inválido');
  }
}

/**
 * DELETE /productos/imagenes/:idImagen
 * Eliminar imagen de producto
 */
async function deleteImagen(req, res) {
  try {
    const idImagen = BigInt(req.params.idImagen);
    await deleteImagenFromProducto(idImagen);
    res.json({ ok: true, message: 'Imagen eliminada' });
  } catch (err) {
    throw new HttpError(400, 'ID de imagen inválido');
  }
}

module.exports = {
  listCategorias,
  listSubcategorias,
  list,
  getById,
  create,
  update,
  deleteOne,
  addImagen,
  deleteImagen,
};

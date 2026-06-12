const express = require('express');

const { asyncHandler } = require('../../utils/asyncHandler');
const { requireAdmin } = require('../../middlewares/auth.middleware');
const controller = require('./productos.controller');

const router = express.Router();

// Obtener categorías para filtros
router.get('/categorias/list', asyncHandler(controller.listCategorias));

// Obtener categorías con subcategorías (una sola query - evita N+1)
router.get('/categorias-con-subcategorias', asyncHandler(controller.listCategoriasConSubcategorias));

// Obtener subcategorías por categoría
router.get('/subcategorias/:idCategoria', asyncHandler(controller.listSubcategorias));

// Listar productos
router.get('/', asyncHandler(controller.list));

// Obtener producto por ID
router.get('/:id', asyncHandler(controller.getById));

// Crear producto
router.post('/', requireAdmin, asyncHandler(controller.create));

// Actualizar producto
router.put('/:id', requireAdmin, asyncHandler(controller.update));

// Eliminar producto
router.delete('/:id', requireAdmin, asyncHandler(controller.deleteOne));

// ⚠️ IMÁGENES: Usar /productos/:idProducto/imagenes via imagenes.routes.js en su lugar

module.exports = { router };

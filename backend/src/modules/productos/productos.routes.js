const express = require('express');

const { asyncHandler } = require('../../utils/asyncHandler');
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
router.post('/', asyncHandler(controller.create));

// Actualizar producto
router.put('/:id', asyncHandler(controller.update));

// Eliminar producto
router.delete('/:id', asyncHandler(controller.deleteOne));

// ⚠️ IMÁGENES: Usar /productos/:idProducto/imagenes via imagenes.routes.js en su lugar

module.exports = { router };

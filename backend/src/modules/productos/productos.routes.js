const express = require('express');

const { asyncHandler } = require('../../utils/asyncHandler');
const controller = require('./productos.controller');

const router = express.Router();

// Obtener categorías para filtros
router.get('/categorias/list', asyncHandler(controller.listCategorias));

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

// Agregar imagen a producto
router.post('/:id/imagenes', asyncHandler(controller.addImagen));

// Eliminar imagen de producto
router.delete('/imagenes/:idImagen', asyncHandler(controller.deleteImagen));

module.exports = { router };

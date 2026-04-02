const express = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const controller = require('./componentes.controller');

const router = express.Router();

// Rutas GET
router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getById));
router.get('/:id/productos', asyncHandler(controller.getProducts));

// Rutas CRUD
router.post('/', asyncHandler(controller.create));
router.put('/:id', asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.deleteOne));

// Rutas de relación producto_componente
router.post('/:id/productos', asyncHandler(controller.addProduct));
router.delete('/:id/productos/:relId', asyncHandler(controller.removeProduct));
router.put('/:id/productos/:relId', asyncHandler(controller.updateProduct));

// ✅ BUG FIX #4: Ruta para eliminar imagen de componente
router.delete('/imagenes/:idImagen', asyncHandler(controller.deleteImage));

module.exports = { router };

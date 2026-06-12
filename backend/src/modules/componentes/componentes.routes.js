const express = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { requireAdmin } = require('../../middlewares/auth.middleware');
const controller = require('./componentes.controller');

const router = express.Router();

// Rutas GET
router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getById));
router.get('/:id/productos', asyncHandler(controller.getProducts));

// Rutas CRUD
router.post('/', requireAdmin, asyncHandler(controller.create));
router.put('/:id', requireAdmin, asyncHandler(controller.update));
router.delete('/:id', requireAdmin, asyncHandler(controller.deleteOne));

// Rutas de relación producto_componente
router.post('/:id/productos', requireAdmin, asyncHandler(controller.addProduct));
router.delete('/:id/productos/:relId', requireAdmin, asyncHandler(controller.removeProduct));
router.put('/:id/productos/:relId', requireAdmin, asyncHandler(controller.updateProduct));

// ✅ BUG FIX #4: Ruta para eliminar imagen de componente
router.delete('/imagenes/:idImagen', requireAdmin, asyncHandler(controller.deleteImage));

module.exports = { router };

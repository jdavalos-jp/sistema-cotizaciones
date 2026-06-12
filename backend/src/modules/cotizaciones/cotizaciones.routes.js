const express = require('express');

const { asyncHandler } = require('../../utils/asyncHandler');
const { requireAdmin } = require('../../middlewares/auth.middleware');
const controller = require('./cotizaciones.controller');

const router = express.Router();

// RUTAS ESPECÍFICAS PRIMERO (más restrictivas)

// POST: Crear cotización y descargar PDF
router.post('/pdf/create', asyncHandler(controller.createPdf));

// POST: Preview para UI (sin guardar cambios)
router.post('/preview/data', asyncHandler(controller.preview));

// RUTAS GENÉRICAS DESPUÉS

// GET: Listar todas las cotizaciones
router.get('/', asyncHandler(controller.getAllCotizacionesHandler));

// POST: Crear cotización (guardar en borrador)
router.post('/', asyncHandler(controller.createCotizacion));

// GET: Descargar PDF de una cotización existente
router.get('/:idCotizacion/pdf', asyncHandler(controller.getCotizacionPdf));

// PUT: Actualizar cotización (productos, componentes, etc.)
router.put('/:idCotizacion', asyncHandler(controller.updateCotizacionHandler));

// PATCH: Cambiar estado de cotización
router.patch('/:idCotizacion/status', asyncHandler(controller.changeStatusHandler));

// DELETE: Eliminar cotización (solo borradores)
router.delete('/:idCotizacion', requireAdmin, asyncHandler(controller.deleteCotizacionHandler));

// GET: Obtener una cotización específica (ÚLTIMA - la más genérica)
router.get('/:idCotizacion', asyncHandler(controller.getCotizacionByIdHandler));

module.exports = { router };

const express = require('express');

const { asyncHandler } = require('../../utils/asyncHandler');
const controller = require('./cotizaciones.controller');

const router = express.Router();

// GET: Listar todas las cotizaciones
router.get('/', asyncHandler(controller.getAllCotizacionesHandler));

// GET: Obtener una cotización específica
router.get('/:idCotizacion', asyncHandler(controller.getCotizacionByIdHandler));

// POST: Crear cotización (guardar en borrador)
router.post('/', asyncHandler(controller.createCotizacion));

// POST: Crear cotización y descargar PDF
router.post('/pdf/create', asyncHandler(controller.createPdf));

// GET: Descargar PDF de una cotización existente
router.get('/:idCotizacion/pdf', asyncHandler(controller.getCotizacionPdf));

// PUT: Actualizar cotización (productos, componentes, etc.)
router.put('/:idCotizacion', asyncHandler(controller.updateCotizacionHandler));

// PATCH: Cambiar estado de cotización
router.patch('/:idCotizacion/status', asyncHandler(controller.changeStatusHandler));

// DELETE: Eliminar cotización (solo borradores)
router.delete('/:idCotizacion', asyncHandler(controller.deleteCotizacionHandler));

// POST: Preview para UI (sin guardar cambios)
router.post('/preview/data', asyncHandler(controller.preview));

module.exports = { router };

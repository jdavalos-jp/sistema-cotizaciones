const express = require('express');

const { asyncHandler } = require('../../utils/asyncHandler');
const controller = require('./cotizaciones.controller');

const router = express.Router();

// Crea una cotización (borrador) con productos/componentes y devuelve el PDF.
router.post('/pdf', asyncHandler(controller.createPdf));

// Preview para UI: devuelve líneas y totales (sin generar PDF).
router.post('/preview', asyncHandler(controller.preview));

module.exports = { router };

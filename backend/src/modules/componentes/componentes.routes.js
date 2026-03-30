const express = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const controller = require('./componentes.controller');

const router = express.Router();

// Rutas GET
router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getById));

// Rutas CRUD
router.post('/', asyncHandler(controller.create));
router.put('/:id', asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.deleteOne));

module.exports = { router };

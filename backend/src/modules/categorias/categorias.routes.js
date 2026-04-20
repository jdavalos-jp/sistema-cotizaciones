const express = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { uploadSingle } = require('../../middlewares/uploadMiddleware');
const controller = require('./categorias.controller');

const router = express.Router();

router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getById));
router.post('/', uploadSingle('imagen'), asyncHandler(controller.create));
router.put('/:id', uploadSingle('imagen'), asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.remove));

module.exports = { router };
const express = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { requireAdmin } = require('../../middlewares/auth.middleware');
const { uploadSingle } = require('../../middlewares/uploadMiddleware');
const controller = require('./categorias.controller');

const router = express.Router();

router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getById));
router.post('/', requireAdmin, uploadSingle('imagen'), asyncHandler(controller.create));
router.put('/:id', requireAdmin, uploadSingle('imagen'), asyncHandler(controller.update));
router.delete('/:id', requireAdmin, asyncHandler(controller.remove));

module.exports = { router };

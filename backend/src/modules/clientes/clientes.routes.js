const express = require('express');

const { asyncHandler } = require('../../utils/asyncHandler');
const { requireAdmin } = require('../../middlewares/auth.middleware');
const controller = require('./clientes.controller');

const router = express.Router();

router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getById));
router.post('/', asyncHandler(controller.create));
router.put('/:id', requireAdmin, asyncHandler(controller.update));
router.delete('/:id', requireAdmin, asyncHandler(controller.remove));

module.exports = { router };

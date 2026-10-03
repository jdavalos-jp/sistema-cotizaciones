const express = require('express');

const { asyncHandler } = require('../../utils/asyncHandler');
const { requireRoles } = require('../../middlewares/auth.middleware');
const controller = require('./rotulos.controller');

const router = express.Router();
const canManageRotulos = requireRoles('administrador', 'vendedor');

router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getById));
router.post('/', canManageRotulos, asyncHandler(controller.create));
router.put('/:id', canManageRotulos, asyncHandler(controller.update));
router.delete('/:id', canManageRotulos, asyncHandler(controller.remove));

module.exports = { router };

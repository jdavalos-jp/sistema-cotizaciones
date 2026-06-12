const express = require('express');

const { requireAdmin } = require('../../middlewares/auth.middleware');
const { asyncHandler } = require('../../utils/asyncHandler');
const controller = require('./usuarios.controller');

const router = express.Router();

router.use(requireAdmin);

router.get('/', asyncHandler(controller.list));
router.post('/', asyncHandler(controller.create));
router.put('/:id', asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.remove));

module.exports = { router };

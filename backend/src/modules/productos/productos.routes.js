const express = require('express');

const { asyncHandler } = require('../../utils/asyncHandler');
const controller = require('./productos.controller');

const router = express.Router();

router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getById));

module.exports = { router };

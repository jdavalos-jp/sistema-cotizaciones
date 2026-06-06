const express = require('express');

const { asyncHandler } = require('../../utils/asyncHandler');
const controller = require('./dashboard.controller');

const router = express.Router();

router.get('/summary', asyncHandler(controller.summary));

module.exports = { router };

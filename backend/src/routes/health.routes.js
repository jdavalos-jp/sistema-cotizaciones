const express = require('express');

const { asyncHandler } = require('../utils/asyncHandler');
const { health, dbHealth } = require('../controllers/health.controller');

const router = express.Router();

router.get('/health', asyncHandler(health));
router.get('/db/health', asyncHandler(dbHealth));

module.exports = { router };

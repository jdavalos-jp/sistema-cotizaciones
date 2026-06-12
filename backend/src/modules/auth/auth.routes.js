const express = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { requireAdmin, verifyJwtToken } = require('../../middlewares/auth.middleware');
const controller = require('./auth.controller');

const router = express.Router();

// Public routes
router.post('/login', asyncHandler(controller.login));
router.post('/logout', asyncHandler(controller.logout));
router.post('/bootstrap-admin', asyncHandler(controller.bootstrap));

// Protected routes
router.get('/me', verifyJwtToken, asyncHandler(controller.getCurrentUserHandler));
router.post('/register', verifyJwtToken, requireAdmin, asyncHandler(controller.register));

module.exports = { router };

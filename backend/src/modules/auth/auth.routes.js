const express = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { verifyJwtToken } = require('../../middlewares/auth.middleware');
const controller = require('./auth.controller');

const router = express.Router();

// Public routes
router.post('/register', asyncHandler(controller.register));
router.post('/login', asyncHandler(controller.login));
router.post('/logout', asyncHandler(controller.logout));

// Protected routes
router.get('/me', verifyJwtToken, asyncHandler(controller.getCurrentUserHandler));

module.exports = { router };

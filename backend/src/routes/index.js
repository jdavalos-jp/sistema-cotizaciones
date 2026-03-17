const express = require('express');

const { router: healthRoutes } = require('./health.routes');
const { router: apiRoutes } = require('./api.routes');

const router = express.Router();

router.use(healthRoutes);
router.use('/api', apiRoutes);

module.exports = { router };

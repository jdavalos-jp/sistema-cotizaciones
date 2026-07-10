const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { router } = require('./routes');
const { notFound, errorHandler } = require('./middlewares/error.middleware');
const { env } = require('./config/env');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Demasiadas solicitudes, intenta de nuevo más tarde' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Demasiados intentos de inicio de sesión, intenta de nuevo más tarde' },
});

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(morgan('short'));

  app.set('json replacer', (_key, value) => (typeof value === 'bigint' ? value.toString() : value));

  app.use(cors({
    origin: env.allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(express.json({ limit: '2mb' }));

  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/bootstrap-admin', authLimiter);
  app.use('/api', limiter);

  app.use(router);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };

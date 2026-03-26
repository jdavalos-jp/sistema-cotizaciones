const express = require('express');
const cors = require('cors');

const { router } = require('./routes');
const { notFound, errorHandler } = require('./middlewares/error.middleware');
const { env } = require('./config/env');

function createApp() {
  const app = express();

  // Prisma usa BigInt en IDs; esto evita que res.json() crashee.
  app.set('json replacer', (_key, value) => (typeof value === 'bigint' ? value.toString() : value));

  // CORS con whitelist segura
  app.use(cors({
    origin: env.allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  app.use(express.json());

  app.use(router);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };

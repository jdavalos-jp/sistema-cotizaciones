const express = require('express');
const cors = require('cors');

const { router } = require('./routes');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

function createApp() {
  const app = express();

  // Prisma usa BigInt en IDs; esto evita que res.json() crashee.
  app.set('json replacer', (_key, value) => (typeof value === 'bigint' ? value.toString() : value));

  app.use(cors());
  app.use(express.json());

  app.use(router);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };

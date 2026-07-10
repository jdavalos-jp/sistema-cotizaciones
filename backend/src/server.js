const { env } = require('./config/env');
const { createApp } = require('./app');
const { prisma, shutdown } = require('./db/prisma');
const { shutdown: redisShutdown } = require('./services/cache/redisClient');

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  shutdown().finally(() => process.exit(1));
});

const app = createApp();

let server;

async function start() {
  try {
    await prisma.$connect();
  } catch (err) {
    console.error('No se pudo autenticar/conectar a Postgres. Revisa DATABASE_URL en backend/.env.');
    console.error(err);
    await shutdown();
    process.exit(1);
  }

  server = app.listen(env.port, () => {
    console.log(`Backend listening on port ${env.port}`);
  });
}

start();

async function gracefulExit(signal) {
  try {
    await Promise.all([shutdown(), redisShutdown()]);
  } finally {
    if (!server) return process.exit(0);
    server.close(() => process.exit(0));
  }
}

process.on('SIGINT', gracefulExit);
process.on('SIGTERM', gracefulExit);

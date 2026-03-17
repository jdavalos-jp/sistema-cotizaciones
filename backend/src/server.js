const { env } = require('./config/env');
const { createApp } = require('./app');
const { prisma, shutdown } = require('./db/prisma');

const app = createApp();

let server;

async function start() {
  try {
    await prisma.$connect();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('No se pudo autenticar/conectar a Postgres. Revisa DATABASE_URL en backend/.env.');
    // eslint-disable-next-line no-console
    console.error(err);
    await shutdown();
    process.exit(1);
  }

  server = app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${env.port}`);
  });
}

start();

async function gracefulExit(signal) {
  try {
    await shutdown();
  } finally {
    if (!server) return process.exit(0);
    server.close(() => process.exit(0));
  }
}

process.on('SIGINT', gracefulExit);
process.on('SIGTERM', gracefulExit);

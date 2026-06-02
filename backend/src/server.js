const { env } = require('./config/env');
const { createApp } = require('./app');
const { prisma, shutdown } = require('./db/prisma');

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
    await shutdown();
  } finally {
    if (!server) return process.exit(0);
    server.close(() => process.exit(0));
  }
}

process.on('SIGINT', gracefulExit);
process.on('SIGTERM', gracefulExit);

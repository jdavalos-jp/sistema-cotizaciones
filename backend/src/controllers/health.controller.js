const { prisma } = require('../db/prisma');

async function health(_req, res) {
  res.json({ ok: true });
}

async function dbHealth(_req, res) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: 'up' });
  } catch (err) {
    res.status(500).json({ ok: false, db: 'down', error: String(err?.message ?? err) });
  }
}

module.exports = { health, dbHealth };

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const { requireEnv } = require('../config/env');

const connectionString = requireEnv('DATABASE_URL');

function looksLikePlaceholder(url) {
  if (!url) return true;
  return (
    url.includes('[YOUR-PASSWORD]') ||
    url.includes('USER:PASSWORD') ||
    url.includes('PASSWORD@HOST') ||
    url.includes('postgresql://USER:')
  );
}

if (looksLikePlaceholder(connectionString)) {
  throw new Error(
    'DATABASE_URL parece un placeholder. Reemplaza [YOUR-PASSWORD] por tu password real de Supabase (Project Settings -> Database).',
  );
}

const poolOptions = { connectionString };
try {
  const u = new URL(connectionString);
  const host = u.hostname || '';
  if (host.endsWith('.supabase.co') || host.endsWith('.supabase.com')) {
    poolOptions.ssl = { rejectUnauthorized: false };
  }
} catch (_e) {
  // ignore URL parsing errors; pg will validate later
}

const pool = new Pool(poolOptions);
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

async function shutdown() {
  await prisma.$disconnect().catch(() => undefined);
  await pool.end().catch(() => undefined);
}

module.exports = { prisma, shutdown };

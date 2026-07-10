const { prisma, shutdown } = require('../src/db/prisma');

async function main() {
  console.log('Instalando extensión pg_trgm...');
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

  console.log('Creando índices GIN/trigram para búsqueda full-text en clientes...');
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_clientes_nombre_trgm ON clientes USING gin (nombre_completo gin_trgm_ops)`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_clientes_email_trgm ON clientes USING gin (email gin_trgm_ops)`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_clientes_telefono_trgm ON clientes USING gin (telefono gin_trgm_ops)`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_clientes_institucion_trgm ON clientes USING gin (institucion gin_trgm_ops)`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_clientes_ciudad_trgm ON clientes USING gin (ciudad gin_trgm_ops)`);

  console.log('Creando índices GIN/trigram para productos...');
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_productos_nombre_trgm ON productos USING gin (nombre gin_trgm_ops)`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_productos_descripcion_trgm ON productos USING gin (descripcion gin_trgm_ops)`);

  console.log('Creando índices GIN/trigram para componentes...');
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_componentes_nombre_trgm ON componentes USING gin (nombre gin_trgm_ops)`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_componentes_descripcion_trgm ON componentes USING gin (descripcion gin_trgm_ops)`);

  console.log('Índices GIN/trigram creados exitosamente.');
  await shutdown();
}

main().catch((err) => {
  console.error('Error:', err.message);
  shutdown().finally(() => process.exit(1));
});

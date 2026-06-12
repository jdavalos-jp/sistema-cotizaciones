require('dotenv').config();

const { prisma, shutdown } = require('../src/db/prisma');
const { hashPassword } = require('../src/modules/auth/auth.service');

async function main() {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || '');
  const nombre = String(process.env.ADMIN_NAME || 'Administrador').trim();

  if (!email || !password) {
    throw new Error('Define ADMIN_EMAIL y ADMIN_PASSWORD para crear o actualizar el administrador');
  }

  const passwordHash = await hashPassword(password);

  const usuario = await prisma.usuario.upsert({
    where: { email },
    create: {
      nombre,
      email,
      passwordHash,
      rol: 'administrador',
      estado: 'activo',
    },
    update: {
      nombre,
      passwordHash,
      rol: 'administrador',
      estado: 'activo',
    },
    select: {
      idUsuario: true,
      nombre: true,
      email: true,
      rol: true,
      estado: true,
    },
  });

  console.log('Administrador listo:', {
    ...usuario,
    idUsuario: usuario.idUsuario.toString(),
  });
}

main()
  .catch((err) => {
    console.error(err.message || err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await shutdown();
  });

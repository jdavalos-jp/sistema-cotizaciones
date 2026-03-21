const { prisma } = require('../prismaClient');

async function resetSequence() {
  try {
    // Get max ID
    const result = await prisma.$queryRaw`SELECT MAX("id_producto") as max_id FROM "productos"`;
    const maxId = result[0]?.max_id ? Number(result[0].max_id) : 0;
    const nextId = maxId + 1;

    console.log(`Current max ID: ${maxId}`);
    console.log(`Resetting sequence to: ${nextId}`);

    // Reset the sequence
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "productos_id_producto_seq" RESTART WITH ${nextId}`);
    
    console.log('Sequence reset successfully!');

    // Verify
    const seq = await prisma.$queryRaw`SELECT last_value FROM "productos_id_producto_seq"`;
    console.log(`Verified new sequence value: ${seq[0]?.last_value}`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetSequence();

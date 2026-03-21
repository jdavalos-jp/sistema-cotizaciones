const { prisma } = require('../prismaClient');

async function checkSequence() {
  try {
    // Get max ID
    const result = await prisma.$queryRaw`SELECT MAX("id_producto") as max_id FROM "productos"`;
    console.log('Current max id_producto:', result[0]?.max_id);

    // Try to get the sequence value
    const seq = await prisma.$queryRaw`SELECT last_value FROM "productos_id_producto_seq"`;
    console.log('Current sequence value:', seq[0]?.last_value);

    // If max_id exists and is higher than sequence, need to reset
    if (result[0]?.max_id) {
      const maxId = Number(result[0].max_id);
      const seqValue = Number(seq[0]?.last_value || 0);
      
      if (maxId >= seqValue) {
        console.log(`\nSequence is out of sync! Max ID (${maxId}) >= Sequence (${seqValue})`);
        console.log(`Need to reset sequence to at least ${maxId + 1}`);
      } else {
        console.log(`\nSequence is OK. Max ID (${maxId}) < Sequence (${seqValue})`);
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSequence();

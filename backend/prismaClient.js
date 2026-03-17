const { prisma, shutdown } = require('./src/db/prisma');

module.exports = {
  prisma,
  disconnect: shutdown,
};

// middlewares/errorHandler.js
function errorHandler(err, req, res, next) {
  // Prisma: registro no encontrado
  if (err.code === 'P2025') {
    return res.status(404).json({ ok: false, message: 'Registro no encontrado.' });
  }
  // Prisma: violación de unique constraint
  if (err.code === 'P2002') {
    return res.status(409).json({ ok: false, message: 'Ya existe un registro con ese valor.' });
  }
  // Errores de negocio con status explícito (ej: nombre duplicado)
  if (err.status) {
    return res.status(err.status).json({ ok: false, message: err.message });
  }

  console.error(err);
  res.status(500).json({ ok: false, message: 'Error interno del servidor.' });
}

module.exports = { errorHandler };
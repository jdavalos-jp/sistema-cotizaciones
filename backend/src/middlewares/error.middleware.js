function notFound(_req, res) {
  res.status(404).json({ ok: false, error: 'Not Found' });
}

function errorHandler(err, _req, res, _next) {
  if (err?.code === 'P2025') {
    return res.status(404).json({ ok: false, error: 'Registro no encontrado' });
  }

  if (err?.code === 'P2002') {
    return res.status(409).json({ ok: false, error: 'Ya existe un registro con ese valor' });
  }

  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ ok: false, error: 'El archivo excede el tamaño máximo permitido' });
  }

  if (err?.name === 'ZodError' || err?.issues) {
    const details = err.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
    return res.status(400).json({
      ok: false,
      error: 'Validación fallida',
      details,
    });
  }

  const status = Number(err?.statusCode ?? err?.status ?? 500);
  const message = status >= 500
    ? 'Error interno del servidor'
    : String(err?.message ?? err ?? 'Unexpected error');

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ ok: false, error: message });
}

module.exports = { notFound, errorHandler };

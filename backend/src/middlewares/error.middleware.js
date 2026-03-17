function notFound(_req, res) {
  res.status(404).json({ ok: false, error: 'Not Found' });
}

function errorHandler(err, _req, res, _next) {
  const status = Number(err?.statusCode ?? err?.status ?? 500);
  const message = String(err?.message ?? err ?? 'Unexpected error');

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({ ok: false, error: message });
}

module.exports = { notFound, errorHandler };

const { HttpError } = require('../../utils/httpError');
const { createCotizacionWithItems } = require('./cotizaciones.service');
const { buildCotizacionPdf } = require('./cotizaciones.pdf');
const { buildCotizacionPreview } = require('./cotizaciones.preview');

async function createPdf(req, res) {
  const body = req.body ?? {};

  if (!body.idCliente) throw new HttpError(400, 'idCliente es requerido');

  const cotizacion = await createCotizacionWithItems({
    idCliente: body.idCliente,
    productos: Array.isArray(body.productos) ? body.productos : [],
    componentes: Array.isArray(body.componentes) ? body.componentes : [],
    moneda: body.moneda ?? 'Bs',
    observaciones: body.observaciones,
  });

  const pdfBuffer = await buildCotizacionPdf(cotizacion);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `inline; filename="cotizacion-${cotizacion.numeroCotizacion}.pdf"`
  );

  res.status(200).send(pdfBuffer);
}

async function preview(req, res) {
  const body = req.body ?? {};

  const data = await buildCotizacionPreview({
    idCliente: body.idCliente ?? null,
    productos: Array.isArray(body.productos) ? body.productos : [],
    componentes: Array.isArray(body.componentes) ? body.componentes : [],
    moneda: body.moneda ?? 'Bs',
  });

  res.json({ ok: true, data });
}

module.exports = { createPdf, preview };

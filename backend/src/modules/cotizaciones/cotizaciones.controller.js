const { HttpError } = require('../../utils/httpError');
const {
  createCotizacionWithItems,
  getAllCotizaciones,
  getCotizacionById,
  updateCotizacion,
  deleteCotizacion,
  changeStatus,
} = require('./cotizaciones.service');
const { buildCotizacionPdf } = require('./cotizaciones.pdf');
const { buildCotizacionPreview } = require('./cotizaciones.preview');

async function createCotizacion(req, res) {
  const body = req.body ?? {};

  if (!body.idCliente) throw new HttpError(400, 'idCliente es requerido');

  const cotizacion = await createCotizacionWithItems({
    idCliente: body.idCliente,
    productos: Array.isArray(body.productos) ? body.productos : [],
    componentes: Array.isArray(body.componentes) ? body.componentes : [],
    moneda: body.moneda ?? 'Bs',
    observaciones: body.observaciones,
    fechaValidez: body.fechaValidez,
    diasEntrega: body.diasEntrega ?? 5,
  });

  res.status(201).json({ ok: true, data: cotizacion });
}

async function createPdf(req, res) {
  const body = req.body ?? {};

  if (!body.idCliente) throw new HttpError(400, 'idCliente es requerido');

  const cotizacion = await createCotizacionWithItems({
    idCliente: body.idCliente,
    productos: Array.isArray(body.productos) ? body.productos : [],
    componentes: Array.isArray(body.componentes) ? body.componentes : [],
    moneda: body.moneda ?? 'Bs',
    observaciones: body.observaciones,
    fechaValidez: body.fechaValidez,
    diasEntrega: body.diasEntrega ?? 5,
  });

  const pdfBuffer = await buildCotizacionPdf(cotizacion);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `inline; filename="cotizacion-${cotizacion.numeroCotizacion}.pdf"`
  );

  res.status(200).send(pdfBuffer);
}

async function getAllCotizacionesHandler(req, res) {
  const skip = Math.max(0, Number(req.query.skip ?? 0));
  const take = Math.min(100, Math.max(1, Number(req.query.take ?? 50)));
  const estado = req.query.estado ?? null;

  const cotizaciones = await getAllCotizaciones({ skip, take, estado });

  res.json({ ok: true, data: cotizaciones });
}

async function getCotizacionByIdHandler(req, res) {
  const { idCotizacion } = req.params;

  const cotizacion = await getCotizacionById(idCotizacion);

  res.json({ ok: true, data: cotizacion });
}

async function updateCotizacionHandler(req, res) {
  const { idCotizacion } = req.params;
  const body = req.body ?? {};

  const cotizacion = await updateCotizacion(idCotizacion, {
    productos: Array.isArray(body.productos) ? body.productos : [],
    componentes: Array.isArray(body.componentes) ? body.componentes : [],
    moneda: body.moneda,
    observaciones: body.observaciones,
    descuento: body.descuento,
    impuestos: body.impuestos,
    diasValidez: body.diasValidez,
    diasEntrega: body.diasEntrega,
  });

  res.json({ ok: true, data: cotizacion });
}

async function deleteCotizacionHandler(req, res) {
  const { idCotizacion } = req.params;

  await deleteCotizacion(idCotizacion);

  res.json({ ok: true, message: 'Cotización eliminada' });
}

async function changeStatusHandler(req, res) {
  const { idCotizacion } = req.params;
  const { estado } = req.body;

  if (!estado) throw new HttpError(400, 'estado es requerido');

  const cotizacion = await changeStatus(idCotizacion, estado);

  res.json({ ok: true, data: cotizacion });
}

async function getCotizacionPdf(req, res) {
  const { idCotizacion } = req.params;

  const cotizacion = await getCotizacionById(idCotizacion);

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

module.exports = {
  createCotizacion,
  createPdf,
  getAllCotizacionesHandler,
  getCotizacionByIdHandler,
  updateCotizacionHandler,
  deleteCotizacionHandler,
  changeStatusHandler,
  getCotizacionPdf,
  preview,
};

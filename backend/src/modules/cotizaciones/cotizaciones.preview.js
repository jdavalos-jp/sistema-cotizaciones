const { prisma } = require('../../db/prisma');
const { HttpError } = require('../../utils/httpError');
const { toBigInt, toInt, toPriceInt } = require('./converters');

async function buildCotizacionPreview({ idCliente, productos, componentes, moneda = 'Bs' }) {
  if ((!productos || productos.length === 0) && (!componentes || componentes.length === 0)) {
    throw new HttpError(400, 'Debes seleccionar al menos un producto o componente');
  }

  const productItems = (productos ?? []).map((p, idx) => ({
    idProducto: toBigInt(p.idProducto, `productos[${idx}].idProducto`),
    cantidad: toInt(p.cantidad ?? 1, `productos[${idx}].cantidad`, { min: 1 }),
    precioUnitario: p.precioUnitario !== undefined ? toPriceInt(p.precioUnitario, `productos[${idx}].precioUnitario`) : null,
  }));

  const componentItems = (componentes ?? []).map((c, idx) => ({
    idComponente: toBigInt(c.idComponente, `componentes[${idx}].idComponente`),
    cantidad: toInt(c.cantidad ?? 1, `componentes[${idx}].cantidad`, { min: 1 }),
    precioUnitario: c.precioUnitario !== undefined ? toPriceInt(c.precioUnitario, `componentes[${idx}].precioUnitario`) : null,
  }));

  const productIds = [...new Set(productItems.map((x) => x.idProducto))];
  const componentIds = [...new Set(componentItems.map((x) => x.idComponente))];

  const [productosDb, componentesDb, cliente] = await Promise.all([
    productIds.length
      ? prisma.producto.findMany({
          where: { idProducto: { in: productIds } },
          select: { idProducto: true, sku: true, nombre: true, descripcion: true, precioBase: true },
        })
      : Promise.resolve([]),
    componentIds.length
      ? prisma.componente.findMany({
          where: { idComponente: { in: componentIds } },
          select: { idComponente: true, sku: true, nombre: true, descripcion: true, precioBase: true },
        })
      : Promise.resolve([]),
    idCliente
      ? prisma.cliente.findUnique({
          where: { idCliente: toBigInt(idCliente, 'idCliente') },
          select: { idCliente: true, nombreCompleto: true, email: true, telefono: true },
        })
      : Promise.resolve(null),
  ]);

  if (idCliente && !cliente) throw new HttpError(400, 'Cliente no encontrado');

  const productosById = new Map(productosDb.map((p) => [p.idProducto, p]));
  const componentesById = new Map(componentesDb.map((c) => [c.idComponente, c]));

  // Collect warnings for missing items instead of throwing errors
  const warnings = [];

  const missingProductIds = productIds.filter((id) => !productosById.has(id));
  if (missingProductIds.length > 0) {
    const missing = missingProductIds.map((id) => id.toString()).join(', ');
    warnings.push(`Productos eliminados (omitidos): ${missing}`);
  }

  const missingComponentIds = componentIds.filter((id) => !componentesById.has(id));
  if (missingComponentIds.length > 0) {
    const missing = missingComponentIds.map((id) => id.toString()).join(', ');
    warnings.push(`Componentes eliminados (omitidos): ${missing}`);
  }

  const lineas = [];
  let subtotal = 0;

  const removedIds = [
    ...missingProductIds.map((id) => ({ tipo: 'producto', id: id.toString() })),
    ...missingComponentIds.map((id) => ({ tipo: 'componente', id: id.toString() })),
  ];

  for (const it of productItems) {
    const p = productosById.get(it.idProducto);
    if (!p) continue; 

    const precioUnitario = it.precioUnitario ?? p.precioBase;
    const totalLinea = precioUnitario * it.cantidad;
    subtotal += totalLinea;

    lineas.push({
      tipo: 'producto',
      id: p.idProducto,
      codigo: p.sku ?? null,
      nombre: p.nombre,
      descripcion: p.descripcion ?? null,
      cantidad: it.cantidad,
      precioUnitario,
      totalLinea,
    });
  }

  for (const it of componentItems) {
    const c = componentesById.get(it.idComponente);
    if (!c) continue; 

    const precioUnitario = it.precioUnitario ?? c.precioBase;
    const totalLinea = precioUnitario * it.cantidad;
    subtotal += totalLinea;

    lineas.push({
      tipo: 'componente',
      id: c.idComponente,
      codigo: c.sku ?? null,
      nombre: c.nombre,
      descripcion: c.descripcion ?? null,
      cantidad: it.cantidad,
      precioUnitario,
      totalLinea,
    });
  }

  const descuento = 0;
  const impuestos = 0;
  const total = subtotal - descuento + impuestos;

  return {
    cliente,
    moneda,
    lineas,
    totales: {
      subtotal,
      descuento,
      impuestos,
      total,
    },
    warnings,
    removedIds,
  };
}

module.exports = { buildCotizacionPreview };

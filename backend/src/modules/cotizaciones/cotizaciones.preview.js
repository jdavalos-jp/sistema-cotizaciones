const { Prisma } = require('@prisma/client');

const { prisma } = require('../../db/prisma');
const { HttpError } = require('../../utils/httpError');

function toBigInt(value, fieldName) {
  try {
    return BigInt(value);
  } catch {
    throw new HttpError(400, `${fieldName} inválido`);
  }
}

function toInt(value, fieldName) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, `${fieldName} inválido`);
  return n;
}

function moneyDecimal(value) {
  if (value instanceof Prisma.Decimal) return value;
  if (typeof value === 'string' || typeof value === 'number') return new Prisma.Decimal(value);
  return new Prisma.Decimal(0);
}

async function buildCotizacionPreview({ idCliente, productos, componentes, moneda = 'Bs' }) {
  if ((!productos || productos.length === 0) && (!componentes || componentes.length === 0)) {
    throw new HttpError(400, 'Debes seleccionar al menos un producto o componente');
  }

  const productItems = (productos ?? []).map((p, idx) => ({
    idProducto: toBigInt(p.idProducto, `productos[${idx}].idProducto`),
    cantidad: toInt(p.cantidad ?? 1, `productos[${idx}].cantidad`),
  }));

  const componentItems = (componentes ?? []).map((c, idx) => ({
    idComponente: toBigInt(c.idComponente, `componentes[${idx}].idComponente`),
    cantidad: toInt(c.cantidad ?? 1, `componentes[${idx}].cantidad`),
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

  const lineas = [];
  let subtotal = new Prisma.Decimal(0);

  for (const it of productItems) {
    const p = productosById.get(it.idProducto);
    if (!p) throw new HttpError(400, 'Producto no encontrado');

    const precioUnitario = moneyDecimal(p.precioBase);
    const totalLinea = precioUnitario.mul(it.cantidad);
    subtotal = subtotal.plus(totalLinea);

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
    if (!c) throw new HttpError(400, 'Componente no encontrado');

    const precioUnitario = moneyDecimal(c.precioBase);
    const totalLinea = precioUnitario.mul(it.cantidad);
    subtotal = subtotal.plus(totalLinea);

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

  const descuento = new Prisma.Decimal(0);
  const impuestos = new Prisma.Decimal(0);
  const total = subtotal.minus(descuento).plus(impuestos);

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
  };
}

module.exports = { buildCotizacionPreview };

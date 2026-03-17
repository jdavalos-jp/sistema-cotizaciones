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
  // Acepta Decimal/string/number y lo normaliza a Decimal de Prisma
  if (value instanceof Prisma.Decimal) return value;
  if (typeof value === 'string' || typeof value === 'number') return new Prisma.Decimal(value);
  return new Prisma.Decimal(0);
}

function createNumeroCotizacion() {
  // <= 50 chars, único “suficientemente” para MVP
  const date = new Date();
  const ymd = date.toISOString().slice(0, 10).replaceAll('-', '');
  const rnd = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, '0');
  return `COT-${ymd}-${rnd}`;
}

async function createCotizacionWithItems({ idCliente, productos, componentes, moneda = 'Bs', observaciones }) {
  const clienteId = toBigInt(idCliente, 'idCliente');

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

  const [productosDb, componentesDb] = await Promise.all([
    productIds.length
      ? prisma.producto.findMany({ where: { idProducto: { in: productIds } } })
      : Promise.resolve([]),
    componentIds.length
      ? prisma.componente.findMany({ where: { idComponente: { in: componentIds } } })
      : Promise.resolve([]),
  ]);

  const productosById = new Map(productosDb.map((p) => [p.idProducto, p]));
  const componentesById = new Map(componentesDb.map((c) => [c.idComponente, c]));

  for (const it of productItems) {
    if (!productosById.has(it.idProducto)) throw new HttpError(400, 'Producto no encontrado');
  }
  for (const it of componentItems) {
    if (!componentesById.has(it.idComponente)) throw new HttpError(400, 'Componente no encontrado');
  }

  // Cálculos
  let subtotal = new Prisma.Decimal(0);

  const cotizacionProductosData = productItems.map((it, idx) => {
    const p = productosById.get(it.idProducto);
    const unit = moneyDecimal(p.precioBase);
    const lineSubtotal = unit.mul(it.cantidad);
    subtotal = subtotal.plus(lineSubtotal);

    return {
      idProducto: it.idProducto,
      nombreItem: p.nombre,
      descripcionItem: p.descripcion ?? null,
      cantidad: it.cantidad,
      precioUnitario: unit,
      descuento: new Prisma.Decimal(0),
      subtotal: lineSubtotal,
      ordenVisual: idx + 1,
      observaciones: null,
    };
  });

  const baseOrdenComponentes = cotizacionProductosData.length;

  const cotizacionComponentesData = componentItems.map((it, idx) => {
    const c = componentesById.get(it.idComponente);
    const unit = moneyDecimal(c.precioBase);
    const lineSubtotal = unit.mul(it.cantidad);
    subtotal = subtotal.plus(lineSubtotal);

    return {
      idComponente: it.idComponente,
      nombreItem: c.nombre,
      descripcionItem: c.descripcion ?? null,
      cantidad: it.cantidad,
      precioUnitario: unit,
      descuento: new Prisma.Decimal(0),
      subtotal: lineSubtotal,
      ordenVisual: baseOrdenComponentes + idx + 1,
      observaciones: null,
    };
  });

  const descuento = new Prisma.Decimal(0);
  const impuestos = new Prisma.Decimal(0);
  const total = subtotal.minus(descuento).plus(impuestos);

  const numeroCotizacion = createNumeroCotizacion();

  const result = await prisma.$transaction(async (tx) => {
    const cotizacion = await tx.cotizacion.create({
      data: {
        numeroCotizacion,
        idCliente: clienteId,
        estado: 'borrador',
        subtotal,
        descuento,
        impuestos,
        total,
        moneda,
        observaciones: observaciones ? String(observaciones) : null,
        terminosCondiciones: null,
        idUsuarioCreador: null,
        productos: cotizacionProductosData.length
          ? { create: cotizacionProductosData }
          : undefined,
        componentes: cotizacionComponentesData.length
          ? { create: cotizacionComponentesData }
          : undefined,
      },
      include: {
        cliente: true,
        productos: {
          include: {
            producto: {
              select: {
                sku: true,
                componentes: {
                  select: {
                    cantidad: true,
                    componente: {
                      select: {
                        nombre: true,
                      },
                    },
                  },
                  orderBy: { idProductoComponente: 'asc' },
                },
              },
            },
          },
        },
        componentes: {
          include: {
            componente: {
              select: { sku: true },
            },
          },
        },
      },
    });

    return cotizacion;
  });

  return result;
}

module.exports = { createCotizacionWithItems };

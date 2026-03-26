const { Prisma } = require('@prisma/client');

const { prisma } = require('../../db/prisma');
const { HttpError } = require('../../utils/httpError');
const { toUtcMidnightDate } = require('../../utils/dateOnly');
const { decimalToNumber } = require('./decimal-converter');

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
  // Ahora convierte a número entero en lugar de Decimal
  const num = typeof value === 'string' ? parseInt(value, 10) : Number(value);
  return Number.isInteger(num) ? num : Math.round(num);
}

function addDays(date, days) {
  try {
    let dateStr = '';
    
    if (date instanceof Date) {
      dateStr = date.toISOString().split('T')[0];
    } else if (typeof date === 'string') {
      dateStr = date.trim();
    } else {
      // Invalid date type
      return new Date(); // fallback
    }
    
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      // Invalid date format
      return new Date(); // fallback
    }
    
    // Convertir a Date usando UTC
    const d = new Date(dateStr + 'T00:00:00Z');
    
    if (Number.isNaN(d.getTime())) return new Date();
    
    // Sumar días en UTC
    const newDate = new Date(d);
    newDate.setUTCDate(newDate.getUTCDate() + days);
    return newDate;
  } catch (err) {
    // Error in addDays helper
    return new Date();
  }
}

function enriquecerCotizacion(cotizacion) {
  if (!cotizacion) return cotizacion;

  // Si no tiene fechaValidez, calcular como fechaEmision + 7 días
  if (!cotizacion.fechaValidez && cotizacion.fechaEmision) {
    cotizacion.fechaValidez = addDays(cotizacion.fechaEmision, 7);
  }

  return cotizacion;
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

async function createCotizacionWithItems({ idCliente, productos, componentes, moneda = 'Bs', observaciones, fechaValidez, diasEntrega = 5 }) {
  const clienteId = toBigInt(idCliente, 'idCliente');

  const fechaValidezDate =
    fechaValidez === null || fechaValidez === undefined || fechaValidez === ''
      ? null
      : toUtcMidnightDate(fechaValidez);
  if (fechaValidez !== null && fechaValidez !== undefined && fechaValidez !== '' && !fechaValidezDate) {
    throw new HttpError(400, 'fechaValidez inválida (usa YYYY-MM-DD o una fecha válida)');
  }

  if ((!productos || productos.length === 0) && (!componentes || componentes.length === 0)) {
    throw new HttpError(400, 'Debes seleccionar al menos un producto o componente');
  }

  const productItems = (productos ?? []).map((p, idx) => ({
    idProducto: toBigInt(p.idProducto, `productos[${idx}].idProducto`),
    cantidad: toInt(p.cantidad ?? 1, `productos[${idx}].cantidad`),
    precioUnitario: p.precioUnitario !== undefined ? moneyDecimal(p.precioUnitario) : null,
    nombre: p.nombre || undefined,
    descripcion: p.descripcion || undefined,
  }));

  const componentItems = (componentes ?? []).map((c, idx) => ({
    idComponente: toBigInt(c.idComponente, `componentes[${idx}].idComponente`),
    cantidad: toInt(c.cantidad ?? 1, `componentes[${idx}].cantidad`),
    precioUnitario: c.precioUnitario !== undefined ? moneyDecimal(c.precioUnitario) : null,
    nombre: c.nombre || undefined,
    descripcion: c.descripcion || undefined,
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
  let subtotal = 0;

  const cotizacionProductosData = productItems.map((it, idx) => {
    const p = productosById.get(it.idProducto);
    const unit = it.precioUnitario ?? moneyDecimal(p.precioBase);
    const lineSubtotal = unit * it.cantidad;
    subtotal += lineSubtotal;

    return {
      idProducto: it.idProducto,
      nombreItem: it.nombre ?? p.nombre,
      descripcionItem: it.descripcion ?? p.descripcion ?? null,
      cantidad: it.cantidad,
      precioUnitario: unit,
      descuento: 0,
      subtotal: lineSubtotal,
      ordenVisual: idx + 1,
      observaciones: null,
    };
  });

  const baseOrdenComponentes = cotizacionProductosData.length;

  const cotizacionComponentesData = componentItems.map((it, idx) => {
    const c = componentesById.get(it.idComponente);
    const unit = it.precioUnitario ?? moneyDecimal(c.precioBase);
    const lineSubtotal = unit * it.cantidad;
    subtotal += lineSubtotal;

    return {
      idComponente: it.idComponente,
      nombreItem: it.nombre ?? c.nombre,
      descripcionItem: it.descripcion ?? c.descripcion ?? null,
      cantidad: it.cantidad,
      precioUnitario: unit,
      descuento: 0,
      subtotal: lineSubtotal,
      ordenVisual: baseOrdenComponentes + idx + 1,
      observaciones: null,
    };
  });

  const descuento = 0;
  const impuestos = 0;
  const total = subtotal - descuento + impuestos;

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
        diasEntrega: diasEntrega ? Math.max(1, Number(diasEntrega)) : 5,
        fechaValidez: fechaValidezDate ?? undefined,
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

  return decimalToNumber(enriquecerCotizacion(result));
}

async function getAllCotizaciones({ skip = 0, take = 50, estado = null } = {}) {
  const where = {};
  if (estado) {
    where.estado = estado;
  }

  const cotizaciones = await prisma.cotizacion.findMany({
    where,
    skip,
    take,
    orderBy: { fechaCreacion: 'desc' },
    include: {
      cliente: true,
      usuarioCreador: {
        select: {
          idUsuario: true,
          nombre: true,
          apellido: true,
        },
      },
    },
  });

  return decimalToNumber(cotizaciones).map(enriquecerCotizacion);
}

async function getCotizacionById(idCotizacion) {
  const id = toBigInt(idCotizacion, 'idCotizacion');

  const cotizacion = await prisma.cotizacion.findUnique({
    where: { idCotizacion: id },
    include: {
      cliente: true,
      usuarioCreador: true,
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
        orderBy: { ordenVisual: 'asc' },
      },
      componentes: {
        include: {
          componente: {
            select: { sku: true },
          },
        },
        orderBy: { ordenVisual: 'asc' },
      },
    },
  });

  if (!cotizacion) {
    throw new HttpError(404, 'Cotización no encontrada');
  }

  return decimalToNumber(enriquecerCotizacion(cotizacion));
}

async function recalculateTotals(subtotal, descuento = 0, impuestos = 0) {
  const s = moneyDecimal(subtotal);
  const d = moneyDecimal(descuento);
  const i = moneyDecimal(impuestos);
  const total = s.minus(d).plus(i);

  return { subtotal: s, descuento: d, impuestos: i, total };
}

async function updateCotizacion(idCotizacion, { productos, componentes, moneda, observaciones, descuento, impuestos, diasValidez, diasEntrega } = {}) {
  const cotizacionId = toBigInt(idCotizacion, 'idCotizacion');

  // Verificar que existe la cotización
  const cotizacion = await prisma.cotizacion.findUnique({
    where: { idCotizacion: cotizacionId },
  });

  if (!cotizacion) {
    throw new HttpError(404, 'Cotización no encontrada');
  }

  // Si es borrador, permite cambios; si no, puede ser rechazado (MVP: permitir siempre)
  if (cotizacion.estado && !['borrador', 'pendiente'].includes(cotizacion.estado)) {
    throw new HttpError(400, `No se puede editar una cotización en estado ${cotizacion.estado}`);
  }

  const productItems = (productos ?? []).map((p, idx) => ({
    idProducto: toBigInt(p.idProducto, `productos[${idx}].idProducto`),
    cantidad: toInt(p.cantidad ?? 1, `productos[${idx}].cantidad`),
    precioUnitario: p.precioUnitario ? moneyDecimal(p.precioUnitario) : null,
    descuento: p.descuento ? moneyDecimal(p.descuento) : 0,
    nombre: p.nombre || undefined,
    descripcion: p.descripcion || undefined,
  }));

  const componentItems = (componentes ?? []).map((c, idx) => ({
    idComponente: toBigInt(c.idComponente, `componentes[${idx}].idComponente`),
    cantidad: toInt(c.cantidad ?? 1, `componentes[${idx}].cantidad`),
    precioUnitario: c.precioUnitario ? moneyDecimal(c.precioUnitario) : null,
    descuento: c.descuento ? moneyDecimal(c.descuento) : 0,
    nombre: c.nombre || undefined,
    descripcion: c.descripcion || undefined,
  }));

  if (productItems.length === 0 && componentItems.length === 0) {
    throw new HttpError(400, 'Debe haber al menos un producto o componente');
  }

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

  // Calcular subtotal
  let subtotal = 0;

  const cotizacionProductosData = productItems.map((it, idx) => {
    const p = productosById.get(it.idProducto);
    const unit = it.precioUnitario ?? moneyDecimal(p.precioBase);
    const lineSubtotal = unit * it.cantidad - it.descuento;
    subtotal += lineSubtotal;

    return {
      idProducto: it.idProducto,
      nombreItem: it.nombre ?? p.nombre,
      descripcionItem: it.descripcion ?? p.descripcion ?? null,
      cantidad: it.cantidad,
      precioUnitario: unit,
      descuento: it.descuento,
      subtotal: lineSubtotal,
      ordenVisual: idx + 1,
      observaciones: null,
    };
  });

  const baseOrdenComponentes = cotizacionProductosData.length;

  const cotizacionComponentesData = componentItems.map((it, idx) => {
    const c = componentesById.get(it.idComponente);
    const unit = it.precioUnitario ?? moneyDecimal(c.precioBase);
    const lineSubtotal = unit * it.cantidad - it.descuento;
    subtotal += lineSubtotal;

    return {
      idComponente: it.idComponente,
      nombreItem: it.nombre ?? c.nombre,
      descripcionItem: it.descripcion ?? c.descripcion ?? null,
      cantidad: it.cantidad,
      precioUnitario: unit,
      descuento: it.descuento,
      subtotal: lineSubtotal,
      ordenVisual: baseOrdenComponentes + idx + 1,
      observaciones: null,
    };
  });

  const desc = moneyDecimal(descuento ?? 0);
  const imp = moneyDecimal(impuestos ?? 0);
  const tot = subtotal - desc + imp;

  // Calcular fechaValidez basada en diasValidez si se proporciona
  let fechaValidezUpdate = cotizacion.fechaValidez;
  if (diasValidez !== undefined && diasValidez !== null) {
    const diasNum = Math.max(1, Number(diasValidez) || 1);
    fechaValidezUpdate = addDays(cotizacion.fechaEmision, diasNum);
  }

  const result = await prisma.$transaction(async (tx) => {
    // Eliminar items antiguos
    await tx.cotizacionProducto.deleteMany({
      where: { idCotizacion: cotizacionId },
    });
    await tx.cotizacionComponente.deleteMany({
      where: { idCotizacion: cotizacionId },
    });

    // Actualizar cotización e insertar nuevos items
    const updatedCotizacion = await tx.cotizacion.update({
      where: { idCotizacion: cotizacionId },
      data: {
        subtotal,
        descuento: desc,
        impuestos: imp,
        total: tot,
        moneda: moneda || cotizacion.moneda,
        observaciones: observaciones !== undefined ? (observaciones ? String(observaciones) : null) : cotizacion.observaciones,
        diasEntrega: diasEntrega !== undefined ? Math.max(1, Number(diasEntrega) || 1) : cotizacion.diasEntrega,
        fechaValidez: fechaValidezUpdate || undefined,
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

    return updatedCotizacion;
  });

  return decimalToNumber(enriquecerCotizacion(result));
}

async function deleteCotizacion(idCotizacion) {
  const cotizacionId = toBigInt(idCotizacion, 'idCotizacion');

  const cotizacion = await prisma.cotizacion.findUnique({
    where: { idCotizacion: cotizacionId },
  });

  if (!cotizacion) {
    throw new HttpError(404, 'Cotización no encontrada');
  }

  // Solo permite eliminar borradores (MVP)
  if (cotizacion.estado && cotizacion.estado !== 'borrador') {
    throw new HttpError(400, `No se puede eliminar una cotización en estado ${cotizacion.estado}`);
  }

  const deleted = await prisma.cotizacion.delete({
    where: { idCotizacion: cotizacionId },
  });

  return deleted;
}

async function changeStatus(idCotizacion, newStatus) {
  const cotizacionId = toBigInt(idCotizacion, 'idCotizacion');

  const validStates = ['borrador', 'enviada', 'aceptada', 'rechazada', 'cancelada'];
  if (!validStates.includes(newStatus)) {
    throw new HttpError(400, `Estado inválido: ${newStatus}`);
  }

  const cotizacion = await prisma.cotizacion.update({
    where: { idCotizacion: cotizacionId },
    data: { estado: newStatus },
    include: {
      cliente: true,
      productos: true,
      componentes: true,
    },
  });

  return decimalToNumber(enriquecerCotizacion(cotizacion));
}

module.exports = {
  createCotizacionWithItems,
  getAllCotizaciones,
  getCotizacionById,
  updateCotizacion,
  deleteCotizacion,
  changeStatus,
  recalculateTotals,
};

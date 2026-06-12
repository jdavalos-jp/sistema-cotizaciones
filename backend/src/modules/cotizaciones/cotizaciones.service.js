const { prisma } = require('../../db/prisma');
const { HttpError } = require('../../utils/httpError');
const { toUtcMidnightDate } = require('../../utils/dateOnly');
const { toBigInt, toInt, toPriceInt, validateCurrency, addDaysToDate } = require('./converters');

function enriquecerCotizacion(cotizacion) {
  if (!cotizacion) return cotizacion;

  // Si no tiene fechaValidez, calcular como fechaEmision + 7 días
  if (!cotizacion.fechaValidez && cotizacion.fechaEmision) {
    const calculated = addDaysToDate(cotizacion.fechaEmision, 7);
    if (calculated) {
      cotizacion.fechaValidez = calculated;
    }
  }

  return cotizacion;
}

function createNumeroCotizacion() {
  // <= 50 chars, único “suficientemente” para MVP
  return `${getNumeroCotizacionPrefix()}001`;
}

function getNumeroCotizacionPrefix(date = new Date()) {
  const ymd = date.toISOString().slice(0, 10).replaceAll('-', '');
  return `COT-${ymd}-`;
}

async function createNumeroCotizacionCorrelativo(tx, date = new Date()) {
  const prefix = getNumeroCotizacionPrefix(date);

  const cotizacionesDelDia = await tx.cotizacion.findMany({
    where: {
      numeroCotizacion: {
        startsWith: prefix,
      },
    },
    select: {
      numeroCotizacion: true,
    },
  });

  const usados = new Set();
  for (const cotizacion of cotizacionesDelDia) {
    const suffix = String(cotizacion.numeroCotizacion || '').slice(prefix.length);
    if (/^\d{3,6}$/.test(suffix)) {
      usados.add(Number(suffix));
    }
  }

  let correlativo = 1;
  while (usados.has(correlativo)) correlativo += 1;

  if (correlativo > 999) {
    throw new HttpError(500, 'No hay correlativos disponibles para la fecha actual');
  }

  return `${prefix}${String(correlativo).padStart(3, '0')}`;
}

function isNumeroCotizacionUniqueError(err) {
  if (err?.code !== 'P2002') return false;
  const target = err?.meta?.target;
  if (Array.isArray(target)) return target.includes('numero_cotizacion') || target.includes('numeroCotizacion');
  return String(target || '').includes('numero_cotizacion') || String(target || '').includes('numeroCotizacion');
}

async function createCotizacionWithItems({
  idCliente,
  productos,
  componentes,
  moneda = 'Bs',
  observaciones,
  fechaValidez,
  diasEntrega = 5,
  descuento = 0,
  impuestos = 0,
}) {
  const clienteId = toBigInt(idCliente, 'idCliente');
  const validMoneda = validateCurrency(moneda);
  const entrega = toInt(diasEntrega ?? 5, 'diasEntrega', { min: 1, max: 365 });

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
    cantidad: toInt(p.cantidad ?? 1, `productos[${idx}].cantidad`, { min: 1 }),
    precioUnitario: p.precioUnitario !== undefined ? toPriceInt(p.precioUnitario, `productos[${idx}].precioUnitario`) : null,
    nombre: p.nombre || undefined,
    descripcion: p.descripcion || undefined,
    observaciones: p.observaciones || undefined,
  }));

  const componentItems = (componentes ?? []).map((c, idx) => ({
    idComponente: toBigInt(c.idComponente, `componentes[${idx}].idComponente`),
    cantidad: toInt(c.cantidad ?? 1, `componentes[${idx}].cantidad`, { min: 1 }),
    precioUnitario: c.precioUnitario !== undefined ? toPriceInt(c.precioUnitario, `componentes[${idx}].precioUnitario`) : null,
    nombre: c.nombre || undefined,
    descripcion: c.descripcion || undefined,
    observaciones: c.observaciones || undefined,
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

  // Cálculos - todo en enteros
  let subtotal = 0;

  const cotizacionProductosData = productItems.map((it, idx) => {
    const p = productosById.get(it.idProducto);
    const unit = it.precioUnitario ?? p.precioBase;
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
      observaciones: it.observaciones ?? null,
    };
  });

  const baseOrdenComponentes = cotizacionProductosData.length;

  const cotizacionComponentesData = componentItems.map((it, idx) => {
    const c = componentesById.get(it.idComponente);
    const unit = it.precioUnitario ?? c.precioBase;
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
      observaciones: it.observaciones ?? null,
    };
  });

  const desc = toPriceInt(descuento ?? 0, 'descuento');
  const imp = toPriceInt(impuestos ?? 0, 'impuestos');

  if (desc > subtotal) {
    throw new HttpError(400, 'El descuento no puede ser mayor al subtotal');
  }

  const total = subtotal - desc + imp;

  let result;
  const maxNumeroRetries = 5;
  for (let attempt = 1; attempt <= maxNumeroRetries; attempt += 1) {
    try {
      result = await prisma.$transaction(async (tx) => {
        const numeroCotizacion = await createNumeroCotizacionCorrelativo(tx);

        const cotizacion = await tx.cotizacion.create({
          data: {
            numeroCotizacion,
            idCliente: clienteId,
            estado: 'borrador',
            subtotal,
            descuento: desc,
            impuestos: imp,
            total,
            moneda: validMoneda,
            observaciones: observaciones ? String(observaciones) : null,
            terminosCondiciones: null,
            idUsuarioCreador: null,
            diasEntrega: entrega,
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
                    imagenes: {
                      where: { estado: 'activo' },
                      select: { urlImagen: true, principal: true, orden: true },
                      orderBy: [{ principal: 'desc' }, { orden: 'asc' }],
                    },
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
                  select: {
                    sku: true,
                    imagenes: {
                      where: { estado: 'activo' },
                      select: { urlImagen: true, principal: true, orden: true },
                      orderBy: [{ principal: 'desc' }, { orden: 'asc' }],
                    },
                  },
                },
              },
            },
          },
        });

        return cotizacion;
      });
      break;
    } catch (err) {
      if (!isNumeroCotizacionUniqueError(err) || attempt === maxNumeroRetries) {
        throw err;
      }
    }
  }

  return enriquecerCotizacion(result);
}

async function getAllCotizaciones({ skip = 0, take = 50, estado = null } = {}) {
  const where = {};
  if (estado) {
    where.estado = estado;
  }

  const [cotizaciones, total] = await Promise.all([
    prisma.cotizacion.findMany({
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
    }),
    prisma.cotizacion.count({ where }),
  ]);

  return { data: cotizaciones.map(enriquecerCotizacion), total };
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
              imagenes: {
                where: { estado: 'activo' },
                select: { urlImagen: true, principal: true, orden: true },
                orderBy: [{ principal: 'desc' }, { orden: 'asc' }],
              },
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
            select: {
              sku: true,
              imagenes: {
                where: { estado: 'activo' },
                select: { urlImagen: true, principal: true, orden: true },
                orderBy: [{ principal: 'desc' }, { orden: 'asc' }],
              },
            },
          },
        },
        orderBy: { ordenVisual: 'asc' },
      },
    },
  });

  if (!cotizacion) {
    throw new HttpError(404, 'Cotización no encontrada');
  }

  return enriquecerCotizacion(cotizacion);
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
    cantidad: toInt(p.cantidad ?? 1, `productos[${idx}].cantidad`, { min: 1 }),
    precioUnitario: p.precioUnitario ? toPriceInt(p.precioUnitario, `productos[${idx}].precioUnitario`) : null,
    descuento: p.descuento ? toPriceInt(p.descuento, `productos[${idx}].descuento`) : 0,
    nombre: p.nombre || undefined,
    descripcion: p.descripcion || undefined,
    observaciones: p.observaciones || undefined,
  }));

  const componentItems = (componentes ?? []).map((c, idx) => ({
    idComponente: toBigInt(c.idComponente, `componentes[${idx}].idComponente`),
    cantidad: toInt(c.cantidad ?? 1, `componentes[${idx}].cantidad`, { min: 1 }),
    precioUnitario: c.precioUnitario ? toPriceInt(c.precioUnitario, `componentes[${idx}].precioUnitario`) : null,
    descuento: c.descuento ? toPriceInt(c.descuento, `componentes[${idx}].descuento`) : 0,
    nombre: c.nombre || undefined,
    descripcion: c.descripcion || undefined,
    observaciones: c.observaciones || undefined,
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

  // Calcular subtotal (todo enteros)
  let subtotal = 0;

  const cotizacionProductosData = productItems.map((it, idx) => {
    const p = productosById.get(it.idProducto);
    const unit = it.precioUnitario ?? p.precioBase;
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
      observaciones: it.observaciones ?? null,
    };
  });

  const baseOrdenComponentes = cotizacionProductosData.length;

  const cotizacionComponentesData = componentItems.map((it, idx) => {
    const c = componentesById.get(it.idComponente);
    const unit = it.precioUnitario ?? c.precioBase;
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
      observaciones: it.observaciones ?? null,
    };
  });

  const desc = toPriceInt(descuento ?? 0, 'descuento');
  const imp = toPriceInt(impuestos ?? 0, 'impuestos');
  const tot = subtotal - desc + imp;

  // Calcular fechaValidez basada en diasValidez si se proporciona
  let fechaValidezUpdate = cotizacion.fechaValidez;
  if (diasValidez !== undefined && diasValidez !== null) {
    const diasNum = Math.max(1, Number(diasValidez) || 1);
    const calculated = addDaysToDate(cotizacion.fechaEmision, diasNum);
    if (calculated) {
      fechaValidezUpdate = calculated;
    }
  }

  const validMoneda = moneda ? validateCurrency(moneda) : cotizacion.moneda;

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
        moneda: validMoneda,
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
                imagenes: {
                  where: { estado: 'activo' },
                  select: { urlImagen: true, principal: true, orden: true },
                  orderBy: [{ principal: 'desc' }, { orden: 'asc' }],
                },
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
              select: {
                sku: true,
                imagenes: {
                  where: { estado: 'activo' },
                  select: { urlImagen: true, principal: true, orden: true },
                  orderBy: [{ principal: 'desc' }, { orden: 'asc' }],
                },
              },
            },
          },
        },
      },
    });

    return updatedCotizacion;
  });

  return enriquecerCotizacion(result);
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

  return enriquecerCotizacion(cotizacion);
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

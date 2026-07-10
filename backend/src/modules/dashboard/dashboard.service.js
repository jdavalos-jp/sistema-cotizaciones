const { prisma } = require('../../db/prisma');
const { cacheGet, cacheSet } = require('../../services/cache/redisClient');

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_MS);
}

function formatDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function formatDateLabel(date) {
  return new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(date);
}

function formatTime(date) {
  return new Intl.DateTimeFormat('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/La_Paz',
  }).format(date);
}

function percentChange(current, previous) {
  if (!previous && !current) return 0;
  if (!previous) return 100;
  return Math.round(((current - previous) / previous) * 100);
}

function normalizeEstado(estado) {
  return String(estado || 'borrador').toLowerCase();
}

function estadoLabel(estado) {
  const labels = {
    borrador: 'En proceso',
    pendiente: 'En proceso',
    enviada: 'Enviada',
    aceptada: 'Aceptada',
    rechazada: 'Rechazada',
    cancelada: 'Cancelada',
  };
  return labels[normalizeEstado(estado)] || estado || 'Sin estado';
}

function formatCurrency(value, moneda = 'Bs') {
  const amount = Number(value || 0);
  return `${moneda || 'Bs'} ${amount.toLocaleString('es-BO')}`;
}

async function getDashboardSummary(forceRefresh = false) {
  const CACHE_KEY = 'dashboard:summary';
  const CACHE_TTL = 300;

  if (!forceRefresh) {
    const cached = await cacheGet(CACHE_KEY);
    if (cached) return cached;
  }

  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const currentStart = addDays(tomorrow, -30);
  const previousStart = addDays(currentStart, -30);
  const activeStates = ['borrador', 'pendiente', 'enviada'];

  const [
    productosTotal,
    componentesTotal,
    clientesTotal,
    cotizacionesActivas,
    clientesCurrent,
    clientesPrevious,
    cotizacionesCurrent,
    cotizacionesPrevious,
    estados,
    ultimasCotizaciones,
    cotizacionesPorDiaRaw,
  ] = await Promise.all([
    prisma.producto.count({ where: { estado: 'activo' } }),
    prisma.componente.count({ where: { estado: 'activo' } }),
    prisma.cliente.count(),
    prisma.cotizacion.count({ where: { estado: { in: activeStates } } }),
    prisma.cliente.count({ where: { fechaCreacion: { gte: currentStart, lt: tomorrow } } }),
    prisma.cliente.count({ where: { fechaCreacion: { gte: previousStart, lt: currentStart } } }),
    prisma.cotizacion.count({ where: { fechaCreacion: { gte: currentStart, lt: tomorrow } } }),
    prisma.cotizacion.count({ where: { fechaCreacion: { gte: previousStart, lt: currentStart } } }),
    prisma.cotizacion.groupBy({
      by: ['estado'],
      _count: { _all: true },
    }),
    prisma.cotizacion.findMany({
      take: 5,
      orderBy: { fechaCreacion: 'desc' },
      select: {
        idCotizacion: true,
        numeroCotizacion: true,
        fechaEmision: true,
        fechaCreacion: true,
        estado: true,
        total: true,
        moneda: true,
        cliente: {
          select: {
            nombreCompleto: true,
            email: true,
            telefono: true,
          },
        },
      },
    }),
    prisma.$queryRaw`
      SELECT DATE(fecha_creacion) as date, COUNT(*)::int as total
      FROM cotizaciones
      WHERE fecha_creacion >= ${currentStart} AND fecha_creacion < ${tomorrow}
      GROUP BY DATE(fecha_creacion)
      ORDER BY date
    `,
  ]);

  const cotizacionesPorDiaMap = new Map();
  for (let i = 0; i < 30; i += 1) {
    const date = addDays(currentStart, i);
    cotizacionesPorDiaMap.set(formatDateKey(date), {
      key: formatDateKey(date),
      label: formatDateLabel(date),
      total: 0,
    });
  }

  for (const item of cotizacionesPorDiaRaw) {
    const key = formatDateKey(new Date(item.date));
    const bucket = cotizacionesPorDiaMap.get(key);
    if (bucket) bucket.total = Number(item.total);
  }

  const estadoOrder = ['borrador', 'pendiente', 'enviada', 'aceptada', 'rechazada', 'cancelada'];
  const totalEstados = estados.reduce((sum, item) => sum + item._count._all, 0);
  const estadosMap = new Map(estados.map((item) => [normalizeEstado(item.estado), item._count._all]));
  const estadosCotizacion = estadoOrder
    .map((estado) => ({
      key: estado,
      label: estadoLabel(estado),
      total: estadosMap.get(estado) || 0,
      percent: totalEstados ? Math.round(((estadosMap.get(estado) || 0) / totalEstados) * 1000) / 10 : 0,
    }))
    .filter((item) => item.total > 0 || ['borrador', 'enviada', 'aceptada', 'rechazada'].includes(item.key));

  const result = {
    period: {
      from: formatDateKey(currentStart),
      to: formatDateKey(addDays(tomorrow, -1)),
      label: `${formatDateLabel(currentStart)} - ${formatDateLabel(addDays(tomorrow, -1))}`,
      updatedAt: formatTime(new Date()),
    },
    metrics: {
      productos: { label: 'Productos', value: productosTotal, change: null },
      componentes: { label: 'Componentes', value: componentesTotal, change: null },
      clientes: { label: 'Clientes', value: clientesTotal, change: percentChange(clientesCurrent, clientesPrevious) },
      cotizacionesActivas: {
        label: 'Cotizaciones Activas',
        value: cotizacionesActivas,
        change: percentChange(cotizacionesCurrent, cotizacionesPrevious),
      },
    },
    cotizacionesTiempo: Array.from(cotizacionesPorDiaMap.values()),
    estadosCotizacion,
    ultimasCotizaciones: ultimasCotizaciones.map((cotizacion) => ({
      idCotizacion: cotizacion.idCotizacion,
      numeroCotizacion: cotizacion.numeroCotizacion,
      cliente: cotizacion.cliente?.nombreCompleto || '-',
      contacto: cotizacion.cliente?.email || cotizacion.cliente?.telefono || '',
      fecha: formatDateKey(cotizacion.fechaEmision || cotizacion.fechaCreacion || today),
      estado: normalizeEstado(cotizacion.estado),
      estadoLabel: estadoLabel(cotizacion.estado),
      total: formatCurrency(cotizacion.total, cotizacion.moneda),
    })),
  };

  await cacheSet(CACHE_KEY, result, CACHE_TTL);
  return result;
}

module.exports = { getDashboardSummary };

const { prisma } = require('../../db/prisma');
const { HttpError } = require('../../utils/httpError');

function parseId(value, fieldName = 'idCategoria') {
  try {
    const id = BigInt(value);
    if (id <= 0n) throw new Error('invalid');
    return id;
  } catch {
    throw new HttpError(400, `${fieldName} inválido`);
  }
}

function normalizeEstado(value = 'activo') {
  const normalized = String(value || 'activo').trim().toLowerCase();

  if (normalized === 'activo' || normalized === 'activa') return 'activo';
  if (normalized === 'inactivo' || normalized === 'inactiva') return 'inactivo';

  throw new HttpError(400, 'Estado inválido. Usa activo o inactivo.');
}

function normalizeText(value, { required = false, fieldName = 'campo', min = 0, max = 150 } = {}) {
  const text = String(value ?? '').trim();

  if (required && !text) {
    throw new HttpError(400, `${fieldName} es requerido`);
  }

  if (text && text.length < min) {
    throw new HttpError(400, `${fieldName} debe tener al menos ${min} caracteres`);
  }

  if (text.length > max) {
    throw new HttpError(400, `${fieldName} no puede superar ${max} caracteres`);
  }

  return text;
}

function normalizeSubcategorias(subcategorias = []) {
  return subcategorias.map((sub, index) => ({
    idSubcategoria: sub.idSubcategoria,
    nombre: normalizeText(sub.nombre, {
      required: true,
      fieldName: `subcategorias[${index}].nombre`,
      min: 2,
      max: 150,
    }),
    descripcion: normalizeText(sub.descripcion, {
      fieldName: `subcategorias[${index}].descripcion`,
      max: 255,
    }),
  }));
}

const categoriaInclude = {
  subcategorias: {
    select: {
      idSubcategoria: true,
      nombre: true,
      descripcion: true,
    },
    orderBy: { idSubcategoria: 'asc' },
  },
};

async function listCategorias() {
  return prisma.categoria.findMany({
    orderBy: { idCategoria: 'desc' },
    include: categoriaInclude,
  });
}

async function getCategoria(idCategoria) {
  const categoria = await prisma.categoria.findUnique({
    where: { idCategoria: parseId(idCategoria) },
    include: categoriaInclude,
  });

  if (!categoria) {
    throw new HttpError(404, 'Categoría no encontrada');
  }

  return categoria;
}

async function assertUniqueSubcategorias(nombres, tx = prisma, idSubcategoriasIgnoradas = []) {
  if (!nombres.length) return;

  const existentes = await tx.subcategoria.findMany({
    where: {
      nombre: { in: nombres.map((nombre) => nombre.toLowerCase()), mode: 'insensitive' },
      ...(idSubcategoriasIgnoradas.length > 0 && {
        NOT: { idSubcategoria: { in: idSubcategoriasIgnoradas } },
      }),
    },
    select: { nombre: true },
  });

  if (existentes.length > 0) {
    const nombresExistentes = existentes.map((sub) => sub.nombre).join(', ');
    throw new HttpError(409, `Ya existen subcategorías con esos nombres: ${nombresExistentes}`);
  }
}

async function createCategoria({ nombre, descripcion, estado, subcategorias = [] }) {
  const cleanNombre = normalizeText(nombre, { required: true, fieldName: 'nombre', min: 3, max: 150 });
  const cleanDescripcion = normalizeText(descripcion, { fieldName: 'descripcion', max: 255 });
  const cleanEstado = normalizeEstado(estado);
  const cleanSubcategorias = normalizeSubcategorias(subcategorias);

  const existe = await prisma.categoria.findFirst({
    where: { nombre: { equals: cleanNombre, mode: 'insensitive' } },
  });

  if (existe) {
    throw new HttpError(409, 'Ya existe una categoría con ese nombre.');
  }

  await assertUniqueSubcategorias(cleanSubcategorias.map((sub) => sub.nombre));

  return prisma.categoria.create({
    data: {
      nombre: cleanNombre,
      descripcion: cleanDescripcion,
      estado: cleanEstado,
      subcategorias: cleanSubcategorias.length
        ? {
            create: cleanSubcategorias.map((sub) => ({
              nombre: sub.nombre,
              descripcion: sub.descripcion,
            })),
          }
        : undefined,
    },
    include: categoriaInclude,
  });
}

async function updateCategoria(idCategoria, { nombre, descripcion, estado, subcategorias = [] }) {
  const id = parseId(idCategoria);
  const cleanNombre =
    nombre !== undefined
      ? normalizeText(nombre, { required: true, fieldName: 'nombre', min: 3, max: 150 })
      : undefined;
  const cleanDescripcion =
    descripcion !== undefined
      ? normalizeText(descripcion, { fieldName: 'descripcion', max: 255 })
      : undefined;
  const cleanEstado = estado !== undefined ? normalizeEstado(estado) : undefined;
  const cleanSubcategorias = normalizeSubcategorias(subcategorias);

  if (cleanNombre) {
    const existe = await prisma.categoria.findFirst({
      where: { nombre: { equals: cleanNombre, mode: 'insensitive' }, NOT: { idCategoria: id } },
    });

    if (existe) {
      throw new HttpError(409, 'Ya existe una categoría con ese nombre.');
    }
  }

  return prisma.$transaction(async (tx) => {
    const currentSubcatIds = cleanSubcategorias
      .filter((sub) => sub.idSubcategoria)
      .map((sub) => parseId(sub.idSubcategoria, 'idSubcategoria'));

    const subcategoriasActuales = await tx.subcategoria.findMany({
      where: { idCategoria: id },
      select: { idSubcategoria: true },
    });

    const idsToEliminar = subcategoriasActuales
      .filter((sub) => !currentSubcatIds.includes(sub.idSubcategoria))
      .map((sub) => sub.idSubcategoria);

    if (idsToEliminar.length > 0) {
      const [productosEnUso, serviciosEnUso] = await Promise.all([
        tx.producto.count({ where: { idSubcategoria: { in: idsToEliminar } } }),
        tx.servicio.count({ where: { idSubcategoria: { in: idsToEliminar } } }),
      ]);

      if (productosEnUso + serviciosEnUso > 0) {
        throw new HttpError(400, 'No se pueden eliminar algunas subcategorías porque están en uso.');
      }

      await tx.subcategoria.deleteMany({ where: { idSubcategoria: { in: idsToEliminar } } });
    }

    const subsToCreate = cleanSubcategorias.filter((sub) => !sub.idSubcategoria);
    const subsToUpdate = cleanSubcategorias.filter((sub) => sub.idSubcategoria);

    await assertUniqueSubcategorias(cleanSubcategorias.map((sub) => sub.nombre), tx, currentSubcatIds);

    for (const sub of subsToUpdate) {
      await tx.subcategoria.update({
        where: { idSubcategoria: parseId(sub.idSubcategoria, 'idSubcategoria') },
        data: {
          nombre: sub.nombre,
          descripcion: sub.descripcion,
        },
      });
    }

    return tx.categoria.update({
      where: { idCategoria: id },
      data: {
        ...(cleanNombre !== undefined && { nombre: cleanNombre }),
        ...(cleanDescripcion !== undefined && { descripcion: cleanDescripcion }),
        ...(cleanEstado !== undefined && { estado: cleanEstado }),
        ...(subsToCreate.length > 0 && {
          subcategorias: {
            create: subsToCreate.map((sub) => ({
              nombre: sub.nombre,
              descripcion: sub.descripcion,
            })),
          },
        }),
      },
      include: categoriaInclude,
    });
  });
}

async function deleteCategoria(idCategoria) {
  const id = parseId(idCategoria);

  const [productosEnUso, serviciosEnUso] = await Promise.all([
    prisma.producto.count({ where: { idCategoria: id } }),
    prisma.servicio.count({ where: { idCategoria: id } }),
  ]);

  if (productosEnUso > 0 || serviciosEnUso > 0) {
    throw new HttpError(
      400,
      `No se puede eliminar: la categoría actual está en uso por ${productosEnUso} producto(s) y ${serviciosEnUso} servicio(s).`,
    );
  }

  return prisma.categoria.update({
    where: { idCategoria: id },
    data: { estado: 'inactivo' },
  });
}

module.exports = {
  listCategorias,
  getCategoria,
  createCategoria,
  updateCategoria,
  deleteCategoria,
};

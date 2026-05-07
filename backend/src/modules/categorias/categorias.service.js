// categorias.service.js
const { prisma } = require('../../db/prisma');

async function listCategorias() {
  return prisma.categoria.findMany({
    where: { estado: 'activo' },
    orderBy: { idCategoria: 'desc' },
    include: {
      subcategorias: {
        select: {
          idSubcategoria: true,
          nombre: true,
          descripcion: true,
        },
      },
    },
  });
}

async function getCategoria(idCategoria) {
  return prisma.categoria.findUniqueOrThrow({
    where: { idCategoria: BigInt(idCategoria) },
    include: {
      subcategorias: {
        select: {
          idSubcategoria: true,
          nombre: true,
          descripcion: true,
        },
      },
    },
  });
}

async function createCategoria({ nombre, descripcion, subcategorias = [] }) {
  // Nombre único (case-insensitive)
  const existe = await prisma.categoria.findFirst({
    where: { nombre: { equals: nombre.trim(), mode: 'insensitive' } },
  });
  if (existe) throw Object.assign(new Error('Ya existe una categoría con ese nombre.'), { status: 409 });
  if(subcategorias.length > 0) {
    const nombresSub = subcategorias.map(sub => sub.nombre.trim().toLowerCase());
    const sucatsExistentes = await prisma.subcategoria.findMany({
      where: {
        nombre: { in: nombresSub, mode: 'insensitive' } 
      }
    });
    if (sucatsExistentes.length > 0) {
      const nombresExistentes = sucatsExistentes.map(s => s.nombre).join(', ');
      throw Object.assign(new Error(`Ya existen subcategorías con esos nombres: ${nombresExistentes}`), { status: 409 });
    }
  }
  return prisma.categoria.create({
    data: {
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || '',
      estado: 'activo',
      subcategorias: subcategorias.length > 0 ? {
        create: subcategorias.map((sub) => ({
          nombre: sub.nombre.trim(),
          descripcion: sub.descripcion?.trim() || '',
        })),
      } : undefined,
    },
    include: {
      subcategorias: {
        select: { idSubcategoria: true, nombre: true, descripcion: true },
      },
    },
  });
}

/* Líneas anteriores omitidas... */

async function updateCategoria(idCategoria, { nombre, descripcion, subcategorias }) {
  const id = BigInt(idCategoria);

  if (nombre) {
    const existe = await prisma.categoria.findFirst({
      where: { nombre: { equals: nombre.trim(), mode: 'insensitive' }, NOT: { idCategoria: id } },
    });
    if (existe) throw Object.assign(new Error('Ya existe una categoría con ese nombre.'), { status: 409 });
  }

  return prisma.$transaction(async (tx) => {
    const currentSubcatIds = (subcategorias || [])
      .filter((sub) => sub.idSubcategoria)
      .map((sub) => BigInt(sub.idSubcategoria));

    const subcategoriasActuales = await tx.subcategoria.findMany({
      where: { idCategoria: id }, select: { idSubcategoria: true }
    });

    const idsToEliminar = subcategoriasActuales
      .filter(sub => !currentSubcatIds.includes(sub.idSubcategoria))
      .map(sub => sub.idSubcategoria);

    if (idsToEliminar.length > 0) {
      const enUsoCount = await tx.producto.count({ where: { idSubcategoria: { in: idsToEliminar } } }) +
        await tx.servicio.count({ where: { idSubcategoria: { in: idsToEliminar } } });

      if (enUsoCount > 0) {
        throw Object.assign(new Error('No se pueden eliminar algunas subcategorías porque están en uso.'), { status: 400 });
      }

      await tx.subcategoria.deleteMany({ where: { idSubcategoria: { in: idsToEliminar } } });
    }

    const subsToCreate = [];
    const subsToUpdate = [];

    (subcategorias || []).forEach(sub => {
      sub.idSubcategoria ? subsToUpdate.push(sub) : subsToCreate.push(sub);
    });

    if (subcategorias?.length > 0) {
      for (const sub of subsToCreate) {
        const existeSub = await tx.subcategoria.findFirst({
          where: {
            nombre: { equals: sub.nombre.trim(), mode: 'insensitive' },
           ...(sub.idSubcategoria && { NOT: { idSubcategoria: BigInt(sub.idSubcategoria) } })
          }
        });
        if (existeSub) {
          throw Object.assign(new Error(`La subcategoría "${sub.nombre}" ya existe en otra parte del sistema.`), { status: 409 });
        }
      }
    }
    for (const sub of subsToUpdate) {
      await tx.subcategoria.update({
        where: { idSubcategoria: BigInt(sub.idSubcategoria) },
        data: { nombre: sub.nombre.trim(), descripcion: sub.descripcion?.trim() || '' }
      });
    }

    return tx.categoria.update({
      where: { idCategoria: id },
      data: {
        ...(nombre && { nombre: nombre.trim() }),
        ...(descripcion !== undefined && { descripcion: descripcion?.trim() || '' }),
        ...(subsToCreate.length > 0 && {
          subcategorias: {
            create: subsToCreate.map((sub) => ({
              nombre: sub.nombre.trim(),
              descripcion: sub.descripcion?.trim() || '',
            })),
          },
        }),
      },
      include: { subcategorias: { select: { idSubcategoria: true, nombre: true, descripcion: true } } },
    });
  });
}

async function deleteCategoria(idCategoria) {
  const id = BigInt(idCategoria);

  // 1. Validar si la categoría está en uso en Productos
  const productosEnUso = await prisma.producto.count({
    where: { idCategoria: id }
  });

  // 2. Validar si la categoría está en uso en Servicios
  const serviciosEnUso = await prisma.servicio.count({
    where: { idCategoria: id }
  });

  // 3. Bloquear la eliminación si tiene registros asociados
  if (productosEnUso > 0 || serviciosEnUso > 0) {
    const errorMsg = `No se puede eliminar: La categoría actual tiene en uso ${productosEnUso} producto(s) y ${serviciosEnUso} servicio(s).`;
    throw Object.assign(new Error(errorMsg), { status: 400 });
  }

  // 4. Si pasa las validaciones, hacemos el Soft Delete
  return prisma.categoria.update({
    where: { idCategoria: id },
    data: { estado: 'inactivo' },
  });
}

module.exports = { listCategorias, getCategoria, createCategoria, updateCategoria, deleteCategoria };
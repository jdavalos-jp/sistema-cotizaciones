const { prisma } = require('../../db/prisma');
const { Prisma } = require('@prisma/client');
const { HttpError } = require('../../utils/httpError');
const { decimalToNumber } = require('../cotizaciones/decimal-converter');

function toBigInt(value, fieldName) {
  try {
    return BigInt(value);
  } catch {
    throw new HttpError(400, `${fieldName} inválido`);
  }
}

function toNumber(value, fieldName) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    throw new HttpError(400, `${fieldName} debe ser un número positivo`);
  }
  return n;
}

/**
 * Obtener todas las categorías
 */
async function getCategorias() {
  return prisma.categoria.findMany({
    where: { estado: 'activo' },
    select: {
      idCategoria: true,
      nombre: true,
      descripcion: true,
    },
    orderBy: { nombre: 'asc' },
  });
}

/**
 * Obtener subcategorías por categoría
 */
async function getSubcategoriasByCategoria(idCategoria) {
  const catId = toBigInt(idCategoria, 'idCategoria');

  return prisma.subcategoria.findMany({
    where: {
      idCategoria: catId,
    },
    select: {
      idSubcategoria: true,
      nombre: true,
      descripcion: true,
    },
    orderBy: { nombre: 'asc' },
  });
}

/**
 * Listar productos con filtros
 */
async function listProductos({ take = 50, skip = 0, search, idCategoria, idSubcategoria } = {}) {
  const q = search?.trim();
  const where = {
    ...(q && {
      OR: [
        { nombre: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
        { descripcion: { contains: q, mode: 'insensitive' } },
      ],
    }),
    ...(idCategoria && { idCategoria: toBigInt(idCategoria, 'idCategoria') }),
    ...(idSubcategoria && {
      idSubcategoria: toBigInt(idSubcategoria, 'idSubcategoria'),
    }),
  };

  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      take,
      skip,
      where,
      orderBy: { idProducto: 'desc' },
      select: {
        idProducto: true,
        nombre: true,
        descripcion: true,
        precioBase: true,
        cantidad: true,
        sku: true,
        estado: true,
        imagenes: {
          where: { principal: true },
          take: 1,
          select: {
            idImagen: true,
            urlImagen: true,
            principal: true,
          },
        },
        categoria: {
          select: { nombre: true },
        },
        subcategoria: {
          select: { nombre: true },
        },
      },
    }),
    prisma.producto.count({ where }),
  ]);

  // Convertir Decimales a números
  const data = decimalToNumber(productos.map((p) => ({
    idProducto: p.idProducto,
    nombre: p.nombre,
    descripcion: p.descripcion,
    precio_base: p.precioBase,
    cantidad: p.cantidad,
    sku: p.sku,
    estado: p.estado,
    categoria: p.categoria,
    subcategoria: p.subcategoria,
    imagenes: p.imagenes,
  })));

  return { data, total };
}

/**
 * Obtener producto por ID con todas sus relaciones
 */
async function getProductoById(idProducto) {
  const prodId = toBigInt(idProducto, 'idProducto');

  const producto = await prisma.producto.findUnique({
    where: { idProducto: prodId },
    select: {
      idProducto: true,
      nombre: true,
      descripcion: true,
      precioBase: true,
      cantidad: true,
      sku: true,
      estado: true,
      imagenes: {
        select: {
          idImagen: true,
          urlImagen: true,
          orden: true,
          principal: true,
        },
        orderBy: { orden: 'asc' },
      },
      categoria: {
        select: {
          idCategoria: true,
          nombre: true,
        },
      },
      subcategoria: {
        select: {
          idSubcategoria: true,
          nombre: true,
        },
      },
      componentes: {
        select: {
          idProductoComponente: true,
          cantidad: true,
          componente: {
            select: {
              idComponente: true,
              nombre: true,
              precioBase: true,
            },
          },
        },
      },
    },
  });

  if (!producto) {
    throw new HttpError(404, 'Producto no encontrado');
  }

  return decimalToNumber({
    idProducto: producto.idProducto,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio_base: producto.precioBase,
    cantidad: producto.cantidad,
    sku: producto.sku,
    estado: producto.estado,
    categoria: producto.categoria,
    subcategoria: producto.subcategoria,
    imagenes: producto.imagenes,
    componentes: producto.componentes?.map((c) => ({
      idProductoComponente: c.idProductoComponente,
      cantidad: c.cantidad,
      componente: {
        idComponente: c.componente.idComponente,
        nombre: c.componente.nombre,
        precio_base: c.componente.precioBase,
      },
    })),
  });
}

/**
 * Crear producto
 */
async function createProducto({
  nombre,
  descripcion,
  precioBase,
  cantidad,
  sku,
  idCategoria,
  idSubcategoria,
  imagenPrincipal,
}) {
  if (!nombre?.trim()) {
    throw new HttpError(400, 'Nombre es requerido');
  }
  if (!precioBase) {
    throw new HttpError(400, 'Precio es requerido');
  }
  if (!idCategoria) {
    throw new HttpError(400, 'Categoría es requerida');
  }

  const precio = new Prisma.Decimal(precioBase);
  const cant = Number(cantidad) || 1;
  const catId = toBigInt(idCategoria, 'idCategoria');
  const subCatId = idSubcategoria ? toBigInt(idSubcategoria, 'idSubcategoria') : null;

  // Verificar que la categoría existe
  const categoria = await prisma.categoria.findUnique({
    where: { idCategoria: catId },
  });
  if (!categoria) {
    throw new HttpError(400, 'Categoría no existe');
  }

  // Verificar que la subcategoría existe si se proporciona
  if (subCatId) {
    const subcategoria = await prisma.subcategoria.findUnique({
      where: { idSubcategoria: subCatId },
    });
    if (!subcategoria || subcategoria.idCategoria !== catId) {
      throw new HttpError(400, 'Subcategoría no válida para esta categoría');
    }
  }

  const producto = await prisma.producto.create({
    data: {
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      precioBase: precio,
      cantidad: cant,
      sku: sku?.trim() || null,
      idCategoria: catId,
      idSubcategoria: subCatId,
      estado: 'activo',
      ...(imagenPrincipal && {
        imagenes: {
          create: {
            urlImagen: imagenPrincipal,
            principal: true,
            orden: 1,
          },
        },
      }),
    },
    select: {
      idProducto: true,
      nombre: true,
      descripcion: true,
      precioBase: true,
      cantidad: true,
      sku: true,
      estado: true,
      imagenes: {
        select: {
          idImagen: true,
          urlImagen: true,
          orden: true,
          principal: true,
        },
      },
      categoria: { select: { nombre: true } },
      subcategoria: { select: { nombre: true } },
    },
  });

  return decimalToNumber({
    idProducto: producto.idProducto,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio_base: producto.precioBase,
    cantidad: producto.cantidad,
    sku: producto.sku,
    estado: producto.estado,
    imagenes: producto.imagenes,
    categoria: producto.categoria,
    subcategoria: producto.subcategoria,
  });
}

/**
 * Actualizar producto
 */
async function updateProducto(
  idProducto,
  { nombre, descripcion, precioBase, cantidad, sku, idCategoria, idSubcategoria }
) {
  const prodId = toBigInt(idProducto, 'idProducto');

  // Verificar que existe
  const productoExistente = await prisma.producto.findUnique({
    where: { idProducto: prodId },
  });
  if (!productoExistente) {
    throw new HttpError(404, 'Producto no encontrado');
  }

  const data = {};

  if (nombre !== undefined) {
    if (!nombre?.trim()) {
      throw new HttpError(400, 'Nombre no puede estar vacío');
    }
    data.nombre = nombre.trim();
  }

  if (descripcion !== undefined) {
    data.descripcion = descripcion?.trim() || null;
  }

  if (precioBase !== undefined) {
    data.precioBase = new Prisma.Decimal(precioBase);
  }

  if (cantidad !== undefined) {
    data.cantidad = Math.max(1, Number(cantidad) || 1);
  }

  if (sku !== undefined) {
    data.sku = sku?.trim() || null;
  }

  if (idCategoria !== undefined) {
    const catId = toBigInt(idCategoria, 'idCategoria');
    const categoria = await prisma.categoria.findUnique({
      where: { idCategoria: catId },
    });
    if (!categoria) {
      throw new HttpError(400, 'Categoría no existe');
    }
    data.idCategoria = catId;
  }

  if (idSubcategoria !== undefined) {
    if (idSubcategoria) {
      const subCatId = toBigInt(idSubcategoria, 'idSubcategoria');
      const subcategoria = await prisma.subcategoria.findUnique({
        where: { idSubcategoria: subCatId },
      });
      if (!subcategoria) {
        throw new HttpError(400, 'Subcategoría no existe');
      }
      data.idSubcategoria = subCatId;
    } else {
      data.idSubcategoria = null;
    }
  }

  const producto = await prisma.producto.update({
    where: { idProducto: prodId },
    data,
    select: {
      idProducto: true,
      nombre: true,
      descripcion: true,
      precioBase: true,
      cantidad: true,
      sku: true,
      estado: true,
      imagenes: {
        select: {
          idImagen: true,
          urlImagen: true,
          orden: true,
          principal: true,
        },
      },
      categoria: { select: { nombre: true } },
      subcategoria: { select: { nombre: true } },
    },
  });

  return decimalToNumber({
    idProducto: producto.idProducto,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio_base: producto.precioBase,
    cantidad: producto.cantidad,
    sku: producto.sku,
    estado: producto.estado,
    imagenes: producto.imagenes,
    categoria: producto.categoria,
    subcategoria: producto.subcategoria,
  });
}

/**
 * Eliminar producto
 */
async function deleteProducto(idProducto) {
  const prodId = toBigInt(idProducto, 'idProducto');

  // Verificar que existe
  const producto = await prisma.producto.findUnique({
    where: { idProducto: prodId },
  });
  if (!producto) {
    throw new HttpError(404, 'Producto no encontrado');
  }

  // Eliminar (cascade eliminará imágenes)
  await prisma.producto.delete({
    where: { idProducto: prodId },
  });

  return { message: 'Producto eliminado' };
}

/**
 * Agregar imagen a producto
 */
async function addImagenToProducto(idProducto, { urlImagen, principal = false, orden = 1 }) {
  const prodId = toBigInt(idProducto, 'idProducto');

  // Verificar que el producto existe
  const producto = await prisma.producto.findUnique({
    where: { idProducto: prodId },
  });
  if (!producto) {
    throw new HttpError(404, 'Producto no encontrado');
  }

  // Si es principal, desmarcar otras
  if (principal) {
    await prisma.productoImagen.updateMany({
      where: { idProducto: prodId },
      data: { principal: false },
    });
  }

  const imagen = await prisma.productoImagen.create({
    data: {
      idProducto: prodId,
      urlImagen,
      principal,
      orden,
    },
  });

  return imagen;
}

/**
 * Eliminar imagen de producto
 */
async function deleteImagenFromProducto(idImagen) {
  const imgId = toBigInt(idImagen, 'idImagen');

  const imagen = await prisma.productoImagen.findUnique({
    where: { idImagen: imgId },
  });
  if (!imagen) {
    throw new HttpError(404, 'Imagen no encontrada');
  }

  await prisma.productoImagen.delete({
    where: { idImagen: imgId },
  });

  return { message: 'Imagen eliminada' };
}

module.exports = {
  getCategorias,
  getSubcategoriasByCategoria,
  listProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
  addImagenToProducto,
  deleteImagenFromProducto,
};

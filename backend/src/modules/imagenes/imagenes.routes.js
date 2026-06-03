const express = require('express');
const multer = require('multer');

const { prisma } = require('../../db/prisma');
const {
  uploadProductoImage,
  uploadCotizacionImage,
  uploadComponenteImage,
  deleteProductoImage,
  deleteImage,
  deleteImageByPublicUrl,
} = require('../../services/storage/imageService');
const { asyncHandler } = require('../../utils/asyncHandler');
const { HttpError } = require('../../utils/httpError');

const router = express.Router();
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      return cb(new HttpError(400, 'Solo se permiten imagenes JPEG, PNG o WEBP'));
    }

    cb(null, true);
  },
});

function requireFile(req) {
  if (!req.file) {
    throw new HttpError(400, 'No se recibio ningun archivo');
  }

  return req.file;
}

function parseBigIntId(value, fieldName) {
  try {
    const id = BigInt(value);
    if (id <= 0n) throw new Error('invalid');
    return id;
  } catch {
    throw new HttpError(400, `${fieldName} invalido`);
  }
}

router.post(
  '/productos/:idProducto/imagenes',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const idProducto = parseBigIntId(req.params.idProducto, 'idProducto');
    const file = requireFile(req);

    const producto = await prisma.producto.findUnique({ where: { idProducto } });
    if (!producto) throw new HttpError(404, 'Producto no encontrado');

    const dataImagen = await uploadProductoImage(file, idProducto.toString());

    const imagen = await prisma.productoImagen.create({
      data: {
        idProducto,
        urlImagen: dataImagen.urlImagen,
        rutaBucket: dataImagen.rutaBucket,
      },
    });

    res.json({ data: imagen });
  }),
);

router.get(
  '/productos/:idProducto/imagenes',
  asyncHandler(async (req, res) => {
    const idProducto = parseBigIntId(req.params.idProducto, 'idProducto');
    const imagenes = await prisma.productoImagen.findMany({
      where: { idProducto, estado: 'activo' },
      orderBy: [{ principal: 'desc' }, { orden: 'asc' }],
    });

    res.json({ data: imagenes });
  }),
);

router.put(
  '/productos/imagenes/:idImagen/principal',
  asyncHandler(async (req, res) => {
    const idImagen = parseBigIntId(req.params.idImagen, 'idImagen');
    const imagen = await prisma.productoImagen.findUnique({ where: { idImagen } });
    if (!imagen) throw new HttpError(404, 'Imagen no encontrada');

    await prisma.productoImagen.updateMany({
      where: { idProducto: imagen.idProducto, principal: true },
      data: { principal: false },
    });

    const updated = await prisma.productoImagen.update({
      where: { idImagen },
      data: { principal: true },
    });

    res.json({ data: updated });
  }),
);

router.delete(
  '/productos/imagenes/:idImagen',
  asyncHandler(async (req, res) => {
    const idImagen = parseBigIntId(req.params.idImagen, 'idImagen');
    const imagen = await prisma.productoImagen.findUnique({ where: { idImagen } });
    if (!imagen) throw new HttpError(404, 'Imagen no encontrada');

    await deleteProductoImage(imagen);
    await prisma.productoImagen.delete({ where: { idImagen } });

    res.json({ success: true });
  }),
);

router.post(
  '/cotizaciones/:idCotizacion/imagenes',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const idCotizacion = parseBigIntId(req.params.idCotizacion, 'idCotizacion');
    const file = requireFile(req);
    const { tipo = 'adjunto' } = req.body;

    const cotizacion = await prisma.cotizacion.findUnique({ where: { idCotizacion } });
    if (!cotizacion) throw new HttpError(404, 'Cotizacion no encontrada');

    const dataImagen = await uploadCotizacionImage(file, idCotizacion.toString(), tipo);

    const imagen = await prisma.cotizacionImagen.create({
      data: {
        idCotizacion,
        nombreArchivo: dataImagen.nombreArchivo,
        rutaBucket: dataImagen.rutaBucket,
        urlImagen: dataImagen.urlImagen,
        tipo: dataImagen.tipo,
        tamanio: dataImagen.tamanio,
      },
    });

    res.json({ data: imagen });
  }),
);

router.get(
  '/cotizaciones/:idCotizacion/imagenes',
  asyncHandler(async (req, res) => {
    const idCotizacion = parseBigIntId(req.params.idCotizacion, 'idCotizacion');
    const imagenes = await prisma.cotizacionImagen.findMany({
      where: { idCotizacion, estado: 'activo' },
      orderBy: { orden: 'asc' },
    });

    res.json({ data: imagenes });
  }),
);

router.delete(
  '/cotizaciones/imagenes/:idImagen',
  asyncHandler(async (req, res) => {
    const idImagen = parseBigIntId(req.params.idImagen, 'idImagen');
    const imagen = await prisma.cotizacionImagen.findUnique({ where: { idImagen } });
    if (!imagen) throw new HttpError(404, 'Imagen no encontrada');

    await deleteImage(imagen.rutaBucket);
    await prisma.cotizacionImagen.delete({ where: { idImagen } });

    res.json({ success: true });
  }),
);

router.post(
  '/componentes/:idComponente/imagenes',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const idComponente = parseBigIntId(req.params.idComponente, 'idComponente');
    const file = requireFile(req);

    const componente = await prisma.componente.findUnique({ where: { idComponente } });
    if (!componente) throw new HttpError(404, 'Componente no encontrado');

    const dataImagen = await uploadComponenteImage(file, idComponente.toString());

    const imagen = await prisma.componenteImagen.create({
      data: {
        idComponente,
        urlImagen: dataImagen.urlImagen,
      },
    });

    res.json({ data: imagen });
  }),
);

router.get(
  '/componentes/:idComponente/imagenes',
  asyncHandler(async (req, res) => {
    const idComponente = parseBigIntId(req.params.idComponente, 'idComponente');
    const imagenes = await prisma.componenteImagen.findMany({
      where: { idComponente, estado: 'activo' },
      orderBy: [{ principal: 'desc' }, { orden: 'asc' }],
    });

    res.json({ data: imagenes });
  }),
);

router.put(
  '/componentes/imagenes/:idImagen/principal',
  asyncHandler(async (req, res) => {
    const idImagen = parseBigIntId(req.params.idImagen, 'idImagen');
    const imagen = await prisma.componenteImagen.findUnique({ where: { idImagen } });
    if (!imagen) throw new HttpError(404, 'Imagen no encontrada');

    await prisma.componenteImagen.updateMany({
      where: { idComponente: imagen.idComponente, principal: true },
      data: { principal: false },
    });

    const updated = await prisma.componenteImagen.update({
      where: { idImagen },
      data: { principal: true },
    });

    res.json({ data: updated });
  }),
);

router.delete(
  '/componentes/imagenes/:idImagen',
  asyncHandler(async (req, res) => {
    const idImagen = parseBigIntId(req.params.idImagen, 'idImagen');
    const imagen = await prisma.componenteImagen.findUnique({ where: { idImagen } });
    if (!imagen) throw new HttpError(404, 'Imagen no encontrada');

    await deleteImageByPublicUrl(imagen.urlImagen);
    await prisma.componenteImagen.delete({ where: { idImagen } });

    res.json({ success: true });
  }),
);

module.exports = { router };

const express = require('express')
const multer = require('multer')
const { prisma } = require('../../db/prisma')
const { uploadProductoImage, uploadCotizacionImage, uploadComponenteImage, deleteProductoImage, deleteImage, deleteImageByPublicUrl } = require('../../services/storage/imageService')
const { asyncHandler } = require('../../utils/asyncHandler')

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// ============ PRODUCTO IMÁGENES ============

router.post('/productos/:idProducto/imagenes',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    try {
      const { idProducto } = req.params

      console.log('⬆️ [IMAGENES] Subiendo imagen para producto:', idProducto, '- Archivo:', req.file?.originalname);

      if (!req.file) {
        console.error('❌ [IMAGENES] No file provided');
        return res.status(400).json({ error: 'No file provided' })
      }

      // Validar
      const producto = await prisma.producto.findUnique({
        where: { idProducto: BigInt(idProducto) }
      })
      if (!producto) {
        console.error('❌ [IMAGENES] Producto no encontrado:', idProducto);
        return res.status(404).json({ error: 'Producto no encontrado' })
      }

      // Subir
      console.log('📸 [IMAGENES] Iniciando uploadProductoImage...');
      const dataImagen = await uploadProductoImage(req.file, idProducto)
      console.log('📸 [IMAGENES] uploadProductoImage completado:', dataImagen);

      // Guardar BD - solo usar los campos que Prisma espera
      const imagen = await prisma.productoImagen.create({
        data: {
          idProducto: BigInt(idProducto),
          urlImagen: dataImagen.urlImagen,
          rutaBucket: dataImagen.rutaBucket,
        },
      })

      console.log(' [IMAGENES] Imagen guardada con ID:', imagen.idImagen, '- URL:', imagen.urlImagen);
      res.json({ data: imagen })
    } catch (err) {
      console.error('❌ [IMAGENES] Error:', err.message);
      console.error('Stack:', err.stack);
      res.status(500).json({ error: err.message || 'Error uploading image' })
    }
  })
)

router.get('/productos/:idProducto/imagenes',
  asyncHandler(async (req, res) => {
    const imagenes = await prisma.productoImagen.findMany({
      where: {
        idProducto: BigInt(req.params.idProducto),
        estado: 'activo',
      },
      orderBy: [{ principal: 'desc' }, { orden: 'asc' }],
    })
    res.json({ data: imagenes })
  })
)

router.put('/productos/imagenes/:idImagen/principal',
  asyncHandler(async (req, res) => {
    const imagen = await prisma.productoImagen.findUnique({
      where: { idImagen: BigInt(req.params.idImagen) }
    })
    if (!imagen) return res.status(404).json({ error: 'No encontrada' })

    await prisma.productoImagen.updateMany({
      where: { idProducto: imagen.idProducto, principal: true },
      data: { principal: false }
    })

    const updated = await prisma.productoImagen.update({
      where: { idImagen: BigInt(req.params.idImagen) },
      data: { principal: true }
    })

    res.json({ data: updated })
  })
)

router.delete('/productos/imagenes/:idImagen',
  asyncHandler(async (req, res) => {
    const imagen = await prisma.productoImagen.findUnique({
      where: { idImagen: BigInt(req.params.idImagen) }
    })
    if (!imagen) return res.status(404).json({ error: 'No encontrada' })

    await deleteProductoImage(imagen)

    await prisma.productoImagen.delete({
      where: { idImagen: BigInt(req.params.idImagen) }
    })

    res.json({ success: true })
  })
)

// ============ COTIZACIÓN IMÁGENES ============

router.post('/cotizaciones/:idCotizacion/imagenes',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const { idCotizacion } = req.params
    const { tipo = 'adjunto' } = req.body

    const cotizacion = await prisma.cotizacion.findUnique({
      where: { idCotizacion: BigInt(idCotizacion) }
    })
    if (!cotizacion) return res.status(404).json({ error: 'No encontrada' })

    const dataImagen = await uploadCotizacionImage(req.file, idCotizacion, tipo)

    const imagen = await prisma.cotizacionImagen.create({
      data: {
        idCotizacion: BigInt(idCotizacion),
        urlImagen: dataImagen.urlImagen,
      },
    })

    res.json({ data: imagen })
  })
)

router.get('/cotizaciones/:idCotizacion/imagenes',
  asyncHandler(async (req, res) => {
    const imagenes = await prisma.cotizacionImagen.findMany({
      where: {
        idCotizacion: BigInt(req.params.idCotizacion),
        estado: 'activo',
      },
      orderBy: { orden: 'asc' },
    })
    res.json({ data: imagenes })
  })
)

router.delete('/cotizaciones/imagenes/:idImagen',
  asyncHandler(async (req, res) => {
    const imagen = await prisma.cotizacionImagen.findUnique({
      where: { idImagen: BigInt(req.params.idImagen) }
    })
    if (!imagen) return res.status(404).json({ error: 'No encontrada' })

    await deleteImage(imagen.rutaBucket)

    await prisma.cotizacionImagen.delete({
      where: { idImagen: BigInt(req.params.idImagen) }
    })

    res.json({ success: true })
  })
)

// ============ COMPONENTE IMÁGENES ============

router.post('/componentes/:idComponente/imagenes',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const { idComponente } = req.params

    const componente = await prisma.componente.findUnique({
      where: { idComponente: BigInt(idComponente) }
    })
    if (!componente) return res.status(404).json({ error: 'Componente no encontrado' })

    const dataImagen = await uploadComponenteImage(req.file, idComponente)

    const imagen = await prisma.componenteImagen.create({
      data: {
        idComponente: BigInt(idComponente),
        urlImagen: dataImagen.urlImagen,
      },
    })

    res.json({ data: imagen })
  })
)

router.get('/componentes/:idComponente/imagenes',
  asyncHandler(async (req, res) => {
    const imagenes = await prisma.componenteImagen.findMany({
      where: {
        idComponente: BigInt(req.params.idComponente),
        estado: 'activo',
      },
      orderBy: [{ principal: 'desc' }, { orden: 'asc' }],
    })
    res.json({ data: imagenes })
  })
)

router.put('/componentes/imagenes/:idImagen/principal',
  asyncHandler(async (req, res) => {
    const imagen = await prisma.componenteImagen.findUnique({
      where: { idImagen: BigInt(req.params.idImagen) }
    })
    if (!imagen) return res.status(404).json({ error: 'No encontrada' })

    await prisma.componenteImagen.updateMany({
      where: { idComponente: imagen.idComponente, principal: true },
      data: { principal: false }
    })

    const updated = await prisma.componenteImagen.update({
      where: { idImagen: BigInt(req.params.idImagen) },
      data: { principal: true }
    })

    res.json({ data: updated })
  })
)

router.delete('/componentes/imagenes/:idImagen',
  asyncHandler(async (req, res) => {
    const imagen = await prisma.componenteImagen.findUnique({
      where: { idImagen: BigInt(req.params.idImagen) }
    })
    if (!imagen) return res.status(404).json({ error: 'No encontrada' })

    await deleteImageByPublicUrl(imagen.urlImagen)

    await prisma.componenteImagen.delete({
      where: { idImagen: BigInt(req.params.idImagen) }
    })

    res.json({ success: true })
  })
)

module.exports = { router }

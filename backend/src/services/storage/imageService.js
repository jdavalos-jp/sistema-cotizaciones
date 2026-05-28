const sharp = require('sharp')
const { supabaseAdmin } = require('../../integrations/supabaseAdmin')
const crypto = require('crypto')

const BUCKET_NAME = 'cotizaciones-images'

const VALIDACIONES = {
  TIPOS: ['image/jpeg', 'image/png', 'image/webp'],
  TAMANIO_MAX: 5 * 1024 * 1024,           // 5MB
  ANCHO_MIN: 400,
  ALTO_MIN: 300,
  ANCHO_MAX: 4000,
  ALTO_MAX: 4000,
}

async function uploadProductoImage(file, idProducto) {
  // 1️⃣ Validar
  console.log('📸 [IMAGESERVICE] Validando imagen para producto:', idProducto, '- Tamaño:', file?.size, 'bytes');
  if (!file || !file.buffer) {
    const error = 'No file provided';
    console.error('❌ [IMAGESERVICE]', error);
    throw new Error(error);
  }
  
  console.log('📸 [IMAGESERVICE] Tipo MIME:', file.mimetype);
  if (!VALIDACIONES.TIPOS.includes(file.mimetype)) {
    const error = 'Tipo inválido. Solo JPEG, PNG, WebP';
    console.error('❌ [IMAGESERVICE]', error, '- Recibido:', file.mimetype);
    throw new Error(error);
  }
  
  if (file.size > VALIDACIONES.TAMANIO_MAX) {
    const error = 'Archivo > 5MB';
    console.error('❌ [IMAGESERVICE]', error);
    throw new Error(error);
  }

  // 2️⃣ Metadata
  let metadata
  try {
    console.log('📸 [IMAGESERVICE] Extrayendo metadata con Sharp...');
    metadata = await sharp(file.buffer).metadata()
    console.log('📸 [IMAGESERVICE] Metadata:', metadata.width, 'x', metadata.height);
  } catch (err) {
    console.error('❌ [IMAGESERVICE] Sharp metadata error:', err.message);
    throw new Error('Imagen corrupta: ' + err.message);
  }

  if (metadata.width < VALIDACIONES.ANCHO_MIN || metadata.height < VALIDACIONES.ALTO_MIN) {
    const error = `Mínimo ${VALIDACIONES.ANCHO_MIN}x${VALIDACIONES.ALTO_MIN}px`;
    console.error('❌ [IMAGESERVICE]', error);
    throw new Error(error);
  }

  // 3️⃣ Hash y paths
  const hash = crypto.createHash('md5').update(file.buffer).digest('hex')
  const timestamp = Date.now()
  const nombreArchivo = `${idProducto}-${timestamp}.webp`
  const rutaBucket = `productos/${idProducto}/${nombreArchivo}`

  console.log('🔄 [IMAGESERVICE] Optimizando imagen...');
  // 4️⃣ Optimizar y subir
  let imageOptimizada;
  try {
    imageOptimizada = await sharp(file.buffer)
      .resize(metadata.width, metadata.height, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer()
    console.log('📸 [IMAGESERVICE] Imagen optimizada - Tamaño:', imageOptimizada.length, 'bytes');
  } catch (err) {
    console.error('❌ [IMAGESERVICE] Sharp optimization error:', err.message);
    throw new Error('Error optimizing image: ' + err.message);
  }

  console.log('☁️ [IMAGESERVICE] Subiendo a Supabase:', rutaBucket);
  let errorOriginal;
  try {
    const res = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(rutaBucket, imageOptimizada, {
        contentType: 'image/webp',
        upsert: false,
      });
    
    if (res.error) {
      errorOriginal = res.error;
      throw new Error(res.error.message);
    }
    console.log('✅ [IMAGESERVICE] Archivo subido a Supabase');
  } catch (err) {
    console.error('❌ [IMAGESERVICE] Supabase upload error:', err.message);
    throw new Error(`Error subir a Supabase: ${err.message}`);
  }

  // 6️⃣ URLs
  console.log('📸 [IMAGESERVICE] Obteniendo URL pública...');
  const { data: { publicUrl: urlOriginal } } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(rutaBucket)

  console.log('✅ [IMAGESERVICE] Imagen subida exitosamente - URL:', urlOriginal);

  return {
    urlImagen: urlOriginal,
    nombreArchivo,
    rutaBucket,
  }
}

async function uploadCotizacionImage(file, idCotizacion, tipo = 'adjunto') {
  if (!file || !file.buffer) throw new Error('No file')
  if (!VALIDACIONES.TIPOS.includes(file.mimetype)) throw new Error('Tipo inválido')
  if (file.size > VALIDACIONES.TAMANIO_MAX) throw new Error('Muy grande')

  let metadata
  try {
    metadata = await sharp(file.buffer).metadata()
  } catch (err) {
    throw new Error('Imagen corrupta')
  }

  const timestamp = Date.now()
  const nombreArchivo = `${idCotizacion}-${tipo}-${timestamp}.webp`
  const rutaBucket = `cotizaciones/${idCotizacion}/${nombreArchivo}`

  const imageOptimizada = await sharp(file.buffer)
    .webp({ quality: 80 })
    .toBuffer()

  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(rutaBucket, imageOptimizada, { contentType: 'image/webp' })

  if (error) throw new Error(`Error: ${error.message}`)

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(rutaBucket)

  return {
    nombreArchivo,
    rutaBucket,
    urlImagen: publicUrl,
    tipo,
    tamanio: imageOptimizada.length,
  }
}

async function deleteImage(rutaBucket) {
  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .remove([rutaBucket])

  if (error) throw new Error(`Error: ${error.message}`)
}

function getBucketPathFromPublicUrl(urlImagen) {
  if (!urlImagen) return null

  try {
    const { pathname } = new URL(urlImagen)
    const marker = `/${BUCKET_NAME}/`
    const markerIndex = pathname.indexOf(marker)

    if (markerIndex === -1) return null

    return decodeURIComponent(pathname.slice(markerIndex + marker.length))
  } catch {
    return null
  }
}

async function deleteImageByPublicUrl(urlImagen) {
  const rutaBucket = getBucketPathFromPublicUrl(urlImagen)

  if (!rutaBucket) return

  await deleteImage(rutaBucket)
}

async function uploadComponenteImage(file, idComponente) {
  if (!file || !file.buffer) throw new Error('No file')
  if (!VALIDACIONES.TIPOS.includes(file.mimetype)) throw new Error('Tipo inválido')
  if (file.size > VALIDACIONES.TAMANIO_MAX) throw new Error('Muy grande')

  let metadata
  try {
    metadata = await sharp(file.buffer).metadata()
  } catch (err) {
    throw new Error('Imagen corrupta')
  }

  const timestamp = Date.now()
  const nombreArchivo = `${idComponente}-${timestamp}.webp`
  const rutaBucket = `componentes/${idComponente}/${nombreArchivo}`

  const imageOptimizada = await sharp(file.buffer)
    .webp({ quality: 80 })
    .toBuffer()

  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(rutaBucket, imageOptimizada, { contentType: 'image/webp' })

  if (error) throw new Error(`Error: ${error.message}`)

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(rutaBucket)

  return {
    nombreArchivo,
    rutaBucket,
    urlImagen: publicUrl,
    tamanio: imageOptimizada.length,
  }
}

async function deleteProductoImage(imagenData) {
  if (imagenData.rutaBucket) {
    await deleteImage(imagenData.rutaBucket)
  }
  
  if (imagenData.urlThumb) {
    const rutaThumb = imagenData.urlThumb.split('/').slice(-1)[0]
    const rutaThumbnailFull = `${imagenData.rutaBucket.split('/').slice(0, -1).join('/')}/${rutaThumb}`
    try {
      await deleteImage(rutaThumbnailFull)
    } catch (err) {
      console.warn('Aviso thumb:', err.message)
    }
  }
}

module.exports = {
  uploadProductoImage,
  uploadCotizacionImage,
  uploadComponenteImage,
  deleteImage,
  deleteImageByPublicUrl,
  deleteProductoImage,
}

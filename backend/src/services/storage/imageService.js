const crypto = require('crypto');

const sharp = require('sharp');

const { supabaseAdmin } = require('../../integrations/supabaseAdmin');
const { HttpError } = require('../../utils/httpError');

const BUCKET_NAME = 'cotizaciones-images';

const IMAGE_RULES = {
  types: ['image/jpeg', 'image/png', 'image/webp'],
  maxSize: 5 * 1024 * 1024,
  minWidth: 400,
  minHeight: 300,
};

function validateImageFile(file) {
  if (!file || !file.buffer) {
    throw new HttpError(400, 'No se recibio ningun archivo');
  }

  if (!IMAGE_RULES.types.includes(file.mimetype)) {
    throw new HttpError(400, 'Tipo invalido. Solo se permiten JPEG, PNG o WebP');
  }

  if (file.size > IMAGE_RULES.maxSize) {
    throw new HttpError(400, 'La imagen no puede superar 5MB');
  }
}

async function getImageMetadata(file) {
  try {
    return await sharp(file.buffer).metadata();
  } catch {
    throw new HttpError(400, 'Imagen corrupta');
  }
}

function assertMinimumDimensions(metadata) {
  if (metadata.width < IMAGE_RULES.minWidth || metadata.height < IMAGE_RULES.minHeight) {
    throw new HttpError(400, `La imagen debe ser minimo ${IMAGE_RULES.minWidth}x${IMAGE_RULES.minHeight}px`);
  }
}

async function optimizeImage(file, metadata = null) {
  const pipeline = sharp(file.buffer);

  if (metadata?.width && metadata?.height) {
    pipeline.resize(metadata.width, metadata.height, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  return pipeline.webp({ quality: 80 }).toBuffer();
}

async function uploadToBucket(rutaBucket, buffer) {
  const { error } = await supabaseAdmin.storage.from(BUCKET_NAME).upload(rutaBucket, buffer, {
    contentType: 'image/webp',
    upsert: false,
  });

  if (error) {
    throw new Error(`Error al subir imagen: ${error.message}`);
  }
}

function getPublicUrl(rutaBucket) {
  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(rutaBucket);

  return publicUrl;
}

function safePathSegment(value, fallback = 'archivo') {
  const cleaned = String(value || fallback)
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  return cleaned || fallback;
}

async function uploadProductoImage(file, idProducto) {
  validateImageFile(file);

  const metadata = await getImageMetadata(file);
  assertMinimumDimensions(metadata);

  const hash = crypto.createHash('md5').update(file.buffer).digest('hex').slice(0, 12);
  const nombreArchivo = `${idProducto}-${Date.now()}-${hash}.webp`;
  const rutaBucket = `productos/${idProducto}/${nombreArchivo}`;
  const imageOptimizada = await optimizeImage(file, metadata);

  await uploadToBucket(rutaBucket, imageOptimizada);

  return {
    urlImagen: getPublicUrl(rutaBucket),
    nombreArchivo,
    rutaBucket,
    tamanio: imageOptimizada.length,
  };
}

async function uploadCotizacionImage(file, idCotizacion, tipo = 'adjunto') {
  validateImageFile(file);

  await getImageMetadata(file);

  const safeTipo = safePathSegment(tipo, 'adjunto');
  const nombreArchivo = `${idCotizacion}-${safeTipo}-${Date.now()}.webp`;
  const rutaBucket = `cotizaciones/${idCotizacion}/${nombreArchivo}`;
  const imageOptimizada = await optimizeImage(file);

  await uploadToBucket(rutaBucket, imageOptimizada);

  return {
    nombreArchivo,
    rutaBucket,
    urlImagen: getPublicUrl(rutaBucket),
    tipo: safeTipo,
    tamanio: imageOptimizada.length,
  };
}

async function uploadComponenteImage(file, idComponente) {
  validateImageFile(file);

  await getImageMetadata(file);

  const nombreArchivo = `${idComponente}-${Date.now()}.webp`;
  const rutaBucket = `componentes/${idComponente}/${nombreArchivo}`;
  const imageOptimizada = await optimizeImage(file);

  await uploadToBucket(rutaBucket, imageOptimizada);

  return {
    nombreArchivo,
    rutaBucket,
    urlImagen: getPublicUrl(rutaBucket),
    tamanio: imageOptimizada.length,
  };
}

async function deleteImage(rutaBucket) {
  if (!rutaBucket) return;

  const { error } = await supabaseAdmin.storage.from(BUCKET_NAME).remove([rutaBucket]);

  if (error) {
    throw new Error(`Error al eliminar imagen: ${error.message}`);
  }
}

function getBucketPathFromPublicUrl(urlImagen) {
  if (!urlImagen) return null;

  try {
    const { pathname } = new URL(urlImagen);
    const marker = `/${BUCKET_NAME}/`;
    const markerIndex = pathname.indexOf(marker);

    if (markerIndex === -1) return null;

    return decodeURIComponent(pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

async function deleteImageByPublicUrl(urlImagen) {
  const rutaBucket = getBucketPathFromPublicUrl(urlImagen);
  if (!rutaBucket) return;

  await deleteImage(rutaBucket);
}

async function deleteProductoImage(imagenData) {
  if (imagenData?.rutaBucket) {
    await deleteImage(imagenData.rutaBucket);
  }

  if (imagenData?.urlThumb && imagenData?.rutaBucket) {
    const rutaThumb = imagenData.urlThumb.split('/').slice(-1)[0];
    const rutaThumbnailFull = `${imagenData.rutaBucket.split('/').slice(0, -1).join('/')}/${rutaThumb}`;
    await deleteImage(rutaThumbnailFull).catch(() => undefined);
  }
}

module.exports = {
  uploadProductoImage,
  uploadCotizacionImage,
  uploadComponenteImage,
  deleteImage,
  deleteImageByPublicUrl,
  deleteProductoImage,
};

import { apiPost, apiDelete, apiGet, apiPut } from './http'

/**
 * Servicio centralizado para manejo de imágenes
 */

// ============ PRODUCTOS ============

export async function uploadImagenProducto(idProducto, file) {
  const formData = new FormData()
  formData.append('file', file)

  return apiPost(`/productos/${idProducto}/imagenes`, formData)
}

export async function getImagenesProducto(idProducto) {
  return apiGet(`/productos/${idProducto}/imagenes`)
}

export async function setImagenPrincipal(idImagen) {
  return apiPut(`/productos/imagenes/${idImagen}/principal`, {})
}

export async function deleteImagenProducto(idImagen) {
  return apiDelete(`/productos/imagenes/${idImagen}`)
}

// ============ COTIZACIONES ============

export async function uploadImagenCotizacion(idCotizacion, file, tipo = 'adjunto') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('tipo', tipo)

  return apiPost(`/cotizaciones/${idCotizacion}/imagenes`, formData)
}

export async function getImagenesCotizacion(idCotizacion) {
  return apiGet(`/cotizaciones/${idCotizacion}/imagenes`)
}

export async function deleteImagenCotizacion(idImagen) {
  return apiDelete(`/cotizaciones/imagenes/${idImagen}`)
}

// ============ COMPONENTES ============

export async function uploadImagenComponente(idComponente, file) {
  const formData = new FormData()
  formData.append('file', file)

  return apiPost(`/componentes/${idComponente}/imagenes`, formData)
}

export async function getImagenesComponente(idComponente) {
  return apiGet(`/componentes/${idComponente}/imagenes`)
}

export async function setImagenComponentePrincipal(idImagen) {
  return apiPut(`/componentes/imagenes/${idImagen}/principal`, {})
}

export async function deleteImagenComponente(idImagen) {
  return apiDelete(`/componentes/imagenes/${idImagen}`)
}

// ============ VALIDACIONES ============

const VALIDACIONES = {
  TIPOS_PERMITIDOS: ['image/jpeg', 'image/png', 'image/webp'],
  TAMANIO_MAX: 5 * 1024 * 1024, // 5MB
  ANCHO_MIN: 400,
  ALTO_MIN: 300,
}

export function validarImagen(file) {
  const errores = []

  if (!file) {
    errores.push('Selecciona un archivo')
    return errores
  }

  if (!VALIDACIONES.TIPOS_PERMITIDOS.includes(file.type)) {
    errores.push('Solo JPEG, PNG, WebP')
  }

  if (file.size > VALIDACIONES.TAMANIO_MAX) {
    errores.push(`Máximo ${Math.round(VALIDACIONES.TAMANIO_MAX / 1024 / 1024)}MB`)
  }

  return errores
}

export async function obtenerDimensionesImagen(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        resolve({ ancho: img.width, alto: img.height })
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

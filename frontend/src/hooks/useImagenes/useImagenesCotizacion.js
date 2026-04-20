import { useImagenesBase } from './useImagenesBase'
import {
  uploadImagenCotizacion,
  getImagenesCotizacion,
  deleteImagenCotizacion,
} from '../../services/api/imagenes'

/**
 * Hook para gestionar imágenes de cotizaciones
 */
export function useImagenesCotizacion(idCotizacion) {
  return useImagenesBase(idCotizacion, {
    fetchFn: getImagenesCotizacion,
    uploadFn: uploadImagenCotizacion,
    deleteFn: deleteImagenCotizacion,
  })
}

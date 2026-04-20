import { useImagenesBase } from './useImagenesBase'
import {
  uploadImagenProducto,
  getImagenesProducto,
  setImagenPrincipal,
  deleteImagenProducto,
} from '../../services/api/imagenes'

/**
 * Hook para gestionar imágenes de productos
 */
export function useImagenesProducto(idProducto) {
  return useImagenesBase(idProducto, {
    fetchFn: getImagenesProducto,
    uploadFn: uploadImagenProducto,
    setMainFn: setImagenPrincipal,
    deleteFn: deleteImagenProducto,
  })
}

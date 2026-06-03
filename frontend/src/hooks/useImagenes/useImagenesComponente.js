import { useImagenesBase } from './useImagenesBase'
import {
  uploadImagenComponente,
  getImagenesComponente,
  setImagenComponentePrincipal,
  deleteImagenComponente,
} from '../../services/api/imagenes'

/**
 * Hook para gestionar imágenes de componentes
 */
export function useImagenesComponente(idComponente) {
  return useImagenesBase(idComponente, {
    fetchFn: getImagenesComponente,
    uploadFn: uploadImagenComponente,
    setMainFn: setImagenComponentePrincipal,
    deleteFn: deleteImagenComponente,
  })
}

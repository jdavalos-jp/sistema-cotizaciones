/**
 * PRODUCTO MODULE - Index
 * Exporta todos los componentes, hooks y servicios del módulo
 */

// ============ COMPONENTS ============
export { default as ProductoForm } from './components/ProductoForm'
export { default as Productos } from './components/Productos'

// ============ HOOKS ============
export { useProductosList, useProducto } from './hooks/useProductosManager'
export { useCategoriesAndSubcategories } from './hooks/useCategoriesAndSubcategories'
export { useCategorias } from './hooks/useCategorias'
export { useSubcategorias } from './hooks/useSubcategorias'

// ============ API SERVICES ============
export {
  getCategorias,
  getSubcategoriasByCategoria,
  getProductos,
  getProducto,
  createProducto,
  updateProducto,
  deleteProducto,
  addImagenToProducto,
  deleteImagenFromProducto,
} from './services/api/productosApi'

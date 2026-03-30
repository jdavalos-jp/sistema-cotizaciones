/**
 * PRODUCTO MODULE - Index (Barrel Export)
 * 
 * Exporta la API pública del módulo Producto:
 * - Componentes: ProductoForm, Productos
 * - Hooks: useProducto, useProductosList (para gestión de estado)
 * - API: funciones de servicio (para llamadas directas al backend)
 * 
 * Nota: Los hooks internamente consumen las funciones de API,
 * pero se exportan ambas para máxima flexibilidad
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
} from './Services/api/productosApi'

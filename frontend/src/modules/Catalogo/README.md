# Módulo de Catálogo

## Descripción

Módulo integrado para gestionar el inventario completo de productos y componentes en una sola vista con dos tabs principales.

## Estructura

```
Catalogo/
├── components/
│   ├── index.js
│   ├── Catalogo.jsx                 # Componente principal con tabs
│   ├── ListaProductos.jsx           # Lista de productos
│   ├── ListaComponentes.jsx         # Lista de componentes
│   ├── FormEditarProducto.jsx       # Modal para editar producto
│   └── FormEditarComponente.jsx     # Modal para editar componente
├── hooks/
│   ├── index.js
│   └── useCatalogoManager.js        # Hooks para CRUD
└── index.js
```

## Características

✅ **Lista de Productos**
- Tabla con ID, Nombre, Descripción, Precio, Stock, Categoría
- Búsqueda en tiempo real
- Paginación
- Edición en modal
- Eliminación con confirmación
- Indicadores de stock (verde/rojo)

✅ **Lista de Componentes**
- Misma estructura que productos
- Búsqueda y filtros
- CRUD completo

✅ **Acciones**
- **Editar**: Abre modal con formulario
- **Eliminar**: Elimina con confirmación
- **Búsqueda**: Filtra en tiempo real
- **Paginación**: 10 items por página (configurable)

## Componentes Principales

### `Catalogo.jsx`
Componente principal que maneja:
- Dos tabs: Productos y Componentes
- Orquestación de vistas

### `ListaProductos.jsx` y `ListaComponentes.jsx`
Muestran:
- Tabla con todos los datos
- Búsqueda con input
- Botones de editar/eliminar
- Modal para editar
- Paginación integrada

### `FormEditarProducto.jsx` y `FormEditarComponente.jsx`
Formularios para:
- Editar nombre, descripción, precio, stock
- Validaciones básicas
- Submit con feedback

## Hooks

### `useProductosList()`
```javascript
const {
  productos,      // Array de productos
  loading,        // Estado de carga
  error,          // Mensaje de error
  pagination,     // Objeto con paginación
  loadProductos,  // Cargar productos
  updateProducto, // Actualizar producto
  deleteProducto, // Eliminar producto
  setPagination,  // Actualizar paginación
} = useProductosList()
```

### `useComponentesList()`
Mismo patrón para componentes.

## Uso

```javascript
import { Catalogo } from '@/modules/Catalogo'

// En tu componente
<Catalogo />
```

## API Endpoints Utilizados

- `GET /api/productos?skip=0&take=10&search=...` - Listar productos
- `GET /api/componentes?skip=0&take=10&search=...` - Listar componentes
- `PUT /api/productos/{id}` - Actualizar producto
- `PUT /api/componentes/{id}` - Actualizar componente
- `DELETE /api/productos/{id}` - Eliminar producto
- `DELETE /api/componentes/{id}` - Eliminar componente

## Notas

- El módulo es completamente modular y reutilizable
- Cada lista es un componente independiente
- Los hooks pueden usarse por separado
- Todas las tablas son responsive con `scroll.x`
- Validaciones básicas en formularios

# Módulo de Categorías

Este módulo contiene la gestión de categorías de productos con una interfaz modularizada.

## Estructura

```
Categorias/
├── components/
│   ├── CategoriasListPage.jsx      # Página principal (orquestador)
│   ├── CategoriesHeader.jsx        # Encabezado con título y botón agregar
│   ├── CategoriesSearchBar.jsx     # Buscador de categorías
│   ├── CategoriesTable.jsx         # Tabla principal de categorías
│   ├── CategoryCell.jsx            # Celda de categoría con avatar
│   ├── CategoryActions.jsx         # Acciones (editar, eliminar)
│   ├── StatusBadge.jsx             # Badge de estado
│   └── index.js                    # Exportaciones
├── hooks/
│   ├── useCategorias.js            # Hook para lógica de categorías
│   └── index.js                    # Exportaciones
├── index.js                        # Exportaciones principales
└── README.md                       # Este archivo
```

## Componentes

### CategoriasListPage
Página principal que orquesta todos los sub-componentes. Maneja el estado general y las operaciones principales.

### CategoriesHeader
Encabezado con título y botón para agregar categoría.
```jsx
<CategoriesHeader onAddCategory={handleAddCategory} />
```

### CategoriesSearchBar
Buscador para filtrar categorías por nombre.
```jsx
<CategoriesSearchBar value={searchTerm} onChange={handleSearch} />
```

### CategoriesTable
Tabla principal con todas las categorías y acciones.
```jsx
<CategoriesTable
  categorias={categorias}
  loading={loading}
  pagination={pagination}
  onPaginationChange={handlePaginationChange}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### CategoryCell
Muestra el avatar y nombre de la categoría en la tabla.

### CategoryActions
Botones de acción: editar y eliminar.

### StatusBadge
Badge coloreado que indica el estado de la categoría (Activo/Inactivo).

## Hook

### useCategorias
Hook personalizado para gestionar categorías:
- `loadCategorias(skip, search)`: Carga categorías con búsqueda y paginación
- `deleteCategoria(id)`: Elimina una categoría
- `categories`: Array de categorías
- `loading`: Estado de carga
- `pagination`: Información de paginación

## Uso

```jsx
import { CategoriasListPage, useCategorias } from '@/modules/Categorias'

// En una ruta o página
function MyPage() {
  return <CategoriasListPage />
}

// O usar el hook directamente
function MyComponent() {
  const { categorias, loadCategorias } = useCategorias()
  
  return (...)
}
```

## Flujo de Datos

```
CategoriasListPage (orquestador)
├── useCategorias (datos y lógica)
└── Sub-componentes
    ├── CategoriesHeader
    ├── CategoriesSearchBar
    └── CategoriesTable
        ├── CategoryCell
        ├── CategoryActions
        └── StatusBadge
```

## TODO

- [ ] Implementar modal de creación/edición de categorías
- [ ] Conectar acciones de edición y eliminación con API
- [ ] Agregar validación de formularios
- [ ] Implementar confirmación visual de cambios

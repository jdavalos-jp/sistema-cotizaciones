# 📦 Módulo de Catálogo Integrado - Guía de Uso

## 🎯 Objetivo

Crear una vista centralizada para gestionar el inventario completo (Productos y Componentes) con listados separados, búsqueda, edición y eliminación.

## 📂 Estructura Creada

```
src/modules/Catalogo/
├── components/
│   ├── index.js                      # Exporta todos los componentes
│   ├── Catalogo.jsx                  # 🎛️ Componente principal/orquestador
│   ├── ListaProductos.jsx            # 📋 Tabla de productos
│   ├── ListaComponentes.jsx          # 📋 Tabla de componentes
│   ├── FormEditarProducto.jsx        # 📝 Modal edición producto
│   └── FormEditarComponente.jsx      # 📝 Modal edición componente
├── hooks/
│   ├── index.js                      # Exporta todos los hooks
│   └── useCatalogoManager.js         # 🪝 Hooks para CRUD
├── README.md                         # Documentación
└── index.js                          # Exporta todo el módulo
```

## 🚀 Características

### 1️⃣ Lista de Productos
| Columna | Tipo | Descripción |
|---------|------|-------------|
| ID | Código | ID del producto |
| Nombre | Texto | Nombre del producto |
| Descripción | Texto | Descripción completa |
| Precio | Número | Precio en Bs |
| Stock | Número | Unidades disponibles |
| Categoría | Texto | Categoría del producto |
| Acciones | Botones | Editar / Eliminar |

### 2️⃣ Lista de Componentes
Misma estructura que productos

### 3️⃣ Funcionalidades
- 🔍 **Búsqueda**: Filtra en tiempo real
- 📄 **Paginación**: 10 items por página
- ✏️ **Editar**: Abre modal con formulario
- 🗑️ **Eliminar**: Con confirmación
- 💾 **Guardar**: Actualiza en la API
- ⚡ **Responsive**: Funciona en mobile y desktop

## 🎨 Status Visual

- **Stock Alto**: Badge verde ✅
- **Sin Stock**: Badge rojo ❌
- **Precio**: Destacado en azul

## 📍 Acceso

**Menú Principal** → **Catálogo** → **Ver Catálogo Completo**

## 💻 Ejemplo de Uso

```jsx
import { Catalogo } from '@/modules/Catalogo'

export function MiComponente() {
  return <Catalogo />
}

// O importar partes específicas:
import { ListaProductos, ListaComponentes, useProductosList } from '@/modules/Catalogo'

export function MisProductos() {
  return <ListaProductos />
}
```

## 🛠️ Hooks Disponibles

### `useProductosList()`
```javascript
const {
  productos,      // Array de productos cargados
  loading,        // boolean: está cargando
  error,          // string: mensaje de error
  pagination,     // { current, pageSize, total }
  loadProductos,  // (options) => Promise
  updateProducto, // (id, data) => Promise
  deleteProducto, // (id) => Promise
  setPagination,  // (newPagination) => void
} = useProductosList()
```

### `useComponentesList()`
Idéntico a products pero para componentes

## 📝 Formularios de Edición

Ambos formularios permiten editar:
- Nombre
- Descripción
- Precio (con validación)
- Stock (con validación)

## 🔗 APIs Utilizadas

```
GET    /api/productos              # Listar (con paginación y búsqueda)
GET    /api/componentes            # Listar (con paginación y búsqueda)
PUT    /api/productos/{id}         # Actualizar
PUT    /api/componentes/{id}       # Actualizar
DELETE /api/productos/{id}         # Eliminar
DELETE /api/componentes/{id}       # Eliminar
```

## ✨ Características Especiales

✅ **Modularidad**: Cada tabla es independiente  
✅ **Reutilizable**: Importa solo lo que necesites  
✅ **Responsive**: Scroll horizontal en móvil  
✅ **Validaciones**: Formularios con reglas  
✅ **Feedback**: Toast notifications  
✅ **Confirmaciones**: Eliminar con confirmación  
✅ **Búsqueda RealTime**: Filtra mientras escribes  
✅ **Ant Design**: UI moderna y consistente  

## 🐛 Notas de Desarrollo

- Las búsquedas son case-insensitive
- El scroll horizontal se activa en < 1200px
- La paginación reinicia al buscar
- Los errores se muestran con toast
- Las acciones son asincrónicas
- Se usa fetch en lugar de axios

---

**Creado**: Marzo 2026  
**Módulo**: Catálogo / Inventario  
**Status**: ✅ Activo

# Guía Completa - Frontend Gestión de Productos

## 📋 Tabla de Contenidos
1. [Estructura de Archivos](#estructura-de-archivos)
2. [Servicios API](#servicios-api)
3. [Hooks Personalizados](#hooks-personalizados)
4. [Componentes](#componentes)
5. [Ejemplos de Uso](#ejemplos-de-uso)
6. [Integración en tu App](#integración-en-tu-app)

---

## 📁 Estructura de Archivos

```
frontend/src/modules/Producto/
├── services/
│   └── api/
│       └── productosApi.js          # Servicios para consumir API
├── hooks/
│   ├── useCategoriesAndSubcategories.js    # Hook para categorías/subcategorías
│   └── useProductosManager.js        # Hooks para CRUD de productos
├── components/
│   ├── ProductoForm.jsx              # Formulario de registro/edición
│   └── Productos.jsx                 # Listado de productos
└── Services/
    └── api/
        ├── categoriasApi.js         # ⚠️ DEPRECADO - Usar productosApi
        ├── productosApi.js          # ⚠️ DEPRECADO - Usar productosApi
        └── subcategoriasApi.js      # ⚠️ DEPRECADO - Usar productosApi
```

---

## 🔌 Servicios API

### Localización
`frontend/src/modules/Producto/services/api/productosApi.js`

### Funciones Disponibles

#### 1. **getCategorias()**
Obtiene todas las categorías activas.

```javascript
import { getCategorias } from '@/modules/Producto/services/api/productosApi'

const response = await getCategorias()
// Retorna: Array de categorías
// [
//   { idCategoria: 1, nombre: "Electrónica", descripcion: "..." },
//   { idCategoria: 2, nombre: "Hardware", descripcion: "..." },
//   ...
// ]
```

#### 2. **getSubcategoriasByCategoria(idCategoria)**
Obtiene subcategorías filtradas por categoría.

```javascript
const subcategorias = await getSubcategoriasByCategoria(1)
// Retorna: Array de subcategorías
// [
//   { idSubcategoria: 10, idCategoria: 1, nombre: "Electrónica de Consumo" },
//   { idSubcategoria: 11, idCategoria: 1, nombre: "Componentes" },
//   ...
// ]
```

#### 3. **getProductos(options)**
Lista productos con filtros y paginación.

```javascript
const response = await getProductos({
  skip: 0,              // Indica desde dónde
  take: 50,             // Cantidad a traer
  search: "cable",      // Buscar por nombre/descripción
  idCategoria: 1,       // Filtrar por categoría
  idSubcategoria: 10,   // Filtrar por subcategoría
})

// Retorna: { data: [...], total: 156 }
```

#### 4. **getProducto(idProducto)**
Obtiene un producto completo con sus relaciones.

```javascript
const producto = await getProducto(5)
// Retorna:
// {
//   idProducto: 5,
//   nombre: "Cable USB 2.0",
//   descripcion: "Cable USB 2.0 de 2 metros...",
//   sku: "CABLE-USB-2M",
//   precioBase: "15.99",
//   idCategoria: 1,
//   idSubcategoria: 10,
//   estado: "activo",
//   imagenes: [
//     {
//       idImagen: 100,
//       urlImagen: "https://...",
//       orden: 1,
//       principal: true,
//       fechaCreacion: "2024-01-15T..."
//     }
//   ],
//   categoria: { ... },
//   subcategoria: { ... },
//   componentes: [ ... ]
// }
```

#### 5. **createProducto(payload)**
Crea un nuevo producto.

```javascript
const newProducto = await createProducto({
  nombre: "Cable USB 2.0",
  descripcion: "Cable USB 2.0 de 2 metros, compatible con dispositivos...",
  sku: "CABLE-USB-2M",
  precioBase: 15.99,
  idCategoria: 1,
  idSubcategoria: 10,
  imagenPrincipal: "https://ejemplo.com/imagen.jpg" // opcional
})
```

#### 6. **updateProducto(idProducto, payload)**
Actualiza un producto existente.

```javascript
const updated = await updateProducto(5, {
  nombre: "Cable USB 3.0",
  precioBase: 25.99,
  // puedes actualizar solo los campos que necesites
})
```

#### 7. **deleteProducto(idProducto)**
Elimina un producto.

```javascript
await deleteProducto(5)
```

#### 8. **addImagenToProducto(idProducto, payload)**
Agrega una imagen a un producto.

```javascript
const imagen = await addImagenToProducto(5, {
  urlImagen: "https://ejemplo.com/imagen2.jpg",
  orden: 2,
  principal: false  // si es true, se convierte en principal
})
```

#### 9. **deleteImagenFromProducto(idImagen)**
Elimina una imagen de un producto.

```javascript
await deleteImagenFromProducto(100)
```

---

## 🎣 Hooks Personalizados

### 1. **useCategoriesAndSubcategories()**

Hook para gestionar categorías y subcategorías con carga automática y dependencias.

#### Localización
`frontend/src/modules/Producto/hooks/useCategoriesAndSubcategories.js`

#### Uso Completo

```javascript
import { useCategoriesAndSubcategories } from '@/modules/Producto/hooks/useCategoriesAndSubcategories'

export function MiComponente() {
  const {
    categorias,           // Array de categorías
    subcategorias,        // Array de subcategorías (vacío hasta seleccionar categoría)
    loadingCategorias,    // Boolean - está cargando categorías
    loadingSubcategorias, // Boolean - está cargando subcategorías
    error,                // String con mensaje de error (si hay)
    fetchCategorias,      // Función para recargar categorías
    fetchSubcategorias,   // Función para cargar subcategorías por ID
  } = useCategoriesAndSubcategories()

  return (
    <div>
      {/* Categorías se cargan automáticamente */}
      <p>Categorías: {categorias.length}</p>
      
      {/* Cargar subcategorías cuando selecciona categoría */}
      <button onClick={() => fetchSubcategorias(1)}>
        Cargar subcategorías de Electrónica
      </button>
    </div>
  )
}
```

#### Características
- ✅ Las categorías se cargan automáticamente al montar el componente
- ✅ Las subcategorías se cargan cuando llamas `fetchSubcategorias(idCategoria)`
- ✅ Maneja estados de carga individuales
- ✅ Captura y reporta errores

---

### 2. **useProductosList()**

Hook para listar productos con filtros, búsqueda y paginación.

#### Localización
`frontend/src/modules/Producto/hooks/useProductosManager.js`

#### Uso Completo

```javascript
import { useProductosList } from '@/modules/Producto/hooks/useProductosManager'

export function ListadoProductos() {
  const {
    productos,            // Array de productos
    loading,              // Boolean - está cargando
    error,                // String con mensaje de error
    pagination,           // { skip: 0, take: 50, total: 156 }
    filters,              // { search: '', idCategoria: null, idSubcategoria: null }
    handleFilterChange,   // Función para cambiar filtros
    handlePagination,     // Función para cambiar página
    refresh,              // Función para recargar datos
  } = useProductosList()

  const handleSearch = (valor) => {
    handleFilterChange({ search: valor })
  }

  const handleCategoriaFilter = (idCategoria) => {
    handleFilterChange({ idCategoria, idSubcategoria: null })
  }

  const handleNextPage = () => {
    handlePagination(pagination.skip + pagination.take, pagination.take)
  }

  if (loading) return <p>Cargando productos...</p>
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>

  return (
    <div>
      <input
        placeholder="Buscar productos..."
        onChange={(e) => handleSearch(e.target.value)}
      />
      <button onClick={refresh}>Recargar</button>
      
      <ul>
        {productos.map(p => (
          <li key={p.idProducto}>{p.nombre} - ${p.precioBase}</li>
        ))}
      </ul>

      <p>Total: {pagination.total} productos</p>
      <button onClick={handleNextPage}>Siguiente página</button>
    </div>
  )
}
```

#### Características
- ✅ Filtros: búsqueda, categoría, subcategoría
- ✅ Paginación automática
- ✅ Manejo de estados de carga y error
- ✅ Función refresh para recargar datos

---

### 3. **useProducto(idProductoEdit?)**

Hook para gestionar un producto individual (crear, actualizar, eliminar, agregar/eliminar imágenes).

#### Localización
`frontend/src/modules/Producto/hooks/useProductosManager.js`

#### Uso Completo

```javascript
import { useProducto } from '@/modules/Producto/hooks/useProductosManager'

// Para CREAR un nuevo producto
export function CrearProducto() {
  const {
    producto,       // null hasta que se cree
    loading,        // Boolean
    error,          // String
    createProducto, // Función async para crear
    addImagen,      // Función para agregar imágenes
  } = useProducto()

  const handleCrear = async () => {
    try {
      const nuevoProducto = await createProducto({
        nombre: "Cable USB 2.0",
        descripcion: "...",
        sku: "CABLE-USB-2M",
        precioBase: 15.99,
        idCategoria: 1,
        idSubcategoria: 10,
      })
      console.log('Producto creado:', nuevoProducto)
    } catch (err) {
      console.error('Error al crear:', err)
    }
  }

  return (
    <button onClick={handleCrear} disabled={loading}>
      {loading ? 'Creando...' : 'Crear Producto'}
    </button>
  )
}

// Para EDITAR un producto existente
export function EditarProducto({ idProducto }) {
  const {
    producto,         // Datos del producto (se cargan automáticamente)
    loading,          // Boolean
    error,            // String
    updateProducto,   // Función para actualizar
    deleteProducto,   // Función para eliminar
    addImagen,        // Función para agregar imágenes
    deleteImagen,     // Función para eliminar imágenes
  } = useProducto(idProducto) // ← Pasa el ID aquí

  const handleActualizar = async () => {
    try {
      const actualizado = await updateProducto({
        nombre: "Nuevo nombre",
        precioBase: 25.99,
      })
      console.log('Actualizado:', actualizado)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const handleEliminar = async () => {
    if (confirm('¿Estás seguro?')) {
      try {
        await deleteProducto()
        console.log('Producto eliminado')
      } catch (err) {
        console.error('Error al eliminar:', err)
      }
    }
  }

  const handleAgregarImagen = async () => {
    try {
      const nuevaImagen = await addImagen({
        urlImagen: "https://ejemplo.com/imagen.jpg",
        principal: false,
        orden: 2,
      })
      console.log('Imagen agregada:', nuevaImagen)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  if (loading) return <p>Cargando producto...</p>
  if (!producto) return <p>Producto no encontrado</p>
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>

  return (
    <div>
      <h2>{producto.nombre}</h2>
      <p>Precio: ${producto.precioBase}</p>
      <button onClick={handleActualizar}>Actualizar</button>
      <button onClick={handleEliminar} style={{ color: 'red' }}>Eliminar</button>
      <button onClick={handleAgregarImagen}>Agregar Imagen</button>
    </div>
  )
}
```

#### Características
- ✅ Carga automática de producto si pasas `idProductoEdit`
- ✅ Funciones para crear, actualizar, eliminar
- ✅ Funciones para agregar/eliminar imágenes
- ✅ Gestión automática de estado de carga
- ✅ Manejo de errores

---

## 🎨 Componentes

### ProductoForm.jsx

Componente de formulario para registrar o editar productos con validaciones.

#### Localización
`frontend/src/modules/Producto/components/ProductoForm.jsx`

#### Props

| Prop | Tipo | Requerido | Descripción |
|------|------|----------|-------------|
| `onSuccess` | function | No | Callback ejecutado después de guardar |
| `idProductoEdit` | number | No | ID del producto a editar (si es null, se crea nuevo) |

#### Uso

```javascript
import { useState } from 'react'
import ProductoForm from '@/modules/Producto/components/ProductoForm'

export function MiApp() {
  const [mostrarForm, setMostrarForm] = useState(false)

  return (
    <div>
      <button onClick={() => setMostrarForm(!mostrarForm)}>
        Registrar Producto
      </button>

      {mostrarForm && (
        <ProductoForm
          onSuccess={() => {
            setMostrarForm(false)
            // recargar lista de productos
          }}
        />
      )}
    </div>
  )
}
```

#### Campos del Formulario

1. **Categoría** (requerido)
   - Dropdown con todas las categorías
   - Carga automáticamente subcategorías

2. **Subcategoría** (opcional)
   - Depende de la categoría seleccionada
   - Se habilita solo si hay categoría

3. **Nombre** (requerido)
   - Mínimo 3 caracteres
   - Máximo 255 caracteres

4. **Descripción** (requerido)
   - Mínimo 10 caracteres
   - Máximo 1000 caracteres
   - TextArea para más espacio

5. **SKU / Código** (requerido)
   - Solo mayúsculas, números, guiones y guiones bajos
   - Entre 3 y 50 caracteres
   - Ejemplo: `CABLE-USB-2M`

6. **Precio Base** (requerido)
   - Solo números positivos
   - Hasta 2 decimales

7. **Imagen Principal** (opcional)
   - URL de una imagen
   - Se usa como principal en el catálogo

#### Ejemplo Completo

```javascript
import ProductoForm from '@/modules/Producto/components/ProductoForm'

// Registrar nuevo producto
export function RegistroProducto() {
  return (
    <ProductoForm
      onSuccess={() => {
        console.log('Producto registrado')
        // actualizar tabla de productos
      }}
    />
  )
}

// Editar producto existente
export function EditarProducto({ idProducto }) {
  return (
    <ProductoForm
      idProductoEdit={idProducto}
      onSuccess={() => {
        console.log('Producto actualizado')
      }}
    />
  )
}
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Componente con Formulario y Listado

```javascript
import { useState } from 'react'
import { Table, Button, Space, Modal, message } from 'antd'
import ProductoForm from '@/modules/Producto/components/ProductoForm'
import { useProductosList } from '@/modules/Producto/hooks/useProductosManager'

export function GestorProductos() {
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const {
    productos,
    loading,
    handleFilterChange,
    refresh,
  } = useProductosList()

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Precio',
      dataIndex: 'precioBase',
      key: 'precio',
      render: (texto) => `$${texto}`,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setEditingId(record.idProducto)
              setModalVisible(true)
            }}
          >
            Editar
          </Button>
          <Button
            type="link"
            danger
            onClick={() => {
              Modal.confirm({
                title: '¿Eliminar producto?',
                okText: 'Sí',
                cancelText: 'No',
                onOk: async () => {
                  try {
                    await productosApi.deleteProducto(record.idProducto)
                    message.success('Producto eliminado')
                    refresh()
                  } catch (err) {
                    message.error('Error al eliminar')
                  }
                },
              })
            }}
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Button
        type="primary"
        onClick={() => {
          setEditingId(null)
          setModalVisible(true)
        }}
        style={{ marginBottom: 16 }}
      >
        Nuevo Producto
      </Button>

      <Table
        dataSource={productos}
        columns={columns}
        loading={loading}
        rowKey="idProducto"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? 'Editar Producto' : 'Nuevo Producto'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <ProductoForm
          idProductoEdit={editingId}
          onSuccess={() => {
            setModalVisible(false)
            refresh()
          }}
        />
      </Modal>
    </div>
  )
}
```

### Ejemplo 2: Búsqueda con Autocomplete

```javascript
import { AutoComplete, Input } from 'antd'
import { useProductosList } from '@/modules/Producto/hooks/useProductosManager'

export function BuscadorProductos() {
  const [busqueda, setBusqueda] = useState('')
  const { productos, handleFilterChange, loading } = useProductosList()

  return (
    <AutoComplete
      placeholder="Buscar producto..."
      value={busqueda}
      onChange={setBusqueda}
      onSelect={() => {
        handleFilterChange({ search: busqueda })
      }}
      options={productos.map(p => ({
        label: `${p.nombre} (${p.sku})`,
        value: p.idProducto,
      }))}
      loading={loading}
    />
  )
}
```

### Ejemplo 3: Filtros por Categoría

```javascript
import { Select } from 'antd'
import { useCategoriesAndSubcategories } from '@/modules/Producto/hooks/useCategoriesAndSubcategories'
import { useProductosList } from '@/modules/Producto/hooks/useProductosManager'

export function FiltrosPorCategoria() {
  const { categorias, subcategorias, fetchSubcategorias } =
    useCategoriesAndSubcategories()
  const { handleFilterChange } = useProductosList()

  const handleCategoriaChange = (idCategoria) => {
    fetchSubcategorias(idCategoria)
    handleFilterChange({ idCategoria, idSubcategoria: null })
  }

  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <Select
        placeholder="Categoría"
        style={{ width: 200 }}
        onChange={handleCategoriaChange}
        options={categorias.map(c => ({
          label: c.nombre,
          value: c.idCategoria,
        }))}
      />

      <Select
        placeholder="Subcategoría"
        style={{ width: 200 }}
        onChange={(id) => handleFilterChange({ idSubcategoria: id })}
        options={subcategorias.map(s => ({
          label: s.nombre,
          value: s.idSubcategoria,
        }))}
      />
    </div>
  )
}
```

---

## 🔗 Integración en tu App

### Paso 1: Importar el Componente o Hook en tu Página

```javascript
// Opción 1: Usar el formulario directamente
import ProductoForm from '@/modules/Producto/components/ProductoForm'

// Opción 2: Usar los hooks directamente
import { useProductosList, useProducto } from '@/modules/Producto/hooks/useProductosManager'
import { useCategoriesAndSubcategories } from '@/modules/Producto/hooks/useCategoriesAndSubcategories'
```

### Paso 2: Añadir a la Navegación (AppLayout.jsx)

```javascript
import { Layout, Menu } from 'antd'

export function AppLayout() {
  return (
    <Layout>
      <Menu>
        <Menu.Item key="productos">
          <Link to="/productos">
            Productos
          </Link>
        </Menu.Item>
        <Menu.SubMenu key="administrador" title="Administrador">
          <Menu.Item key="registrar-producto">
            <Link to="/admin/productos/nuevo">
              Registrar Producto
            </Link>
          </Menu.Item>
        </Menu.SubMenu>
      </Menu>
    </Layout>
  )
}
```

### Paso 3: Crear Rutas (Ejemplo con React Router v6)

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import GestorProductos from '@/modules/Producto/pages/GestorProductos'
import RegistroProducto from '@/modules/Producto/pages/RegistroProducto'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/productos" element={<GestorProductos />} />
        <Route path="/admin/productos/nuevo" element={<RegistroProducto />} />
      </Routes>
    </BrowserRouter>
  )
}
```

---

## ✅ Checklist de Implementación

- [ ] API service actualizado (`productosApi.js`)
- [ ] Hooks creados (`useProductosManager.js`, `useCategoriesAndSubcategories.js`)
- [ ] Componente formulario actualizado (`ProductoForm.jsx`)
- [ ] Dependencias instaladas (Ant Design, React)
- [ ] Rutas configuradas en tu app
- [ ] Navegación actualizada
- [ ] Probado en navegador
- [ ] Validaciones funcionando
- [ ] Imágenes cargándose correctamente
- [ ] Los estados de carga se muestran al usuario

---

## 🐛 Troubleshooting

### Error: "Cannot find module..."
- Verifica las rutas de importación
- Asegúrate de que los archivos existan en las rutas correctas

### Error: "categorias is undefined"
- Verifica que estés destructurando correctamente del hook
- Asegúrate de que las categorías se cargan (revisa `loadingCategorias`)

### El formulario no guarda
- Abre la consola del navegador (F12) y revisa los errores
- Verifica que el backend esté corriendo
- Comprueba que la URL de API es correcta

### Las subcategorías no se actualizan
- Llama correctamente a `fetchSubcategorias(idCategoria)`
- Verifica que el `idCategoria` sea un número válido

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los errores en la consola (F12)
2. Comprueba que los endpoints del backend estén activos
3. Verifica que los datos se retornen correctamente desde el API


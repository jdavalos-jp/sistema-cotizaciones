# 📦 API de Productos - Documentación Completa

## 🔍 Endpoints de Filtros

### 1. **Obtener Categorías**
```
GET /api/productos/categorias/list
```

**Descripción:** Obtiene todas las categorías activas para mostrar en el filtro

**Respuesta:**
```json
{
  "ok": true,
  "data": [
    {
      "idCategoria": "1",
      "nombre": "Electrónica",
      "descripcion": "Productos electrónicos"
    },
    {
      "idCategoria": "2",
      "nombre": "Accesorios",
      "descripcion": "Accesorios varios"
    }
  ]
}
```

---

### 2. **Obtener Subcategorías por Categoría**
```
GET /api/productos/subcategorias/:idCategoria
```

**Parámetros URL:**
- `idCategoria` (requerido): ID de la categoría

**Ejemplo:**
```bash
curl -X GET "http://localhost:3001/api/productos/subcategorias/1"
```

**Respuesta:**
```json
{
  "ok": true,
  "data": [
    {
      "idSubcategoria": "5",
      "nombre": "Laptops",
      "descripcion": "Computadoras portátiles"
    },
    {
      "idSubcategoria": "6",
      "nombre": "Smartphones",
      "descripcion": "Teléfonos inteligentes"
    }
  ]
}
```

---

## 📝 Endpoints de Productos

### 3. **Listar Productos**
```
GET /api/productos
```

**Parámetros Query:**
- `skip` (opcional): Registros a saltar (default: 0)
- `take` (opcional): Registros a traer max 200 (default: 50)
- `search` (opcional): Buscar por nombre o SKU
- `idCategoria` (opcional): Filtrar por categoría
- `idSubcategoria` (opcional): Filtrar por subcategoría

**Ejemplo:**
```bash
curl -X GET "http://localhost:3001/api/productos?skip=0&take=20&idCategoria=1&search=laptop"
```

**Respuesta:**
```json
{
  "ok": true,
  "data": [
    {
      "idProducto": "10",
      "nombre": "Laptop Dell XPS 13",
      "descripcion": "Laptop ultraportátil de 13 pulgadas",
      "precioBase": "1200.00",
      "sku": "DELL-XPS-13",
      "estado": "activo",
      "idCategoria": "1",
      "idSubcategoria": "5",
      "imagenes": [
        {
          "idImagen": "45",
          "urlImagen": "https://example.com/img1.jpg",
          "principal": true
        }
      ],
      "categoria": { "nombre": "Electrónica" },
      "subcategoria": { "nombre": "Laptops" }
    }
  ]
}
```

---

### 4. **Obtener Producto por ID**
```
GET /api/productos/:id
```

**Parámetros URL:**
- `id` (requerido): ID del producto

**Ejemplo:**
```bash
curl -X GET "http://localhost:3001/api/productos/10"
```

**Respuesta:**
```json
{
  "ok": true,
  "data": {
    "idProducto": "10",
    "nombre": "Laptop Dell XPS 13",
    "descripcion": "Laptop ultraportátil de 13 pulgadas",
    "precioBase": "1200.00",
    "sku": "DELL-XPS-13",
    "estado": "activo",
    "idCategoria": "1",
    "idSubcategoria": "5",
    "imagenes": [
      {
        "idImagen": "45",
        "urlImagen": "https://example.com/img1.jpg",
        "orden": 1,
        "principal": true
      }
    ],
    "categoria": {
      "idCategoria": "1",
      "nombre": "Electrónica"
    },
    "subcategoria": {
      "idSubcategoria": "5",
      "nombre": "Laptops"
    }
  }
}
```

---

### 5. **Crear Producto**
```
POST /api/productos
```

**Body:**
```json
{
  "nombre": "Laptop HP Pavilion 15",
  "descripcion": "Laptop 15 pulgadas con procesador Intel Core i7",
  "precioBase": "900.00",
  "sku": "HP-PAV-15",
  "idCategoria": "1",
  "idSubcategoria": "5",
  "imagenPrincipal": "https://example.com/hp-pavilion.jpg"
}
```

**Campos requeridos:**
- `nombre` (string)
- `precioBase` (number)
- `idCategoria` (number)

**Campos opcionales:**
- `descripcion` (string)
- `sku` (string)
- `idSubcategoria` (number)
- `imagenPrincipal` (string - URL)

**Ejemplo:**
```bash
curl -X POST "http://localhost:3001/api/productos" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Laptop HP",
    "descripcion": "Descripción",
    "precioBase": 900,
    "sku": "HP-001",
    "idCategoria": 1,
    "idSubcategoria": 5,
    "imagenPrincipal": "https://example.com/img.jpg"
  }'
```

**Respuesta:**
```json
{
  "ok": true,
  "data": {
    "idProducto": "11",
    "nombre": "Laptop HP Pavilion 15",
    "descripcion": "Laptop 15 pulgadas con procesador Intel Core i7",
    "precioBase": "900.00",
    "sku": "HP-PAV-15",
    "estado": "activo",
    "idCategoria": "1",
    "idSubcategoria": "5",
    "imagenes": [
      {
        "idImagen": "46",
        "urlImagen": "https://example.com/hp-pavilion.jpg",
        "orden": 1,
        "principal": true
      }
    ]
  }
}
```

---

### 6. **Actualizar Producto**
```
PUT /api/productos/:id
```

**Parámetros URL:**
- `id` (requerido): ID del producto

**Body (todos opcionales):**
```json
{
  "nombre": "Laptop HP Pavilion 15 - Updated",
  "descripcion": "Nueva descripción",
  "precioBase": "950.00",
  "sku": "HP-PAV-15-NEW",
  "idCategoria": "1",
  "idSubcategoria": "5"
}
```

**Ejemplo:**
```bash
curl -X PUT "http://localhost:3001/api/productos/11" \
  -H "Content-Type: application/json" \
  -d '{"precioBase": 950, "sku": "HP-NEW"}'
```

---

### 7. **Eliminar Producto**
```
DELETE /api/productos/:id
```

**Parámetros URL:**
- `id` (requerido): ID del producto

**Ejemplo:**
```bash
curl -X DELETE "http://localhost:3001/api/productos/11"
```

**Respuesta:**
```json
{
  "ok": true,
  "message": "Producto eliminado"
}
```

---

## 🖼️ Endpoints de Imágenes

### 8. **Agregar Imagen a Producto**
```
POST /api/productos/:id/imagenes
```

**Parámetros URL:**
- `id` (requerido): ID del producto

**Body:**
```json
{
  "urlImagen": "https://example.com/imagen-adicional.jpg",
  "principal": false,
  "orden": 2
}
```

**Campos requeridos:**
- `urlImagen` (string - URL de la imagen)

**Campos opcionales:**
- `principal` (boolean, default: false) - Si es verdadero, establece esta como principal
- `orden` (number, default: 1) - Orden de visualización

**Ejemplo:**
```bash
curl -X POST "http://localhost:3001/api/productos/10/imagenes" \
  -H "Content-Type: application/json" \
  -d '{
    "urlImagen": "https://example.com/otra-foto.jpg",
    "principal": false,
    "orden": 2
  }'
```

**Respuesta:**
```json
{
  "ok": true,
  "data": {
    "idImagen": "47",
    "idProducto": "10",
    "urlImagen": "https://example.com/otra-foto.jpg",
    "orden": 2,
    "principal": false,
    "fechaCreacion": "2026-03-17T14:30:00Z"
  }
}
```

---

### 9. **Eliminar Imagen de Producto**
```
DELETE /api/productos/imagenes/:idImagen
```

**Parámetros URL:**
- `idImagen` (requerido): ID de la imagen

**Ejemplo:**
```bash
curl -X DELETE "http://localhost:3001/api/productos/imagenes/47"
```

**Respuesta:**
```json
{
  "ok": true,
  "message": "Imagen eliminada"
}
```

---

## 🔄 Flujo de Registro de Producto Completo

### Paso 1: Obtener Categorías
```bash
GET /api/productos/categorias/list
```

### Paso 2: Obtener Subcategorías (selecciona categoría)
```bash
GET /api/productos/subcategorias/1
```

### Paso 3: Crear Producto
```bash
POST /api/productos
{
  "nombre": "Mi Producto",
  "descripcio": "Descripción",
  "precioBase": 100,
  "sku": "SKU-001",
  "idCategoria": 1,
  "idSubcategoria": 5,
  "imagenPrincipal": "https://example.com/img.jpg"
}
```

### Paso 4 (Opcional): Agregar más imágenes
```bash
POST /api/productos/10/imagenes
{
  "urlImagen": "https://example.com/img2.jpg",
  "orden": 2
}
```

---

## 💾 Datos por Campo

| Campo | Tipo | Requerido | Descripción | Ejemplo |
|-------|------|-----------|-------------|---------|
| nombre | string | ✅ | Nombre del producto | "Laptop Dell" |
| descripcion | string | - | Descripción | "Laptop de 15 pulgadas" |
| precioBase | decimal | ✅ | Precio del producto | 1200.00 |
| sku | string | - | Código único | "DELL-XPS-13" |
| idCategoria | number | ✅ | ID de categoría | 1 |
| idSubcategoria | number | - | ID de subcategoría | 5 |
| imagenPrincipal | string (URL) | - | URL de imagen principal | "https://..." |

---

## ✅ Validaciones

- ✅ Nombre no puede estar vacío
- ✅ Precio debe ser positivo
- ✅ Categoría debe existir
- ✅ Subcategoría debe pertenecer a la categoría seleccionada
- ✅ URLs de imágenes válidas
- ✅ IDs válidos (BigInt)

---

## 🧪 Importar en Postman

Descarga la colección en: `backend/PRODUCTOS_API.postman_collection.json` (próximamente)

O importa manualmente usando los endpoints de arriba.

---

## ✨ Estado

✅ **Endpoints completos y listos**
✅ **Validaciones implementadas**
✅ **Manejo de imágenes integrado**
✅ **Filtros por categoría y subcategoría**

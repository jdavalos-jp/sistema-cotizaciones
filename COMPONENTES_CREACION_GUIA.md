# 📦 Guía: Creación de Componentes en Productos

## Resumen de Cambios

Se ha implementado soporte para **crear, actualizar y eliminar componentes en productos** de forma **completamente opcional**. No todos los productos necesitan componentes.

---

## 🔧 Cambios en Backend

### 1. **Validación Zod** (`backend/src/utils/validationSchemas.js`)

Se agregó un nuevo schema para validar componentes:

```javascript
const ComponenteSchema = z.object({
  idComponente: z.union([z.number(), z.string(), z.bigint()])
    .pipe(z.coerce.bigint().positive()),
  cantidad: z.union([z.number(), z.string()])
    .pipe(z.coerce.number().int().positive())
    .default(1),
  precioReferencial: z.union([z.number(), z.string()])
    .pipe(z.coerce.number().int().positive())
    .optional()
    .nullable(),
  observaciones: z.string().max(500).trim().optional().nullable(),
});
```

Y se integró al `CreateProductoSchema`:

```javascript
const CreateProductoSchema = z.object({
  // ... campos existentes ...
  componentes: z.array(ComponenteSchema)
    .optional()
    .nullable()
    .default([]),  // ← Completamente opcional
});
```

---

### 2. **Servicio: `createProducto()`** (`backend/src/modules/productos/productos.service.js`)

**Características:**
- ✅ Valida que cada componente existe en la BD
- ✅ Crea relaciones `ProductoComponente` automáticamente
- ✅ Si no hay componentes, la operación es idéntica a antes
- ✅ Soporta campos opcionales: `precioReferencial`, `observaciones`

**Flujo:**
```
1. Validar producto (nombre, precio, categoría)
2. Si hay componentes:
   - Validar que cada componente existe
   - Crear ProductoComponente con relaciones
3. Retornar producto con componentes incluidos
```

**Validación de componentes:**
- Verifica que cada `idComponente` existe en la tabla `componentes`
- Si falla, retorna error 400 con mensaje específico

---

### 3. **Servicio: `updateProducto()`** (`backend/src/modules/productos/productos.service.js`)

**Características:**
- ✅ Si `componentes` no se proporciona, NO modifica los existentes
- ✅ Si se proporciona un array (vacío o con elementos), REEMPLAZA todos
- ✅ Elimina componentes antiguos antes de crear nuevos

**Lógica de actualización:**
```javascript
if (componentes !== undefined) {
  // 1. Eliminar TODOS los componentes actuales
  await prisma.productoComponente.deleteMany({ where: { idProducto } });
  
  // 2. Si hay componentes nuevos, crearlos
  if (Array.isArray(componentes) && componentes.length > 0) {
    // ... validar y crear ...
  }
}
```

---

### 4. **Controller: `update()`** (`backend/src/modules/productos/productos.controller.js`)

Se agregó `componentes` al payload que se envía al servicio:

```javascript
const producto = await updateProducto(idProducto, {
  nombre: validated.nombre,
  descripcion: validated.descripcion,
  // ...
  componentes: validated.componentes,  // ← Nuevo
});
```

---

## 📡 API Endpoints

### POST `/productos` - Crear producto con componentes

**Payload:**
```json
{
  "nombre": "Producto X",
  "descripcion": "Descripción...",
  "precioBase": 1000,
  "cantidad": 10,
  "sku": "SKU-001",
  "idCategoria": 1,
  "idSubcategoria": 2,
  "componentes": [
    {
      "idComponente": 5,
      "cantidad": 2,
      "precioReferencial": 200,
      "observaciones": "Componente crítico"
    },
    {
      "idComponente": 8,
      "cantidad": 1
    }
  ]
}
```

**O sin componentes (completamente válido):**
```json
{
  "nombre": "Producto Simple",
  "precioBase": 500,
  "idCategoria": 1,
  "cantidad": 5
}
```

**Response (caso con componentes):**
```json
{
  "ok": true,
  "data": {
    "idProducto": 123,
    "nombre": "Producto X",
    "precio_base": 1000,
    "cantidad": 10,
    "sku": "SKU-001",
    "estado": "activo",
    "imagenes": [],
    "categoria": { "nombre": "Electrónica" },
    "subcategoria": { "nombre": "Cables" },
    "componentes": [
      {
        "idProductoComponente": 1,
        "cantidad": 2,
        "precioReferencial": 200,
        "observaciones": "Componente crítico",
        "componente": {
          "idComponente": 5,
          "nombre": "Cable HDMI",
          "precioBase": 150
        }
      },
      {
        "idProductoComponente": 2,
        "cantidad": 1,
        "precioReferencial": null,
        "observaciones": null,
        "componente": {
          "idComponente": 8,
          "nombre": "Conector USB",
          "precioBase": 80
        }
      }
    ]
  }
}
```

---

### PUT `/productos/:id` - Actualizar producto y componentes

**Casos de uso:**

**Caso 1: Actualizar solo nombre (componentes NO se tocan)**
```json
{
  "nombre": "Nuevo nombre"
}
```
→ Los componentes existentes se mantienen igual

**Caso 2: Reemplazar componentes (eliminar todos y crear nuevos)**
```json
{
  "nombre": "Producto actualizado",
  "componentes": [
    { "idComponente": 10, "cantidad": 3 }
  ]
}
```
→ Se eliminan componentes antiguos, se crean los nuevos

**Caso 3: Eliminar todos los componentes**
```json
{
  "componentes": []
}
```
→ Se eliminan TODOS los componentes del producto

---

## 🎨 Frontend Integration

**Ya está implementado en:**
- `frontend/src/modules/Producto/components/ProductoForm.jsx`
- `frontend/src/modules/Producto/components/ProductoComponentes.jsx`

**Flujo en el formulario:**
```
1. Usuario selecciona componentes en la tabla
2. Se guardan en state `componentesAgregados`
3. Al enviar form, se incluyen en payload
4. API crea/actualiza producto con componentes
```

---

## ⚠️ Validaciones Importantes

### En Backend (Zod):
- **Cantidad**: Positiva (min. 1)
- **Precio Referencial**: Positivo si se proporciona, opcional
- **IDComponente**: Debe ser BigInt positivo
- **Observaciones**: Max 500 caracteres

### En Base de Datos:
- El componente DEBE existir antes de relacionarlo
- Error 400 si `idComponente` no existe: `"Componente con ID X no existe"`
- Relación se elimina automáticamente si el producto se borra (CASCADE)

---

## 📊 Estructura de Datos (Prisma)

**Tabla `producto_componentes`:**
```
id_producto_componente → PK
id_producto            → FK → productos
id_componente          → FK → componentes
cantidad               → Int (default 1)
precio_referencial     → Int (nullable)
observaciones          → String (nullable)
```

---

## 🧪 Ejemplo de Prueba

En Postman o similar:

```bash
POST http://localhost:3000/api/productos
Content-Type: application/json

{
  "nombre": "Monitor LED 24\"",
  "descripcion": "Monitor profesional para diseño",
  "precioBase": 5000,
  "cantidad": 5,
  "sku": "MON-LED-24",
  "idCategoria": 3,
  "idSubcategoria": 12,
  "componentes": [
    {
      "idComponente": 1,
      "cantidad": 1,
      "precioReferencial": 4500
    },
    {
      "idComponente": 2,
      "cantidad": 2,
      "precioReferencial": 200,
      "observaciones": "Cables de conexión"
    }
  ]
}
```

**Respuesta esperada:**
```json
{
  "ok": true,
  "data": {
    "idProducto": 999,
    "nombre": "Monitor LED 24\"",
    // ... otros campos y componentes ...
  }
}
```

---

## 🔄 Diferencias Importantes

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| Componentes en crear | ❌ No se procesaban | ✅ Se crean si se proporcionan |
| Componentes en actualizar | ❌ Se ignoraban | ✅ Se pueden reemplazar |
| Validación de componentes | ❌ No existía | ✅ Verifica que existan en BD |
| Campos opcionales | - | ✅ `précioReferencial`, `observaciones` |
| Compatibilidad atrás | - | ✅ 100% compatible (todo es opcional) |

---

## ✅ Checklist de Prueba

- [ ] Crear producto SIN componentes → Debe funcionar
- [ ] Crear producto CON componentes → Debe crear relaciones
- [ ] Actualizar solo nombre → Componentes no se afectan
- [ ] Actualizar componentes → Se reemplazan correctamente
- [ ] ID de componente inválido → Error 400 con mensaje claro
- [ ] GET producto → Incluye componentes en respuesta
- [ ] Eliminar producto → No hay errores de FK

---

## 📝 Notas Técnicas

1. **Transacciones**: Cada operación es una transacción Prisma única
2. **Cascada**: Si se elimina un producto, sus componentes se eliminan automáticamente
3. **Conversión de tipos**: Los IDs se convierten a BigInt automáticamente
4. **Decimales**: `precioReferencial` se trata como `Prisma.Decimal` para precisión monetaria

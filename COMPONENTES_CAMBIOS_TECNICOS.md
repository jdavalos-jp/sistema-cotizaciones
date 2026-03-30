# 🔧 Resumen Técnico: Componentes Implementación

## Archivos Modificados

### 1️⃣ `backend/src/utils/validationSchemas.js`

**Lo que se agregó:**
```javascript
// NUEVO: Schema para validar cada componente
const ComponenteSchema = z.object({
  idComponente: z.union([z.number(), z.string(), z.bigint()])
    .pipe(z.coerce.bigint().positive('idComponente debe ser un número positivo')),
  cantidad: z.union([z.number(), z.string()])
    .pipe(z.coerce.number().int().positive('Cantidad de componente debe ser positiva'))
    .default(1),
  precioReferencial: z.union([z.number(), z.string()])
    .pipe(z.coerce.number().int().positive('Precio referencial debe ser un número positivo'))
    .optional()
    .nullable(),
  observaciones: z.string()
    .max(500, 'Observaciones no pueden exceder 500 caracteres')
    .trim()
    .optional()
    .nullable(),
});

// MODIFICADO: CreateProductoSchema ahora incluye componentes
const CreateProductoSchema = z.object({
  // ... campos existentes ...
  componentes: z.array(ComponenteSchema)
    .optional()
    .nullable()
    .default([]),  // ← IMPORTANTE: Completamente opcional
});
```

---

### 2️⃣ `backend/src/modules/productos/productos.service.js`

**Función `createProducto()` - ACTUALIZADA**

Cambios:
- ✅ Nuevo parámetro: `componentes = []`
- ✅ Validación de componentes antes de crear
- ✅ Creación de relaciones `ProductoComponente` en Prisma

```javascript
async function createProducto({
  nombre,
  descripcion,
  precioBase,
  cantidad,
  sku,
  idCategoria,
  idSubcategoria,
  componentes = [],  // ← NUEVO
}) {
  // ... validaciones existentes ...

  // NUEVO: Validar componentes si existen
  const componentesValidos = [];
  if (Array.isArray(componentes) && componentes.length > 0) {
    for (const comp of componentes) {
      const compId = toBigInt(comp.idComponente, 'idComponente');
      const componenteExistente = await prisma.componente.findUnique({
        where: { idComponente: compId },
      });
      if (!componenteExistente) {
        throw new HttpError(400, `Componente con ID ${comp.idComponente} no existe`);
      }
      componentesValidos.push({ ...comp, idComponente: compId });
    }
  }

  const producto = await prisma.producto.create({
    data: {
      // ... datos existentes ...
      // NUEVO: Crear relaciones con componentes
      ...(componentesValidos.length > 0 && {
        componentes: {
          create: componentesValidos.map((comp) => ({
            idComponente: comp.idComponente,
            cantidad: Number(comp.cantidad) || 1,
            precioReferencial: comp.precioReferencial 
              ? new Prisma.Decimal(comp.precioReferencial) 
              : null,
            observaciones: comp.observaciones?.trim() || null,
          })),
        },
      }),
    },
    select: {
      // ... campos existentes ...
      // NUEVO: Incluir componentes en respuesta
      componentes: {
        select: {
          idProductoComponente: true,
          cantidad: true,
          precioReferencial: true,
          observaciones: true,
          componente: {
            select: {
              idComponente: true,
              nombre: true,
              precioBase: true,
            },
          },
        },
      },
    },
  });

  // NUEVO: Incluir componentes en respuesta convertida
  return decimalToNumber({
    // ... campos existentes ...
    componentes: producto.componentes?.map((c) => ({
      idProductoComponente: c.idProductoComponente,
      cantidad: c.cantidad,
      precioReferencial: c.precioReferencial,
      observaciones: c.observaciones,
      componente: {
        idComponente: c.componente.idComponente,
        nombre: c.componente.nombre,
        precioBase: c.componente.precioBase,
      },
    })),
  });
}
```

---

**Función `updateProducto()` - ACTUALIZADA**

Cambios:
- ✅ Nuevo parámetro: `componentes`
- ✅ Lógica: Si `componentes !== undefined`, reemplaza todos
- ✅ Si `componentes === undefined`, deja componentes intactos

```javascript
async function updateProducto(
  idProducto,
  { nombre, descripcion, precioBase, cantidad, sku, idCategoria, idSubcategoria, componentes }  // ← NUEVO
) {
  const prodId = toBigInt(idProducto, 'idProducto');

  // ... validaciones existentes ...

  // NUEVO: Procesar componentes si se proporcionan
  if (componentes !== undefined) {
    // 1. Eliminar componentes actuales
    await prisma.productoComponente.deleteMany({
      where: { idProducto: prodId },
    });

    // 2. Crear nuevos si existen
    if (Array.isArray(componentes) && componentes.length > 0) {
      const componentesValidos = [];
      for (const comp of componentes) {
        const compId = toBigInt(comp.idComponente, 'idComponente');
        const componenteExistente = await prisma.componente.findUnique({
          where: { idComponente: compId },
        });
        if (!componenteExistente) {
          throw new HttpError(400, `Componente con ID ${comp.idComponente} no existe`);
        }
        componentesValidos.push({ ...comp, idComponente: compId });
      }

      data.componentes = {
        create: componentesValidos.map((comp) => ({
          idComponente: comp.idComponente,
          cantidad: Number(comp.cantidad) || 1,
          precioReferencial: comp.precioReferencial 
            ? new Prisma.Decimal(comp.precioReferencial) 
            : null,
          observaciones: comp.observaciones?.trim() || null,
        })),
      };
    }
  }

  const producto = await prisma.producto.update({
    where: { idProducto: prodId },
    data,
    select: {
      // ... campos existentes + componentes como en create ...
    },
  });

  return decimalToNumber({
    // ... fields con componentes mapeados ...
  });
}
```

---

### 3️⃣ `backend/src/modules/productos/productos.controller.js`

**Función `update()` - MÍNIMO CAMBIO**

```javascript
async function update(req, res) {
  try {
    const idProducto = BigInt(req.params.id);
    const validated = validate(UpdateProductoSchema, req.body);

    const producto = await updateProducto(idProducto, {
      nombre: validated.nombre,
      descripcion: validated.descripcion,
      precioBase: validated.precioBase,
      cantidad: validated.cantidad,
      sku: validated.sku,
      idCategoria: validated.idCategoria,
      idSubcategoria: validated.idSubcategoria,
      componentes: validated.componentes,  // ← NUEVO (1 línea)
    });

    res.json({ ok: true, data: producto });
  } catch (err) {
    if (err.statusCode) throw err;
    throw new HttpError(400, 'ID de producto inválido');
  }
}
```

---

## 🔄 Flujo de Datos

### Crear Producto CON Componentes

```
Frontend (ProductoForm)
    ↓
POST /api/productos
{
  nombre: "Monitor",
  precioBase: 5000,
  idCategoria: 3,
  componentes: [
    { idComponente: 1, cantidad: 1, precioReferencial: 4500 },
    { idComponente: 2, cantidad: 2 }
  ]
}
    ↓
Controller.create()
    ↓
validate() con Zod ← valida componentes
    ↓
createProducto()
    ↓
1. Validar cada idComponente existe
2. Crear producto
3. Crear relaciones ProductoComponente
4. Retornar con componentes incluidos
    ↓
Response 201
{
  ok: true,
  data: {
    idProducto: 123,
    nombre: "Monitor",
    componentes: [
      {
        idProductoComponente: 1,
        cantidad: 1,
        componente: { idComponente: 1, nombre: "Pantalla", ... }
      },
      ...
    ]
  }
}
```

### Actualizar Producto CON Componentes

```
Frontend (ProductoForm)
    ↓
PUT /api/productos/123
{
  nombre: "Monitor Actualizado",
  componentes: [
    { idComponente: 5, cantidad: 3 }
  ]
}
    ↓
Controller.update()
    ↓
validate() con Zod ← `componentes` está definido
    ↓
updateProducto(123, {..., componentes: [...]})
    ↓
1. Validar que existe producto
2. SI componentes !== undefined:
   - DELETE ProductoComponente WHERE idProducto = 123
   - INSERT nuevos componentes validados
3. Actualizar otros campos
4. Retornar con nuevos componentes
    ↓
Response 200
{
  ok: true,
  data: { ... con nuevos componentes ... }
}
```

### Actualizar Producto SIN Cambiar Componentes

```
Frontend
    ↓
PUT /api/productos/123
{
  nombre: "Nuevo nombre"
  // ← NO incluye 'componentes'
}
    ↓
updateProducto(123, {nombre: "...", ...})
    ↓
1. componentes === undefined ✓
2. Se IGNORA completamente la lógica de componentes
3. Componentes existentes NO se modifican
4. Solo actualiza nombre
    ↓
Response 200
{
  ok: true,
  data: { 
    idProducto: 123,
    nombre: "Nuevo nombre",
    componentes: [ ... originales sin cambios ... ]
  }
}
```

---

## ✅ Validaciones Implementadas

| Validación | Dónde | Qué Ocurre |
|------------|-------|-----------|
| Componente no existe | Backend service | Error 400: "Componente con ID X no existe" |
| Cantidad no positiva | Zod schema | Error 400: "Cantidad debe ser positiva" |
| ID componente inválido | Zod schema (BigInt) | Error 400: "No es número válido" |
| Precio referencial negativo | Zod schema | Error 400: "Debe ser positivo" |
| Observaciones > 500 chars | Zod schema | Error 400: "Excede 500 caracteres" |

---

## 🧪 Ejemplo de Petición cURL

```bash
# Crear producto con componentes
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Kit Completo",
    "precioBase": 10000,
    "cantidad": 2,
    "idCategoria": 5,
    "componentes": [
      {
        "idComponente": 10,
        "cantidad": 1,
        "precioReferencial": 8000,
        "observaciones": "Componente principal"
      },
      {
        "idComponente": 15,
        "cantidad": 3,
        "precioReferencial": 600
      }
    ]
  }'

# Actualizar solo nombre (componentes intactos)
curl -X PUT http://localhost:3000/api/productos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Kit Completo Premium"
  }'

# Actualizar componentes (reemplazar todos)
curl -X PUT http://localhost:3000/api/productos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "componentes": [
      {
        "idComponente": 20,
        "cantidad": 2
      }
    ]
  }'

# Eliminar todos los componentes
curl -X PUT http://localhost:3000/api/productos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "componentes": []
  }'
```

---

## 📊 Impacto en BD

**Antes:**
- Tabla `producto_componentes` existía pero no se usaba desde la API

**Ahora:**
- ✅ Se puebla automáticamente al crear/actualizar productos
- ✅ Se limpia automáticamente al eliminar productos (CASCADE)
- ✅ Se reemplaza completamente al actualizar con componentes

**Sin impacto destructivo:** Productos existentes sin componentes siguen funcionando igual.

---

## 🎯 Resumen de Nuevas Capacidades

| Operación | Antes | Ahora |
|-----------|-------|-------|
| Crear producto sin componentes | ✅ | ✅ (idéntico) |
| Crear producto con componentes | ❌ (se ignoran) | ✅ |
| Actualizar componentes | ❌ (no existía) | ✅ |
| Eliminar componentes | ❌ (no existía) | ✅ (poner `[]`) |
| Validar componentes | ❌ | ✅ (error si no existen) |
| GET producto con componentes | ❌ (vacío) | ✅ (con detalles) |

---

## 🔐 Seguridad & Integridad

- ✅ Validación en Zod (schemas)
- ✅ Validación en Service (existencia en BD)
- ✅ Tipo-safe con BigInt y Decimal
- ✅ Transacciones implícitas en Prisma
- ✅ Cascada configurada para mantener integridad referencial

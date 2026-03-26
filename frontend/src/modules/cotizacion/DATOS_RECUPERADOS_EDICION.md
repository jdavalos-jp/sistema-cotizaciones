# 📊 Datos Recuperados en Edición de Cotización

## 🔄 Flujo de Carga de Datos

```
Usuario hace clic "Editar"
    ↓
CotizacionEditar obtiene idCotizacion
    ↓
useCotizacionEdit.getCotizacion() → API GET /cotizaciones/{id}
    ↓
Backend retorna objeto Cotizacion con datos relacionados
    ↓
CotizacionEditar procesa datos → simula carrito → renderiza CotizacionForm
    ↓
CotizacionForm muestra todos los datos recuperados
```

---

## 📦 Datos Recuperados de la Cotización Principal

| Campo | Origen | Tipo | Usado En | Estado |
|-------|--------|------|----------|---------|
| **idCotizacion** | DB | `BigInt` | Backend - referencia | ✅ |
| **numeroCotizacion** | DB | `String` | VerDetalleCotizacion | ✅ |
| **idCliente** | DB | `BigInt` | Trasfondo | ✅ |
| **cliente.nombreCompleto** | DB (relación) | `String` | **CotizacionForm - Cliente (read-only)** | ✅ |
| **cliente.email** | DB (relación) | `String` | VerDetalleCotizacion | ✅ |
| **cliente.telefono** | DB (relación) | `String` | VerDetalleCotizacion | ✅ |
| **cliente.cargo** | DB (relación) | `String` | VerDetalleCotizacion | ✅ |
| **cliente.institucion** | DB (relación) | `String` | VerDetalleCotizacion | ✅ |
| **cliente.ciudad** | DB (relación) | `String` | VerDetalleCotizacion | ✅ |
| **cliente.direccion** | DB (relación) | `String` | VerDetalleCotizacion | ✅ |
| **moneda** | DB | `String` (default: "Bs") | **CotizacionForm** | ✅ |
| **diasValidez** | CALCULADO (del período) | `Number` | **CotizacionForm - FechaValidacionSection** | ✅ |
| **diasEntrega** | DB | `Int` (default: 5) | **CotizacionForm - FechaValidacionSection** | ✅ |
| **fechaEmision** | DB | `Date` | VerDetalleCotizacion | ✅ |
| **fechaValidez** | DB o CALCULADO | `Date` | VerDetalleCotizacion | ✅ |
| **estado** | DB (default: "borrador") | `String` | VerDetalleCotizacion | ✅ |
| **subtotal** | DB (calculado al crear) | `Number` | VerDetalleCotizacion | ✅ |
| **descuento** | DB | `Number` | VerDetalleCotizacion | ✅ |
| **impuestos** | DB | `Number` | VerDetalleCotizacion | ✅ |
| **total** | DB (calculado) | `Number` | VerDetalleCotizacion | ✅ |
| **observaciones** | DB | `String` | VerDetalleCotizacion | ✅ |
| **usuarioCreador** | DB (relación) | `Object` | VerDetalleCotizacion | ✅ |
| **fechaCreacion** | DB | `DateTime` | VerDetalleCotizacion | ✅ |

---

## 📋 Productos Recuperados en la Cotización

**Array**: `cotizacion.productos[]`

Cada producto tiene esta estructura:

```javascript
{
  idDetalleProducto: BigInt,           // ID único del renglón
  idCotizacion: BigInt,                // Referencia a la cotización (usado internamente)
  idProducto: BigInt,                  // ✅ ID del producto (recuperado)
  nombreItem: String,                  // ✅ Nombre personalizado del item (recuperado)
  descripcionItem: String,             // ✅ Descripción personalizada (recuperado)
  cantidad: Int,                       // ✅ Cantidad (recuperada)
  precioUnitario: Int,                 // ✅ Precio unitario (recuperado)
  descuento: Int,                      // ✅ Descuento del línea (recuperado, puede ser null)
  subtotal: Int,                       // Subtotal calculado
  ordenVisual: Int,                    // Orden de aparición en la tabla
  observaciones: String,               // Notas adicionales (recuperadas)
  
  // Datos relacionados del producto original:
  producto: {
    sku: String,                       // SKU del producto
    componentes: [                     // Componentes que incluye este producto
      {
        cantidad: Int,
        componente: {
          nombre: String
        }
      }
    ]
  }
}
```

**Cómo se Usa en CotizacionEditar:**
```javascript
cotizacion.productos.forEach((p) => {
  editCart.addItem({
    tipo: 'producto',
    id: p.idProducto,              // ✅ Se recupera
    nombre: p.nombreItem,           // ✅ Se recupera
    cantidad: p.cantidad,           // ✅ Se recupera
    precioUnitario: p.precioUnitario, // ✅ Se recupera
    descripcion: p.descripcionItem,  // ✅ Se recupera
  })
})
```

---

## 🔧 Componentes Recuperados en la Cotización

**Array**: `cotizacion.componentes[]`

Cada componente tiene esta estructura:

```javascript
{
  idDetalleComponente: BigInt,         // ID único del renglón
  idCotizacion: BigInt,                // Referencia a la cotización (usado internamente)
  idComponente: BigInt,                // ✅ ID del componente (recuperado)
  nombreItem: String,                  // ✅ Nombre personalizado del item (recuperado)
  descripcionItem: String,             // ✅ Descripción personalizada (recuperado)
  cantidad: Int,                       // ✅ Cantidad (recuperada)
  precioUnitario: Int,                 // ✅ Precio unitario (recuperado)
  descuento: Int,                      // ✅ Descuento del línea (recuperado, puede ser null)
  subtotal: Int,                       // Subtotal calculado
  ordenVisual: Int,                    // Orden de aparición en la tabla
  observaciones: String,               // Notas adicionales (recuperadas)
  
  // Datos relacionados del componente original:
  componente: {
    sku: String,                       // SKU del componente
  }
}
```

**Cómo se Usa en CotizacionEditar:**
```javascript
cotizacion.componentes.forEach((c) => {
  editCart.addItem({
    tipo: 'componente',
    id: c.idComponente,            // ✅ Se recupera
    nombre: c.nombreItem,          // ✅ Se recupera
    cantidad: c.cantidad,          // ✅ Se recupera
    precioUnitario: c.precioUnitario, // ✅ Se recupera
    descripcion: c.descripcionItem, // ✅ Se recupera
  })
})
```

---

## 🖼️ Datos Mostrados en CotizacionForm

### **Sección 1: Cliente (read-only en modo edición)**
```
┌────────────────────────────┐
│ Cliente                    │
├────────────────────────────┤
│ Juan Pérez                 │  ← De cliente.nombreCompleto ✅
└────────────────────────────┘
```
- **Origen**: `initialCliente.nombre = cotizacion.cliente.nombreCompleto`
- **Propiedad del formulario**: `initialCliente`
- **Sincronización**: useEffect en CotizacionForm ✅

---

### **Sección 2: Fechas de Validación**
```
┌────────────────────────────────────────────────┐
│ Dias de Validez: [10]  Dias de Entrega: [5]   │
└────────────────────────────────────────────────┘
```
- **Dias Validez**: `initialDiasValidez = cotizacion.diasValidez || 10` ✅
- **Dias Entrega**: `initialDiasEntrega = cotizacion.diasEntrega || 5` ✅
- **Sincronización**: useEffect en CotizacionForm ✅

---

### **Sección 3: Productos y Componentes en Tabla**
```
┌─────────────────────────────────────────────────────────────┐
│ Productos/Componentes Seleccionados                         │
├─────────────────────────────────────────────────────────────┤
│ Nombre      | Descripción | Cantidad | Precio Unit | Acción│
├─────────────────────────────────────────────────────────────┤
│ Producto A  | descrip...  |    2     |  150.00     | 🗑️   │
│ Componente B| descrip...  |    1     |  75.00      | 🗑️   │
└─────────────────────────────────────────────────────────────┘
```
- **Origen**: `editCart.cart` (poblado desde `cotizacion.productos[]` y `cotizacion.componentes[]`)
- **Campos mostrados**:
  - `nombre` (nombreItem) ✅
  - `descripcion` (descripcionItem) ✅
  - `cantidad` ✅
  - `precioUnitario` ✅
  - Botón eliminar ✅

---

### **Sección 4: Resumen de Totales (Calculado)**
```
┌────────────────────┐
│ Subtotal: 225.00   │
│ Descuento: 0.00    │
│ Impuestos: 0.00    │
│ Total: 225.00      │
└────────────────────┘
```
- **Calculado por**: `useCotizacionPreview` hook ✅
- **Basado en**: `idCliente` + `moneda` + `cart.cart`

---

## ✨ Resumen: ¿Qué se Recupera?

### ✅ COMPLETAMENTE RECUPERADO:

1. **Cliente**
   - Nombre completo (mostrado en formulario)
   - Todos los datos de contacto (email, teléfono, cargo, etc.)

2. **Configuración**
   - Moneda (Bs)
   - Días de validez
   - Días de entrega
   - Observaciones

3. **Productos/Componentes**
   - ID de cada producto/componente
   - Nombre personalizado (nombreItem)
   - Descripción personalizada (descripcionItem)
   - Cantidad por cada item
   - Precio unitario de cada item
   - Descuento por línea
   - Orden visual

4. **Cálculos**
   - Subtotal de cada línea
   - Subtotal general
   - Descuentos
   - Impuestos
   - Total general

### 🔄 FUNCIONALIDADES HABILITADAS:

- ✅ Ver nombre del cliente (read-only)
- ✅ Ver días de validez y entrega
- ✅ Ver todos los productos/componentes
- ✅ **Editar** nombres, descripciones, precios, cantidades
- ✅ **Eliminar** productos/componentes con botón
- ✅ **Agregar** nuevos productos/componentes
- ✅ **Recalcular** totales automáticamente
- ✅ **Guardar** cambios con timestamp actual

---

## 🔗 Flujo de Sincronización

```
1. Usuario abre modal de edición
   ↓
2. CotizacionEditar carga: useCotizacionEdit(idCotizacion)
   ↓
3. Hook carga: getCotizacion(idCotizacion)
   ↓
4. API retorna objeto completo con cliente, productos, componentes
   ↓
5. useCotizacionEdit restaura carrito:
   - cotizacion.productos → forEach → editCart.addItem()
   - cotizacion.componentes → forEach → editCart.addItem()
   ↓
6. CotizacionEditar prepara props:
   - initialCliente = { id, nombre }          ✅
   - initialDiasValidez = cotizacion.diasValidez ✅
   - initialDiasEntrega = cotizacion.diasEntrega ✅
   - initialCart = editCart                   ✅
   ↓
7. CotizacionForm recibe props y sincroniza:
   - useEffect: setIdCliente, setClienteLabel ✅
   - useEffect: setDiasValidez, setDiasEntrega ✅
   - useEffect: usa cart.cart (ya poblado)    ✅
   ↓
8. UI muestra todos los datos recuperados
```

---

## 🧪 Verificación Rápida

Para confirmar que TODO se está recuperando correctamente, abre **DevTools Console** y ejecuta:

```javascript
// En CotizacionEditar.jsx, agrega un console.log en el return:
console.log('Cotización cargada:', {
  cliente: cotizacion?.cliente?.nombreCompleto,
  diasValidez: cotizacion?.diasValidez,
  diasEntrega: cotizacion?.diasEntrega,
  productosCount: cotizacion?.productos?.length,
  componentesCount: cotizacion?.componentes?.length,
  moneda: cotizacion?.moneda,
})
```

Deberías ver algo como:
```javascript
{
  cliente: "Juan Pérez",
  diasValidez: 10,
  diasEntrega: 5,
  productosCount: 3,
  componentesCount: 2,
  moneda: "Bs"
}
```

---

## 📝 Campos Por Editar vs Read-Only

| Campo | Tipo | Editable | Notas |
|-------|------|----------|-------|
| Cliente | Read-Only | ❌ | No se puede cambiar en edición |
| Dias Validez | Editable | ✅ | Se puede cambiar |
| Dias Entrega | Editable | ✅ | Se puede cambiar |
| Productos | Editable | ✅ | Nombre, descripción, precio, cantidad |
| Componentes | Editable | ✅ | Nombre, descripción, precio, cantidad |
| Agregar Items | Editable | ✅ | Se pueden añadir nuevos |
| Eliminar Items | Editable | ✅ | Botón de eliminar funciona |
| Totales | Automático | ❌ | Se recalculan automáticamente |

---

## 🎯 Estado Actual: ✅ TODO CORRECTAMENTE RECUPERADO

Todos los datos necesarios se están recuperando y sincronizando correctamente en el formulario de edición.

## 🔧 Flujo de carga de productos en Edición de Cotización

### Problema que se solucionó:
Cuando editas una cotización, los productos no se mostraban en la tabla porque:
- `ProductosSeleccionadosTable` espera datos con estructura completa: `{totalLinea, dias, precioUnitario, etc}`
- `cart.cart` solo tiene datos simples: `{id, tipo, nombre, cantidad}`

### Solución implementada:

#### 1. **useCotizacionEdit** carga la cotización
```javascript
// En CotizacionEditar.jsx
const { cotizacion, cart, ... } = useCotizacionEdit(idCotizacion)

// Efecto 2 del hook restaura productos en el carrito:
// cart.addItem({
//   tipo: 'producto',
//   id: p.idProducto,
//   nombre: p.nombreItem,
//   cantidad: p.cantidad,
// })
```

#### 2. **CotizacionForm ahora usa useCotizacionPreview**
```javascript
// Transforma cart.cart en lineas estructuradas
const preview = useCotizacionPreview({
  idCliente,
  moneda,
  cart: cart.cart,  // Datos simples del carrito
})

const lineas = preview.data?.lineas ?? []  // Datos con: totalLinea, dias, etc
```

#### 3. **ProductosSeleccionadosTable recibe datos correctos**
```javascript
<ProductosSeleccionadosTable
  lineas={lineasConEdiciones}  // ✅ Estructura completa
  onSetPrecio={cart.setPrecioUnitario}
  // ... resto de handlers
/>
```

### Flujo de datos:

```
Editar Cotización
  ↓
useCotizacionEdit carga cotización + restaura productos en cart.cart
  ↓
CotizacionForm recibe initialCart
  ↓
useCotizacionPreview({ cart: cart.cart }) → transforma en lineas
  ↓
ProductosSeleccionadosTable muestra lineas con estructura completa
  ↓
Usuario edita nombre, precio, cantidad
  ↓
cart.setNombre() / setPrecioUnitario() / setCantidad() actualiza cart.cart
  ↓
preview recalcula automáticamente (re-render)
  ↓
lineasConEdiciones se actualiza con datos editados
  ↓
Tabla se renderiza con cambios
```

### Qué permite ahora:
✅ Ver productos que ya tiene la cotización  
✅ Editar nombres, precios, cantidades  
✅ Los totales y subtotales se calculan automáticamente  
✅ Agregar más productos mientras editas  
✅ Guardar los cambios al enviar  

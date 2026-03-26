# 🔍 Debugging: Edición de Cotización - Datos No Se Muestran

## 📋 Pasos para Diagnosticar

### 1️⃣ Abre la Consola del Navegador
- Presiona **F12** o **Ctrl+Shift+I**
- Selecciona la pestaña **Console**
- Limpia cualquier log anterior

### 2️⃣ Navega a Editar una Cotización Existente
- Abre el historial de cotizaciones
- Haz clic en **"Editar"** en una cotización existente
- Se abrirá el modal

### 3️⃣ Observa los Logs en el Console

Deberías ver una secuencia de logs como esta:

```
📡 useCotizacionEdit: cargando cotización { idCotizacion: "1" }
✅ useCotizacionEdit: cotización cargada {
  cliente: "Juan Pérez",
  productosCount: 3,
  componentesCount: 2
}
📦 CotizacionEditar: cargando carrito { 
  productosCount: 3, 
  componentesCount: 2 
}
✅ CotizacionEditar: items a agregar al carrito [
  { tipo: 'producto', id: '1', nombre: 'Producto A', ... },
  { tipo: 'producto', id: '2', nombre: 'Producto B', ... },
  ...
]
✅ CotizacionEditar: carrito poblado { cartLength: 5 }
✅ CotizacionEditar: carrito listo
✅ CotizacionEditar: cliente preparado { 
  id: '123', 
  nombre: 'Juan Pérez' 
}
✨ CotizacionEditar: renderizando CotizacionForm con: {
  initialClienteId: '123',
  initialClienteNombre: 'Juan Pérez',
  editCartLength: 5,
  cotizacionProductosLength: 3,
  cotizacionComponentesLength: 2
}
🎯 CotizacionForm: props recibidos {
  initialCliente: { id: '123', nombre: 'Juan Pérez' },
  initialCart: 5,
  clienteLabel: '',
  diasValidez: 10,
  diasEntrega: 5
}
📝 CotizacionForm: useEffect cliente { 
  initialCliente: { id: '123', nombre: 'Juan Pérez' } 
}
✅ CotizacionForm: cliente sincronizado { 
  id: '123', 
  nombre: 'Juan Pérez' 
}
```

---

## 🔴 Posibles Problemas y Sus Síntomas

### **Problema 1: API no retorna datos del cliente**
**Síntoma:**
```
✅ useCotizacionEdit: cotización cargada {
  cliente: undefined,  ← ❌ VACÍO
  productosCount: 0,
  componentesCount: 0
}
```

**Solución:**
- Revisar que la API GET `/cotizaciones/{id}` está retornando el cliente
- Verificar en el backend que `getCotizacionById` incluye `cliente: true`

---

### **Problema 2: API retorna datos pero sin productos**
**Síntoma:**
```
✅ useCotizacionEdit: cotización cargada {
  cliente: "Juan Pérez",
  productosCount: 0,  ← ❌ DEBERÍA SER > 0
  componentesCount: 0
}
```

**Solución:**
- Verificar que la cotización tiene productos guardados en BD
- Revisar que `getCotizacionById` incluye `productos: { include: { ... } }`

---

### **Problema 3: Datos cargados pero no sincronizados en formulario**
**Síntoma:**
```
✨ CotizacionEditar: renderizando CotizacionForm con: {
  editCartLength: 5,  ← ✅ Datos en carrito
  initialClienteNombre: 'Juan Pérez'  ← ✅ Cliente disponible
}
BUT en UI no se muestra nada
```

**Causa probable:**
- El `initialCart` no está siendo sincronizado en CotizacionForm
- Los props no están siendo pasados correctamente

**Solución:**
- Verificar que `cart` en CotizacionForm es la misma instancia
- Asegurarse de que `cart.cart` está siendo usado en el render

---

### **Problema 4: Cliente muestrado pero no productos**
**Síntoma:**
- El nombre del cliente aparece ✅
- Pero productos muestra "0 items" ❌

**Causa probable:**
- El carrito se está limpiando después de agregarlo
- Hay un problema de timing en los useEffect

**Solución:**
- Verificar que no hay un `editCart.clear()` siendo llamado después de agregar items
- Revisarla orden de los useEffect

---

## 🎯 Checklist de Debugging

### Paso 1: Verificar Datos en API
```bash
# En terminal, haz GET a:
curl http://localhost:3001/api/cotizaciones/1

# Debería retornar:
{
  "ok": true,
  "data": {
    "idCotizacion": 1,
    "cliente": {
      "idCliente": 123,
      "nombreCompleto": "Juan Pérez",
      ...
    },
    "productos": [
      {
        "idProducto": 5,
        "nombreItem": "Producto A",
        "cantidad": 2,
        "precioUnitario": 150,
        ...
      },
      ...
    ],
    "componentes": [...]
  }
}
```

### Paso 2: Logs en Console
Copia y pega cada sección desde los logs anteriores:
- [ ] ¿Se ve "📡 useCotizacionEdit: cargando"?
- [ ] ¿Se ve "✅ useCotizacionEdit: cotización cargada" con datos?
- [ ] ¿Se ve "📦 CotizacionEditar: cargando carrito" con count > 0?
- [ ] ¿Se ve "✨ CotizacionEditar: renderizando" con editCartLength > 0?
- [ ] ¿Se ve "🎯 CotizacionForm: props recibidos" con initialCart > 0?

### Paso 3: Elementos en DOM
Abre Inspector (F12 → Elements) y busca:
- [ ] ¿Existe la tarjeta de "Cliente"?
- [ ] ¿Existe la tabla "Productos Seleccionados"?
- [ ] ¿Están vacíos o tienen contenido?

---

## 📝 Logs Adicionales para Agregar

Si aún no ves dónde está el problema, puedo agregar logs en:

1. **En `ProductosSeleccionadosTable`** - para ver si los items llegan a la tabla
2. **En `ClienteDatosSection`** - para ver si el cliente se está mostrando
3. **En los useEffect de sincronización** - para ver si se están ejecutando

---

## 🚀 Próximos Pasos

1. **Abre la consola**
2. **Haz clic en Editar**
3. **Captura/copia los logs completos**
4. **Comparte conmigo qué logs ves**

Con los logs sabré exactamente dónde está el problema.

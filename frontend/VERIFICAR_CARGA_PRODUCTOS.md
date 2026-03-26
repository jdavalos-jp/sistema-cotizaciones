## ✅ Checklist - Verificar que los productos se cargan en Edición

### 1. Inicia la aplicación
```bash
cd frontend
npm run dev
```

### 2. Abre la consola del navegador (F12)
- Tab: **Console**
- Busca errores de tipo `ERR_INSUFFICIENT_RESOURCES` (ya no debería haber)

### 3. Edita una cotización existente
- Navega a **Historial de Cotizaciones**
- Haz clic en una cotización para editar
- Presiona **Editar**

### 4. Verifica se cargan los productos
Deberías ver en la tabla "Productos Seleccionados":
- ✅ Nombre del producto
- ✅ Descripción
- ✅ Precio unitario
- ✅ Cantidad
- ✅ TOTAL por línea

### 5. Testa editar un producto
- Cambia el **nombre** de un producto
- Cambia el **precio** unitario
- Cambia la **cantidad**
- Verifica que el TOTAL se recalcula automáticamente

### 6. Testa agregar producto
- En la sección "Agregar Productos" arriba
- Selecciona un producto/componente
- Presiona **+** para agregarlo
- Verifica que aparezca en la tabla

### 7. Guarda los cambios
- Presiona **Guardar Cambios**
- Deberías ver el mensaje: "Cotización actualizada exitosamente"

### 8. Verifica en la Network tab
- Abre **DevTools → Network**
- Edita una cotización
- Deberías ver:
  - ✅ 1x GET `/api/cotizaciones/[id]` (cargar cotización)
  - ✅ 1x POST `/api/cotizacionesPreview` (para calcular totales)
  - ✅ NO múltiples peticiones repetidas

---

## 🐛 Si no funciona

**Si no ves productos en la tabla:**
1. Abre DevTools → Network
2. Ve a la cotización para editar
3. Busca la petición `GET /api/cotizaciones/[id]`
4. Haz clic en ella → Tab "Response"
5. Verifica que incluye `"productos": [...]` en los datos

**Si ves un error:**
- Console tab
- Busca mensajes de error rojo
- Copia el error completo y revísalo

**Si ves infinite requests:**
- Network tab → Filter por "cotizaciones"
- Si ves 20+ peticiones en poco tiempo, hay un loop
- Abre el archivo `useCotizacionEdit.js` y verifica dependencias de useEffect

---

## 📊 Estructura de datos esperada

Cuando cargas una cotización para editar, la API devuelve:

```json
{
  "idCotizacion": 52,
  "numeroCotizacion": "COT-001",
  "cliente": { 
    "nombreCompleto": "Juan Pérez",
    ...
  },
  "productos": [
    {
      "idProducto": 1,
      "nombreItem": "Widget Pro",
      "cantidad": 5,
      "precioUnitario": 100.00
    }
  ],
  "componentes": [
    {
      "idComponente": 3,
      "nombreItem": "Componente X",
      "cantidad": 2,
      "precioUnitario": 50.00
    }
  ]
}
```

Este JSON se procesa así:
1. `useCotizacionEdit` restaura en `cart.cart`
2. `useCotizacionPreview` transforma en lineas con totales
3. `ProductosSeleccionadosTable` renderiza la tabla

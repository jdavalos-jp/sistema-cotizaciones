# API de Cotizaciones - Documentación

## Endpoints Disponibles

### 1. **Listar todas las cotizaciones**
```
GET /api/cotizaciones
```

**Parámetros Query:**
- `skip` (opcional): Número de registros a saltar (default: 0)
- `take` (opcional): Número de registros a traer máximo 100 (default: 50)
- `estado` (opcional): Filtrar por estado (borrador, enviada, aceptada, rechazada, cancelada)

**Ejemplo:**
```bash
curl -X GET "http://localhost:3000/api/cotizaciones?skip=0&take=20&estado=borrador"
```

**Respuesta:**
```json
{
  "ok": true,
  "data": [
    {
      "idCotizacion": "1",
      "numeroCotizacion": "COT-20260317-123456",
      "idCliente": "5",
      "estado": "borrador",
      "subtotal": "1000.00",
      "descuento": "0.00",
      "impuestos": "0.00",
      "total": "1000.00",
      "moneda": "Bs",
      "fechaCreacion": "2026-03-17T10:30:00Z",
      "cliente": {
        "nombreCompleto": "Juan García",
        "email": "juan@example.com"
      }
    }
  ]
}
```

---

### 2. **Obtener cotización específica**
```
GET /api/cotizaciones/:idCotizacion
```

**Ejemplo:**
```bash
curl -X GET "http://localhost:3000/api/cotizaciones/1"
```

**Respuesta:**
```json
{
  "ok": true,
  "data": {
    "idCotizacion": "1",
    "numeroCotizacion": "COT-20260317-123456",
    "idCliente": "5",
    "estado": "borrador",
    "subtotal": "5000.00",
    "total": "5000.00",
    "cliente": { "nombreCompleto": "Juan García" },
    "productos": [
      {
        "idDetalleProducto": "10",
        "nombreItem": "Laptop Dell",
        "cantidad": 2,
        "precioUnitario": "2500.00",
        "subtotal": "5000.00"
      }
    ],
    "componentes": []
  }
}
```

---

### 3. **Crear cotización (guarda en borrador)**
```
POST /api/cotizaciones
```

**Body:**
```json
{
  "idCliente": 5,
  "productos": [
    {
      "idProducto": 10,
      "cantidad": 2
    },
    {
      "idProducto": 12,
      "cantidad": 1
    }
  ],
  "componentes": [
    {
      "idComponente": 3,
      "cantidad": 1
    }
  ],
  "moneda": "Bs",
  "observaciones": "Enviar en 3 días"
}
```

**Respuesta:**
```json
{
  "ok": true,
  "data": {
    "idCotizacion": "1",
    "numeroCotizacion": "COT-20260317-987654",
    "estado": "borrador",
    ...
  }
}
```

---

### 4. **Editar cotización (agregar/quitar productos)**
```
PUT /api/cotizaciones/:idCotizacion
```

**Body (igual a crear, actualiza los productos):**
```json
{
  "productos": [
    {
      "idProducto": 10,
      "cantidad": 3,
      "precioUnitario": "2400.00"  // Opcional: precio personalizado
    }
  ],
  "componentes": [],
  "moneda": "Bs",
  "observaciones": "Entrega urgente",
  "descuento": "100.00",
  "impuestos": "500.00"
}
```

**Ejemplo:**
```bash
curl -X PUT "http://localhost:3000/api/cotizaciones/1" \
  -H "Content-Type: application/json" \
  -d '{
    "productos": [{"idProducto": 10, "cantidad": 5}],
    "componentes": [],
    "descuento": "100.00"
  }'
```

**Respuesta:**
```json
{
  "ok": true,
  "data": {
    "idCotizacion": "1",
    "subtotal": "12500.00",
    "descuento": "100.00",
    "total": "12400.00",
    ...
  }
}
```

---

### 5. **Cambiar estado de cotización**
```
PATCH /api/cotizaciones/:idCotizacion/status
```

**Estados válidos:** `borrador`, `enviada`, `aceptada`, `rechazada`, `cancelada`

**Body:**
```json
{
  "estado": "enviada"
}
```

**Ejemplo:**
```bash
curl -X PATCH "http://localhost:3000/api/cotizaciones/1/status" \
  -H "Content-Type: application/json" \
  -d '{"estado": "aceptada"}'
```

---

### 6. **Eliminar cotización (solo borradores)**
```
DELETE /api/cotizaciones/:idCotizacion
```

**Ejemplo:**
```bash
curl -X DELETE "http://localhost:3000/api/cotizaciones/1"
```

**Respuesta:**
```json
{
  "ok": true,
  "message": "Cotización eliminada"
}
```

---

### 7. **Descargar PDF de una cotización**
```
GET /api/cotizaciones/:idCotizacion/pdf
```

**Ejemplo:**
```bash
curl -X GET "http://localhost:3000/api/cotizaciones/1/pdf" --output cotizacion.pdf
```

---

### 8. **Crear cotización y descargar PDF directamente**
```
POST /api/cotizaciones/pdf/create
```

**Body:** (mismo que crear cotización)
```json
{
  "idCliente": 5,
  "productos": [{"idProducto": 10, "cantidad": 2}],
  "componentes": [],
  "observaciones": "Test"
}
```

**Respuesta:** Archivo PDF

---

### 9. **Preview de cotización (sin guardar)**
```
POST /api/cotizaciones/preview/data
```

**Body:**
```json
{
  "idCliente": 5,
  "productos": [
    {"idProducto": 10, "cantidad": 2},
    {"idProducto": 12, "cantidad": 1}
  ],
  "componentes": [],
  "moneda": "Bs"
}
```

**Respuesta:**
```json
{
  "ok": true,
  "data": {
    "productos": [...],
    "componentes": [...],
    "subtotal": "5000.00",
    "total": "5000.00"
  }
}
```

---

## Flujo de Trabajo Recomendado

### 1. **Crear cotización inicial**
```bash
POST /api/cotizaciones
```

### 2. **Listar cotizaciones**
```bash
GET /api/cotizaciones?estado=borrador
```

### 3. **Ver detalles**
```bash
GET /api/cotizaciones/1
```

### 4. **Editar productos (agregar/quitar/cambiar cantidad)**
```bash
PUT /api/cotizaciones/1
```

### 5. **Cambiar estado**
```bash
PATCH /api/cotizaciones/1/status
# De borrador → enviada → aceptada
```

### 6. **Descargar PDF**
```bash
GET /api/cotizaciones/1/pdf
```

---

## Notas Importantes

- ✅ **Edición**: Solo se pueden editar cotizaciones en estado `borrador` o `pendiente`
- ✅ **Eliminación**: Solo se pueden eliminar cotizaciones en estado `borrador`
- ✅ **Totales**: Se recalculan automáticamente al actualizar
- ✅ **Paginación**: Máximo 100 registros por página
- ✅ **Inclusión de datos**: Al actualizar, se reemplazan todos los productos/componentes

---

## Posibles Modificaciones Futuras

1. **Historial de cambios**: Guardar versiones anteriores de cotizaciones
2. **Aprobación por niveles**: Requiere aprobación antes de enviar
3. **Plantillas**: Crear cotizaciones desde plantillas
4. **Descargas múltiples**: PDF y Excel en formato de lote
5. **Notificaciones**: Email cuando se cambia estado


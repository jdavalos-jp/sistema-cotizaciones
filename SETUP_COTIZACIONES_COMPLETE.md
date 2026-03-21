# ✅ Setup Completado - Gestión de Cotizaciones

## 📋 Resumen Ejecutivo

He preparado tu backend y frontend para que puedas:

✅ **Crear cotizaciones** que se guardan automáticamente en borrador
✅ **Listar todas las cotizaciones** con paginación y filtros por estado
✅ **Editar cotizaciones** - agregar/quitar/modificar productos
✅ **Cambiar estado** de cotizaciones (borrador → enviada → aceptada, etc.)
✅ **Eliminar cotizaciones** (solo las que están en borrador)
✅ **Descargar PDF** de cualquier cotización en cualquier momento
✅ **Vista previa** antes de guardar cambios

---

## 🎯 Flujo de Usuario Completo

### En el Backend:

1. **API REST completa** con endpoints para todas las operaciones
2. **Gestión de transacciones** asegura integridad de datos
3. **Recálculo automático** de totales, descuentos e impuestos
4. **Estados** para rastrear ciclo de vida de cotizaciones

### En el Frontend:

1. **Servicios HTTP** preparados para consumir la API
2. **Hooks React** para simplificar gestión de estado
3. **Métodos reutilizables** para cualquier componente

---

## 🚀 Cómo Usar

### Backend - Endpoints Principales:

```bash
# Crear
POST /api/cotizaciones
{ idCliente: 5, productos: [...], componentes: [...] }

# Listar
GET /api/cotizaciones?estado=borrador&take=50

# Ver details
GET /api/cotizaciones/1

# Editar (agregar/quitar productos)
PUT /api/cotizaciones/1
{ productos: [...], componentes: [...], descuento: 100 }

# Cambiar estado
PATCH /api/cotizaciones/1/status
{ estado: "enviada" }

# Descargar PDF
GET /api/cotizaciones/1/pdf

# Eliminar
DELETE /api/cotizaciones/1
```

---

### Frontend - Con Hooks:

```jsx
import { useCotizacion } from '@/modules/cotizacion/hooks/useCotizacionesManager'

function EditarCotizacion({ idCotizacion }) {
  const { cotizacion, update, downloadPdf, changeStatus } = useCotizacion(idCotizacion)

  const handleEdit = async () => {
    await update({
      productos: [{ idProducto: 10, cantidad: 5 }],
      componentes: [],
      descuento: 100
    })
  }

  const handleDownload = async () => {
    const blob = await downloadPdf()
    // ... descargar archivo
  }

  return (
    <div>
      <button onClick={handleEdit}>Guardar Cambios</button>
      <button onClick={handleDownload}>Descargar PDF</button>
      <button onClick={() => changeStatus('enviada')}>Enviar</button>
    </div>
  )
}
```

---

## 📁 Archivos Creados/Modificados

### Backend:
- ✏️ `cotizaciones.service.js` - 6 funciones nuevas
- ✏️ `cotizaciones.controller.js` - 8 handlers nuevos
- ✏️ `cotizaciones.routes.js` - 7 rutas nuevas
- 📄 `COTIZACIONES_API.md` - Documentación completa

### Frontend:
- ✏️ `http.js` - 3 métodos HTTP nuevos (PUT, PATCH, DELETE)
- ✏️ `cotizacionesApi.js` - 9 funciones API nuevas
- ✏️ `useCotizacionesManager.js` - 2 hooks personalizados
- 📄 `COTIZACIONES_FRONTEND_GUIDE.md` - Guía con ejemplos

---

## 🔄 Estados de Cotización

```
┌─────────┐
│Borrador │ ← Puedo crear, editar, eliminar
└────┬────┘
     │
     v
┌─────────┐
│Enviada  │ ← No puedo editar más
└────┬────┘
     │
     ├─→ ┌─────────┐
     │   │Aceptada │ ✅
     │   └─────────┘
     │
     └─→ ┌────────────┐
         │Rechazada   │ ❌
         └────────────┘

Cancelada ← Puede ser en cualquier momento
```

---

## 💡 Características Implementadas

### 1️⃣ **Creación en Borrador**
Las cotizaciones se guardan automáticamente en estado "borrador" permitiendo ediciones posteriores.

### 2️⃣ **Edición Completa**
Puedes modificar productos, cantidades, descuentos e impuestos. Los totales se recalculan automáticamente.

### 3️⃣ **Historial de Cotizaciones**
Todas las cotizaciones quedan guardadas en la BD para consulta futura.

### 4️⃣ **Control de Estados**
Sistema de estados para rastrear el ciclo de vida: borrador → enviada → aceptada/rechazada.

### 5️⃣ **Generación de PDF Bajo Demanda**
Descarga PDF en cualquier momento, sea una cotización nueva o existente.

### 6️⃣ **Paginación y Filtros**
Listados con paginación (máx 100/página) y filtros por estado.

---

## ⚙️ Detalles Técnicos

### Validaciones:
- ✅ Mínimo 1 producto o componente por cotización
- ✅ Solo editar en estados "borrador" o "pendiente"
- ✅ Solo eliminar cotizaciones en "borrador"

### Integridad de datos:
- ✅ Transacciones Prisma para operaciones múltiples
- ✅ Relaciones con cascada en eliminaciones
- ✅ Validaciones de tipos (BigInt, Int, Decimal)

### Cálculos:
- ✅ subtotal = suma(precioUnitario × cantidad - descuento)
- ✅ total = subtotal - descuento + impuestos

---

## 📊 Estructura de Datos

### Cotización
```
{
  idCotizacion: BigInt
  numeroCotizacion: string (único)
  idCliente: BigInt
  estado: string (borrador|enviada|aceptada|rechazada|cancelada)
  subtotal: Decimal
  descuento: Decimal
  impuestos: Decimal
  total: Decimal
  moneda: string (default: "Bs")
  observaciones: string
  fechaEmision: Date
  fechaValidez: Date (opcional)
  fechaCreacion: DateTime
  productos: CotizacionProducto[]
  componentes: CotizacionComponente[]
}
```

---

## 🧪 Ejemplos de Flujos

### Flujo Básico:
1. Crear cotización → `POST /api/cotizaciones`
2. Verla en lista → `GET /api/cotizaciones`
3. Editarla → `PUT /api/cotizaciones/1`
4. Cambiar a enviada → `PATCH /api/cotizaciones/1/status`
5. Descargar → `GET /api/cotizaciones/1/pdf`

### Flujo Rápido (Crear + PDF):
1. Crear y descargar al instante → `POST /api/cotizaciones/pdf/create`

### Flujo Preview:
1. Ver preview sin guardar → `POST /api/cotizaciones/preview/data`
2. Luego crear si está bien → `POST /api/cotizaciones`

---

## 📚 Documentación

Consulta estos archivos para más detalles:

- **Backend**: `backend/COTIZACIONES_API.md`
  - Referencia completa de endpoints
  - Ejemplos con curl
  - Respuestas JSON

- **Frontend**: `frontend/COTIZACIONES_FRONTEND_GUIDE.md`
  - Cómo usar hooks
  - Ejemplos de componentes
  - Manejo de errores

---

## 🔮 Mejoras Futuras (Opcionales)

1. **Historial de versiones** - Guardar cambios previos de cotizaciones
2. **Búsqueda avanzada** - Por cliente, fecha, rango de precio
3. **Descarga múltiple** - PDF + Excel + CSV
4. **Notificaciones** - Email/SMS al crear o cambiar estado
5. **Aprobación por niveles** - Requiere aprobación antes de enviar
6. **Templates** - Crear cotizaciones desde plantillas predefinidas

---

## ✨ Próximos Pasos

1. **Prueba los endpoints** con Postman/Insomnia/Curl
2. **Integra los hooks** en tus componentes React
3. **Prueba el flujo completo** de crear → editar → enviar → PDF
4. **Personaliza** según necesidades específicas

---

## 🙋 Soporte

Si necesitas:
- ✅ Agregar más campos a cotizaciones
- ✅ Cambiar validaciones
- ✅ Modificar cálculos
- ✅ Agregar nuevos estados
- ✅ Mejorar la seguridad/autenticación

¡Avísame y lo implemento!

---

**Estado: ✅ LISTO PARA USAR**

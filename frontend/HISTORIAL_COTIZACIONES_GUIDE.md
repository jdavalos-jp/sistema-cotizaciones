# 📋 Módulo de Historial de Cotizaciones

## ✅ Lo que se agregó

Se creó un nuevo módulo dentro del navbar para **gestionar todas tus cotizaciones en un solo lugar**.

### Ubicación en el Menu
```
Documentos
├── Proformas
├── 📋 Historial de Cotizaciones  ← NUEVO
├── Ventas
└── Contratos
```

---

## 🎯 Características

### 1. **Visualización de Todas las Cotizaciones**
- ✅ Tabla con todas tus cotizaciones
- ✅ Información del cliente, total y estado
- ✅ Filtros por estado
- ✅ Paginación (5, 10, 20, 50 registros por página)

### 2. **Filtros por Estado**
```
- Todas
- Borradores (🟠)
- Enviadas (🔵)
- Aceptadas (🟢)
- Rechazadas (🔴)
- Canceladas (⚪)
```

### 3. **Estadísticas en Tiempo Real**
Muestra contadores de:
- Cotizaciones en borrador
- Cotizaciones enviadas
- Cotizaciones aceptadas

### 4. **Acciones Disponibles**

#### Ver Detalles
- Abre un modal con información completa
- Muestra cliente, productos, totales
- Descarga de PDF
- Impresión

#### Descargar PDF
- Genera PDF de la cotización
- Listo para enviar al cliente

#### Enviar (Solo en Borradores)
- Cambia estado a "enviada"
- Abre oportunidad para aceptación/rechazo

#### Aceptar/Rechazar (Solo en Enviadas)
- Cambiar a "aceptada" (✅ verde)
- Cambiar a "rechazada" (❌ rojo)

#### Eliminar (Solo en Borradores)
- Elimina la cotización de la BD
- Pide confirmación antes

---

## 🖼️ Vista General

### Pantalla Principal del Historial

```
┌─────────────────────────────────────────────┐
│ 📋 Historial de Cotizaciones               │
│ Gestiona todas tus cotizaciones en un lugar │
└─────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ Filtro: [Todas ▼]  │ 🟠 5 │ 🔵 8 │ 🟢 12   │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ # Cotización│ Cliente        │ Total   │ Estado  │ Acciones   │
│─────────────┼────────────────┼─────────┼─────────┼────────────┤
│COT-240317..│ Juan García    │2500 Bs  │ Borrador│ 👁 📄 ✉️ ❌ │
│COT-240316..│ María López    │5000 Bs  │ Enviada │ 👁 📄 ✅ ❌ │
│COT-240315..│ Carlos Ruiz    │3500 Bs  │Aceptada │ 👁 📄        │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Ahora Puedes Hacer

### Crear Cotización
```
Documentos → Proformas → [Crear nueva]
            ↓
        Se guarda en "borrador"
```

### Ver todas las creadas
```
Documentos → Historial de Cotizaciones
           ↓
    Se muestra tabla con todas
```

### Editar una Cotización
```
Historial → [Ítem] → Ver Detalles → [Modal con datos]
```

### Cambiar Estado
```
Borrador → Enviar → "Enviada" → Aceptar/Rechazar → "Aceptada"/"Rechazada"
```

---

## 💡 Flujo de Trabajo Completo

### Paso 1: Crear
```
Documentos → Proformas → Agregar cliente y productos
```

### Paso 2: Listar
```
Documentos → Historial de Cotizaciones
```

### Paso 3: Editar (si es necesario)
```
Historial → Click en fila → Ver Detalles → [Editar en otra pantalla]
```

### Paso 4: Enviar
```
Historial → Click en "Enviar" (icono) → Estado = "Enviada"
```

### Paso 5: Seguimiento
```
Historial → Filtrar por "Enviadas" → Ver respuesta del cliente
           → Aceptar o Rechazar
```

### Paso 6: Descargar PDF
```
Historial → Click en reporta PDF (icono) → Descarga archivo
```

---

## 📊 Estados de Cotización en el Historial

| Estado | Color | Significado | Acciones Disponibles |
|--------|-------|-------------|----------------------|
| **Borrador** | 🟠 Naranja | Sin enviar | Enviar, Editar, Eliminar |
| **Enviada** | 🔵 Azul | En espera de respuesta | Aceptar, Rechazar |
| **Aceptada** | 🟢 Verde | Cliente aceptó | Ver solo |
| **Rechazada** | 🔴 Rojo | Cliente rechazó | Ver solo |
| **Cancelada** | ⚪ Gris | Cancelada | Ver solo |

---

## 🎨 Componentes Creados

### `HistorialCotizaciones.jsx`
- Componente principal
- Tabla de cotizaciones
- Filtros y estadísticas
- Manejo de acciones

### `VerDetalleCotizacion.jsx`
- Modal con detalles
- Tabla de ítems
- Resumen financiero
- Botones de descarga

### `HistorialCotizaciones.css`
- Estilos personalizados
- Responsive para móvil
- Paleta de colores moderna

---

## 🔌 Cómo Funciona

### Integración con Navbar
1. Se agregó `HistoryOutlined` icon
2. Se agregó ítem "Historial de Cotizaciones"
3. Al clickear, carga el componente `HistorialCotizaciones`
4. Se usa el hook `useCotizacionesList()` para traer datos
5. Se usa `useCotizacion()` para ver detalles

### Carga de Datos
```javascript
// Al montar el componente
useEffect(() => {
  cargarCotizaciones()  // Trae todas las cotizaciones
}, [filtro, paginacion])

// Al filtrar
const cargarCotizaciones = async () => {
  const estado = filtro === 'todos' ? null : filtro
  await loadCotizaciones({ estado, skip, take })
}
```

---

## 📱 Adaptado para Móvil

✅ Tabla responsive
✅ Filtros stackeados en mobile
✅ Iconos en lugar de texto completo
✅ Botones más pequeños en pantallas pequeñas

---

## 🔐 Validaciones

✅ Solo editar borradores
✅ Solo eliminar borradores
✅ Confirmación antes de eliminar
✅ Manejo de errores
✅ Mensajes de éxito/error

---

## 🚀 Próximas Mejoras (Opcionales)

1. **Búsqueda avanzada** - Por cliente, número, fechas
2. **Exportar a Excel** - Descarga tabla en Excel
3. **Envío por Email** - Enviar cotización por email
4. **Historial de cambios** - Ver cuándo se hizo cada cambio
5. **Comentarios** - Dejar notas en cotizaciones
6. **Seguimiento automático** - Recordatorios si no hay respuesta

---

## 📚 Archivos Generados

```
frontend/src/modules/cotizacion/components/
├── HistorialCotizaciones.jsx      ← Componente principal
├── VerDetalleCotizacion.jsx        ← Modal de detalles
└── HistorialCotizaciones.css       ← Estilos

frontend/src/layout/
└── AppLayout.jsx                   ← Actualizado con nuevo ítem
```

---

## ✨ Estado

✅ **Completamente funcional**
✅ **Integrado al navbar**
✅ **Responsive**
✅ **Con estilos modernos**
✅ **Listo para usar**

---

¡Ahora tienes un historial completo de cotizaciones en tu navbar! 🎉

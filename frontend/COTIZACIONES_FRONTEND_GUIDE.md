# Guía de Uso - Frontend de Cotizaciones

## 📚 Estructura

```
src/modules/cotizacion/
├── components/          # Componentes React
├── hooks/
│   ├── useCotizacionCart.js
│   ├── useCotizacionPreview.js
│   └── useCotizacionesManager.js  ⭐ NUEVO
├── services/
│   └── api/
│       ├── http.js                 # HTTP utilities (actualizado)
│       └── cotizacionesApi.js       # API funciones (actualizado)
```

---

## 🔧 API de Servicios

### Funciones disponibles en `cotizacionesApi.js`:

```javascript
import {
  getCotizaciones,          // GET lista de todas
  getCotizacion,            // GET una específica
  createCotizacion,         // POST crear nueva (borrador)
  updateCotizacion,         // PUT actualizar productos
  changeCotizacionStatus,   // PATCH cambiar estado
  deleteCotizacion,         // DELETE eliminar
  downloadCotizacionPdf,    // GET descargar PDF
  createAndDownloadPdf,     // POST crear y PDF
  previewCotizacion,        // POST preview sin guardar
} from './services/api/cotizacionesApi'
```

---

## 🪝 Hooks Personalizados

### 1. **useCotizacionesList()** - Gestionar lista de cotizaciones

```javascript
import { useCotizacionesList } from '@/modules/cotizacion/hooks/useCotizacionesManager'

function MiComponente() {
  const {
    cotizaciones,      // Array de cotizaciones
    loading,           // boolean
    error,             // string | null
    loadCotizaciones,  // fn(options?) → Promise
    createNew,         // fn(data) → Promise
    remove,            // fn(id) → Promise
    changeStatus,      // fn(id, estado) → Promise
  } = useCotizacionesList()

  // Cargar cotizaciones
  useEffect(() => {
    loadCotizaciones({
      skip: 0,
      take: 20,
      estado: 'borrador', // Opcional
    })
  }, [])

  // Crear
  const handleCreate = async () => {
    try {
      const nuevaCotizacion = await createNew({
        idCliente: 5,
        productos: [{ idProducto: 10, cantidad: 2 }],
        componentes: [],
        observaciones: 'Test',
      })
      console.log('Creada:', nuevaCotizacion)
    } catch (err) {
      console.error(err)
    }
  }

  // Cambiar estado
  const handleChangeStatus = async (idCotizacion) => {
    try {
      await changeStatus(idCotizacion, 'enviada')
    } catch (err) {
      console.error(err)
    }
  }

  // Eliminar
  const handleDelete = async (idCotizacion) => {
    try {
      await remove(idCotizacion)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {cotizaciones.map((cot) => (
        <div key={cot.idCotizacion}>
          <p>{cot.numeroCotizacion}</p>
          <p>Estado: {cot.estado}</p>
          <button onClick={() => handleChangeStatus(cot.idCotizacion)}>
            Enviar
          </button>
          <button onClick={() => handleDelete(cot.idCotizacion)}>
            Eliminar
          </button>
        </div>
      ))}
    </div>
  )
}
```

---

### 2. **useCotizacion(idCotizacion)** - Trabajar con una cotización específica

```javascript
import { useCotizacion } from '@/modules/cotizacion/hooks/useCotizacionesManager'

function DetallesCotizacion({ idCotizacion }) {
  const {
    cotizacion,      // Object | null
    loading,         // boolean
    error,           // string | null
    load,            // fn() → Promise
    update,          // fn(data) → Promise
    changeStatus,    // fn(estado) → Promise
    downloadPdf,     // fn() → Promise<Blob>
  } = useCotizacion(idCotizacion)

  // Cargar al montar
  useEffect(() => {
    load()
  }, [load])

  // Editar productos
  const handleEdit = async () => {
    try {
      const updated = await update({
        productos: [
          { idProducto: 10, cantidad: 5 },
          { idProducto: 12, cantidad: 1 },
        ],
        componentes: [],
        descuento: 100,
        impuestos: 500,
      })
      console.log('Actualizada:', updated)
    } catch (err) {
      console.error(err)
    }
  }

  // Descargar PDF
  const handleDownloadPdf = async () => {
    try {
      const blob = await downloadPdf()
      // Descargar archivo
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cotizacion-${cotizacion.numeroCotizacion}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>
  if (!cotizacion) return <div>No encontrada</div>

  return (
    <div>
      <h2>{cotizacion.numeroCotizacion}</h2>
      <p>Cliente: {cotizacion.cliente?.nombreCompleto}</p>
      <p>Total: {cotizacion.total} {cotizacion.moneda}</p>
      <p>Estado: {cotizacion.estado}</p>

      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Unitario</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {cotizacion.productos?.map((prod) => (
            <tr key={prod.idDetalleProducto}>
              <td>{prod.nombreItem}</td>
              <td>{prod.cantidad}</td>
              <td>{prod.precioUnitario}</td>
              <td>{prod.subtotal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handleEdit}>Editar Productos</button>
      <button onClick={handleDownloadPdf}>Descargar PDF</button>
      <button onClick={() => changeStatus('enviada')}>Enviar</button>
    </div>
  )
}
```

---

## 📋 Uso Directo de API Funciones

Si prefieres no usar hooks, puedes usar las funciones directamente:

```javascript
import {
  getCotizaciones,
  updateCotizacion,
} from '@/modules/cotizacion/services/api/cotizacionesApi'

// Listar
const data = await getCotizaciones({
  skip: 0,
  take: 50,
  estado: 'borrador',
})
console.log(data.data) // Array de cotizaciones

// Actualizar
const result = await updateCotizacion(1, {
  productos: [{ idProducto: 10, cantidad: 3 }],
  componentes: [],
  descuento: 50,
})
console.log(result.data) // Cotización actualizada
```

---

## 🎯 Casos de Uso Comunes

### Caso 1: Crear y previsualizar

```javascript
async function crearCotizacionConPreview() {
  // Preview primero (sin guardar)
  const preview = await previewCotizacion({
    idCliente: 5,
    productos: [{ idProducto: 10, cantidad: 2 }],
    moneda: 'Bs',
  })

  console.log('Totales:', preview.data.subtotal, preview.data.total)

  // Si está bien, crear
  const cotizacion = await createCotizacion({
    idCliente: 5,
    productos: [{ idProducto: 10, cantidad: 2 }],
  })

  return cotizacion.data
}
```

---

### Caso 2: Editar y cambiar a "enviada"

```javascript
async function editarYEnviar(idCotizacion) {
  // Actualizar productos
  await updateCotizacion(idCotizacion, {
    productos: [
      { idProducto: 10, cantidad: 5 },
      { idProducto: 12, cantidad: 2 },
    ],
    descuento: 100,
  })

  // Cambiar estado a enviada
  await changeCotizacionStatus(idCotizacion, 'enviada')

  // Descargar PDF
  const blob = await downloadCotizacionPdf(idCotizacion)
  downloadBlobAsFile(blob, `cotizacion.pdf`)
}
```

---

### Caso 3: Gestionar lista con filtros

```javascript
function ListaCotizaciones() {
  const { cotizaciones, loadCotizaciones, loading } = useCotizacionesList()
  const [estado, setEstado] = useState('borrador')

  const handleFilter = async (newEstado) => {
    setEstado(newEstado)
    await loadCotizaciones({ estado: newEstado })
  }

  return (
    <div>
      <button onClick={() => handleFilter('borrador')}>Borradores</button>
      <button onClick={() => handleFilter('enviada')}>Enviadas</button>
      <button onClick={() => handleFilter('aceptada')}>Aceptadas</button>

      {loading && <p>Cargando...</p>}

      <ul>
        {cotizaciones.map((cot) => (
          <li key={cot.idCotizacion}>
            {cot.numeroCotizacion} - {cot.estado} - {cot.total} Bs
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

## 🔄 Estados de Cotización

```
borrador → enviada → aceptada
       ↘
         rechazada

cancelada (puede ser en cualquier momento)
```

---

## ⚠️ Validaciones y Limitaciones

- ✅ **Solo editar en estados**: `borrador`, `pendiente`
- ✅ **Solo eliminar**: Cotizaciones en `borrador`
- ✅ **Al actualizar**: Se reemplaza TODA la lista de productos/componentes
- ✅ **Totales**: Se recalculan automáticamente
- ✅ **Paginación**: Máximo 100 registros por página

---

## 🐛 Manejo de Errores

```javascript
try {
  const cot = await createCotizacion({
    idCliente: 5,
    productos: [],
  })
} catch (err) {
  // err.message = "Debes seleccionar al menos un producto o componente"
  console.error(err)
}
```

---

## 📦 Ejemplo Completo - Componente de Edición

```javascript
import { useState, useEffect } from 'react'
import { useCotizacion } from '@/modules/cotizacion/hooks/useCotizacionesManager'

export function EditarCotizacion({ idCotizacion, onSuccess }) {
  const { cotizacion, loading, update, changeStatus } = useCotizacion(idCotizacion)
  const [productos, setProductos] = useState([])

  useEffect(() => {
    if (cotizacion?.productos) {
      setProductos(cotizacion.productos)
    }
  }, [cotizacion])

  const handleAddProducto = () => {
    setProductos([...productos, { idProducto: null, cantidad: 1 }])
  }

  const handleRemoveProducto = (idx) => {
    setProductos(productos.filter((_, i) => i !== idx))
  }

  const handleSave = async () => {
    try {
      await update({
        productos: productos.map((p) => ({
          idProducto: p.idProducto,
          cantidad: p.cantidad,
        })),
        componentes: [],
      })
      onSuccess?.()
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const handleEnviar = async () => {
    await handleSave()
    await changeStatus('enviada')
    onSuccess?.()
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div>
      <h3>Editar Cotización {cotizacion?.numeroCotizacion}</h3>

      {productos.map((prod, idx) => (
        <div key={idx}>
          <input
            type="number"
            placeholder="ID Producto"
            value={prod.idProducto || ''}
            onChange={(e) => {
              const newProds = [...productos]
              newProds[idx].idProducto = Number(e.target.value)
              setProductos(newProds)
            }}
          />
          <input
            type="number"
            placeholder="Cantidad"
            value={prod.cantidad}
            onChange={(e) => {
              const newProds = [...productos]
              newProds[idx].cantidad = Number(e.target.value)
              setProductos(newProds)
            }}
          />
          <button onClick={() => handleRemoveProducto(idx)}>Quitar</button>
        </div>
      ))}

      <button onClick={handleAddProducto}>Agregar Producto</button>
      <button onClick={handleSave}>Guardar Cambios</button>
      <button onClick={handleEnviar}>Guardar y Enviar</button>
    </div>
  )
}
```

---

## ✅ Próximas Mejoras

- [ ] Historial de versiones de cotizaciones
- [ ] Sistema de notificaciones en tiempo real
- [ ] Aprobación por niveles
- [ ] Descarga en múltiples formatos (PDF, Excel)
- [ ] Integración con WhatsApp/Email para envío automático

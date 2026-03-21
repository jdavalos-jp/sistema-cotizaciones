# 🚀 Ejemplos Prácticos - Copiar y Pegar

## 1️⃣ Componente: Listar Cotizaciones

```jsx
import { useState, useEffect } from 'react'
import { useCotizacionesList } from '@/modules/cotizacion/hooks/useCotizacionesManager'

export function ListaCotizaciones() {
  const {
    cotizaciones,
    loading,
    error,
    loadCotizaciones,
    changeStatus,
    remove,
  } = useCotizacionesList()

  const [filtro, setFiltro] = useState('borrador')

  useEffect(() => {
    loadCotizaciones({ estado: filtro })
  }, [filtro, loadCotizaciones])

  if (loading) return <div className="spinner">Cargando...</div>
  if (error) return <div className="error">Error: {error}</div>

  return (
    <div className="container">
      <h1>Mis Cotizaciones</h1>

      <div className="filtros">
        <button
          className={filtro === 'borrador' ? 'active' : ''}
          onClick={() => setFiltro('borrador')}
        >
          Borradores ({cotizaciones.length})
        </button>
        <button
          className={filtro === 'enviada' ? 'active' : ''}
          onClick={() => setFiltro('enviada')}
        >
          Enviadas
        </button>
        <button
          className={filtro === 'aceptada' ? 'active' : ''}
          onClick={() => setFiltro('aceptada')}
        >
          Aceptadas
        </button>
      </div>

      {cotizaciones.length === 0 ? (
        <p>No hay cotizaciones</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Números</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cotizaciones.map((cot) => (
              <tr key={cot.idCotizacion}>
                <td>{cot.numeroCotizacion}</td>
                <td>{cot.cliente?.nombreCompleto}</td>
                <td>
                  {cot.total} {cot.moneda}
                </td>
                <td>
                  <span className={`badge badge-${cot.estado}`}>
                    {cot.estado}
                  </span>
                </td>
                <td>
                  {cot.estado === 'borrador' && (
                    <>
                      <button
                        onClick={() =>
                          changeStatus(cot.idCotizacion, 'enviada')
                        }
                      >
                        Enviar
                      </button>
                      <button onClick={() => remove(cot.idCotizacion)}>
                        Eliminar
                      </button>
                    </>
                  )}
                  <a href={`/cotizaciones/${cot.idCotizacion}`}>Ver</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
```

---

## 2️⃣ Componente: Editar Cotización

```jsx
import { useState, useEffect } from 'react'
import { useCotizacion } from '@/modules/cotizacion/hooks/useCotizacionesManager'

export function EditarCotizacion({ idCotizacion }) {
  const { cotizacion, loading, error, update, downloadPdf, changeStatus } =
    useCotizacion(idCotizacion)

  const [productos, setProductos] = useState([])
  const [descuento, setDescuento] = useState(0)
  const [impuestos, setImpuestos] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // No necesitas llamar load(), se ejecuta automático
  }, [])

  useEffect(() => {
    if (cotizacion) {
      setProductos(cotizacion.productos || [])
      setDescuento(cotizacion.descuento || 0)
      setImpuestos(cotizacion.impuestos || 0)
    }
  }, [cotizacion])

  const handleAddProducto = () => {
    setProductos([
      ...productos,
      { idProducto: null, cantidad: 1, precioUnitario: 0 },
    ])
  }

  const handleRemoveProducto = (idx) => {
    setProductos(productos.filter((_, i) => i !== idx))
  }

  const handleUpdateProducto = (idx, field, value) => {
    const newProds = [...productos]
    newProds[idx] = { ...newProds[idx], [field]: value }
    setProductos(newProds)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await update({
        productos: productos.map((p) => ({
          idProducto: p.idProducto || p.id_producto,
          cantidad: Number(p.cantidad),
          precioUnitario: p.precioUnitario,
        })),
        componentes: [],
        descuento: Number(descuento),
        impuestos: Number(impuestos),
      })
      alert('Cambios guardados')
    } catch (err) {
      alert(`Error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleEnviar = async () => {
    await handleSave()
    await changeStatus('enviada')
    alert('Cotización enviada')
  }

  const handleDownload = async () => {
    try {
      const blob = await downloadPdf()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${cotizacion.numeroCotizacion}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>
  if (!cotizacion) return <div>No encontrada</div>

  return (
    <div className="editar-cotizacion">
      <h2>{cotizacion.numeroCotizacion}</h2>
      <p>Cliente: {cotizacion.cliente?.nombreCompleto}</p>
      <p>Estado: {cotizacion.estado}</p>

      <table className="productos-table">
        <thead>
          <tr>
            <th>ID Producto</th>
            <th>Nombre</th>
            <th>Cantidad</th>
            <th>P. Unitario</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {productos.map((prod, idx) => (
            <tr key={idx}>
              <td>
                <input
                  type="text"
                  value={prod.idProducto || prod.id_producto || ''}
                  onChange={(e) =>
                    handleUpdateProducto(idx, 'idProducto', e.target.value)
                  }
                />
              </td>
              <td>{prod.nombreItem}</td>
              <td>
                <input
                  type="number"
                  value={prod.cantidad}
                  onChange={(e) =>
                    handleUpdateProducto(idx, 'cantidad', e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={prod.precioUnitario || ''}
                  onChange={(e) =>
                    handleUpdateProducto(
                      idx,
                      'precioUnitario',
                      e.target.value
                    )
                  }
                />
              </td>
              <td>{prod.subtotal}</td>
              <td>
                <button onClick={() => handleRemoveProducto(idx)}>
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handleAddProducto}>+ Agregar Producto</button>

      <div className="totales">
        <label>
          Descuento: $
          <input
            type="number"
            value={descuento}
            onChange={(e) => setDescuento(e.target.value)}
          />
        </label>
        <label>
          Impuestos: $
          <input
            type="number"
            value={impuestos}
            onChange={(e) => setImpuestos(e.target.value)}
          />
        </label>
        <p>Total: {cotizacion.total}</p>
      </div>

      <div className="botones">
        <button onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
        <button onClick={handleDownload}>Descargar PDF</button>
        {cotizacion.estado === 'borrador' && (
          <button
            onClick={handleEnviar}
            className="btn-primary"
            disabled={saving}
          >
            Guardar y Enviar
          </button>
        )}
      </div>
    </div>
  )
}
```

---

## 3️⃣ Componente: Crear Nueva Cotización

```jsx
import { useState } from 'react'
import { useCotizacionesList } from '@/modules/cotizacion/hooks/useCotizacionesManager'
import { getCatalogo } from '@/modules/cotizacion/services/api/catalogoApi'

export function CrearCotizacion({ onSuccess }) {
  const { createNew, loading: creando } = useCotizacionesList()

  const [idCliente, setIdCliente] = useState('')
  const [productos, setProductos] = useState([])
  const [catalogo, setCatalogo] = useState([])
  const [showCatalogo, setShowCatalogo] = useState(false)

  const handleAgregarProducto = async (producto) => {
    setProductos([
      ...productos,
      {
        idProducto: producto.idProducto,
        nombre: producto.nombre,
        cantidad: 1,
      },
    ])
    setShowCatalogo(false)
  }

  const handleCreate = async () => {
    if (!idCliente || productos.length === 0) {
      alert('Selecciona cliente y productos')
      return
    }

    try {
      const nuevaCotizacion = await createNew({
        idCliente: Number(idCliente),
        productos: productos.map((p) => ({
          idProducto: p.idProducto,
          cantidad: p.cantidad,
        })),
        componentes: [],
      })

      alert('Cotización creada: ' + nuevaCotizacion.numeroCotizacion)
      onSuccess?.(nuevaCotizacion)
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  return (
    <div className="crear-cotizacion">
      <h2>Nueva Cotización</h2>

      <label>
        Cliente:
        <input
          type="number"
          placeholder="ID Cliente"
          value={idCliente}
          onChange={(e) => setIdCliente(e.target.value)}
        />
      </label>

      <div className="productos-section">
        <h3>Productos Seleccionados</h3>
        {productos.length === 0 ? (
          <p>No hay productos</p>
        ) : (
          <ul>
            {productos.map((prod, idx) => (
              <li key={idx}>
                {prod.nombre} x
                <input
                  type="number"
                  min="1"
                  value={prod.cantidad}
                  onChange={(e) => {
                    const newProds = [...productos]
                    newProds[idx].cantidad = Number(e.target.value)
                    setProductos(newProds)
                  }}
                />
                <button
                  onClick={() =>
                    setProductos(productos.filter((_, i) => i !== idx))
                  }
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        <button onClick={() => setShowCatalogo(!showCatalogo)}>
          {showCatalogo ? 'Cerrar Catálogo' : 'Seleccionar Productos'}
        </button>
      </div>

      {showCatalogo && (
        <div className="catalogo">
          <h3>Catálogo de Productos</h3>
          {/* Aquí irían los productos del catálogo */}
          {/* puedes usar useCatalogSearch() para buscar */}
        </div>
      )}

      <button onClick={handleCreate} disabled={creando} className="btn-primary">
        {creando ? 'Creando...' : 'Crear Cotización'}
      </button>
    </div>
  )
}
```

---

## 4️⃣ Ejemplo con Fetch Directo (Sin Hooks)

```javascript
// Simular uso sin hooks si lo prefieres

async function crudCotizaciones() {
  // Crear
  const createRes = await fetch('http://localhost:3001/api/cotizaciones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idCliente: 5,
      productos: [{ idProducto: 10, cantidad: 2 }],
      componentes: [],
    }),
  })
  const created = await createRes.json()
  console.log('Creada:', created.data)

  // Listar
  const listRes = await fetch(
    'http://localhost:3001/api/cotizaciones?estado=borrador'
  )
  const list = await listRes.json()
  console.log('Lista:', list.data)

  // Obtener  una
  const getRes = await fetch('http://localhost:3001/api/cotizaciones/1')
  const cot = await getRes.json()
  console.log('Detalles:', cot.data)

  // Actualizar
  const updateRes = await fetch('http://localhost:3001/api/cotizaciones/1', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productos: [{ idProducto: 10, cantidad: 5 }],
      componentes: [],
      descuento: 100,
    }),
  })
  const updated = await updateRes.json()
  console.log('Actualizada:', updated.data)

  // Cambiar estado
  const statusRes = await fetch(
    'http://localhost:3001/api/cotizaciones/1/status',
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'enviada' }),
    }
  )
  const withNewStatus = await statusRes.json()
  console.log('Estado cambiado:', withNewStatus.data)

  // Descargar PDF
  const pdfRes = await fetch('http://localhost:3001/api/cotizaciones/1/pdf')
  const pdfBlob = await pdfRes.blob()
  const url = URL.createObjectURL(pdfBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'cotizacion.pdf'
  a.click()

  // Eliminar
  const delRes = await fetch('http://localhost:3001/api/cotizaciones/1', {
    method: 'DELETE',
  })
  const deleted = await delRes.json()
  console.log('Eliminada:', deleted)
}
```

---

## 5️⃣ Estilos CSS Básicos

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.table th,
.table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.table th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.table tr:hover {
  background-color: #f9f9f9;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.badge-borrador {
  background-color: #fff3cd;
  color: #856404;
}

.badge-enviada {
  background-color: #cfe2ff;
  color: #084298;
}

.badge-aceptada {
  background-color: #d1e7dd;
  color: #0f5132;
}

.badge-rechazada {
  background-color: #f8d7da;
  color: #842029;
}

button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #e9ecef;
  color: #212529;
  font-size: 14px;
}

button:hover {
  background-color: #dee2e6;
}

.btn-primary {
  background-color: #0d6efd;
  color: white;
}

.btn-primary:hover {
  background-color: #0b5ed7;
}
```

---

## 6️⃣ Test con Postman

Importa esta colección en Postman:

```json
{
  "info": {
    "name": "Cotizaciones API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Crear Cotización",
      "request": {
        "method": "POST",
        "header": [
          { "key": "Content-Type", "value": "application/json" }
        ],
        "url": { "raw": "http://localhost:3001/api/cotizaciones" },
        "body": {
          "mode": "raw",
          "raw": "{\"idCliente\": 5, \"productos\": [{\"idProducto\": 10, \"cantidad\": 2}]}"
        }
      }
    },
    {
      "name": "Listar Cotizaciones",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3001/api/cotizaciones?estado=borrador"
        }
      }
    },
    {
      "name": "Obtener Cotización",
      "request": {
        "method": "GET",
        "url": { "raw": "http://localhost:3001/api/cotizaciones/1" }
      }
    },
    {
      "name": "Actualizar Cotización",
      "request": {
        "method": "PUT",
        "header": [
          { "key": "Content-Type", "value": "application/json" }
        ],
        "url": { "raw": "http://localhost:3001/api/cotizaciones/1" },
        "body": {
          "mode": "raw",
          "raw": "{\"productos\": [{\"idProducto\": 10, \"cantidad\": 5}], \"descuento\": 100}"
        }
      }
    },
    {
      "name": "Cambiar Estado",
      "request": {
        "method": "PATCH",
        "header": [
          { "key": "Content-Type", "value": "application/json" }
        ],
        "url": { "raw": "http://localhost:3001/api/cotizaciones/1/status" },
        "body": { "mode": "raw", "raw": "{\"estado\": \"enviada\"}" }
      }
    },
    {
      "name": "Descargar PDF",
      "request": {
        "method": "GET",
        "url": { "raw": "http://localhost:3001/api/cotizaciones/1/pdf" }
      }
    },
    {
      "name": "Eliminar Cotización",
      "request": {
        "method": "DELETE",
        "url": { "raw": "http://localhost:3001/api/cotizaciones/1" }
      }
    }
  ]
}
```

---

¡Listo! Copia y pega estos ejemplos en tus archivos y personaliza según tus necesidades.

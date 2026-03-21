import React, { useState } from 'react'
import { Button, Space, Typography, message, Card, Row, Col, Divider } from 'antd'
import { CheckCircleOutlined, PlusOutlined } from '@ant-design/icons'

import { ClienteDatosSection, FechaValidacionSection, AgregarProductosSection, ProductosSeleccionadosTable, ClienteDatosSeleccionado, ModalNuevoCliente } from './sections'

import { useCatalogSearch } from '../hooks/useCatalogSearch'
import { useClientesSearch } from '../hooks/useClientesSearch'
import { useCotizacionCart } from '../hooks/useCotizacionCart'
import { useCotizacionPreview } from '../hooks/useCotizacionPreview'

import { fetchProductos, fetchComponentes } from '../services/api/catalogoApi'
import { generarPdfCotizacion } from '../services/api/cotizacionesApi'

function toArrayBufferBlob(arrayBuffer) {
	return new Blob([arrayBuffer], { type: 'application/pdf' })
}

function downloadBlob(blob, filename) {
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = filename
	document.body.appendChild(a)
	a.click()
	a.remove()
	URL.revokeObjectURL(url)
}

export default function CotizacionNueva() {
	const [idCliente, setIdCliente] = useState(null)
	const [clienteLabel, setClienteLabel] = useState('')
	const [clienteData, setClienteData] = useState(null)
	const [fechaInicio, setFechaInicio] = useState(null)
	const [fechaFin, setFechaFin] = useState(null)
	const [moneda] = useState('Bs')
	const [loadingSubmit, setLoadingSubmit] = useState(false)
	const [showSuccess, setShowSuccess] = useState(false)
	const [modalNuevoClienteVisible, setModalNuevoClienteVisible] = useState(false)

	const clientes = useClientesSearch()
	const productos = useCatalogSearch(fetchProductos)
	const componentes = useCatalogSearch(fetchComponentes)

	const cart = useCotizacionCart()
	const preview = useCotizacionPreview({ idCliente, moneda, cart: cart.cart })

	const lineas = preview.data?.lineas ?? []

	function onRemove(tipo, id) {
		cart.removeItem(tipo, String(id))
	}

	function onSetCantidad(tipo, id, cantidad) {
		cart.setCantidad(tipo, String(id), cantidad)
	}

	// Obtener datos del cliente cuando se selecciona
	async function handleClienteSelect(clienteId, clienteName) {
		setIdCliente(clienteId)
		setClienteLabel(clienteName)
		// Aquí iría la llamada a tu API para obtener datos completos del cliente
		// Por ahora, simulamos datos
		setClienteData({
			nombre: clienteName,
			correo: 'correo@ejemplo.com',
			telefono: '+ 591 XX XXX XXXX',
			direccion: 'Dirección del cliente',
			observaciones: 'Observaciones si las hay'
		})
	}

	async function handleGenerarCotizacion() {
		if (!idCliente) {
			message.warning('Selecciona un cliente')
			return
		}
		if (!cart.cart.length) {
			message.warning('Selecciona al menos un producto o componente')
			return
		}
		if (!fechaInicio || !fechaFin) {
			message.warning('Selecciona fechas de validación')
			return
		}

		setLoadingSubmit(true)
		try {
			const payload = {
				idCliente: String(idCliente),
				moneda,
				productos: cart.cart
					.filter((x) => x.tipo === 'producto')
					.map((x) => ({
						idProducto: String(x.id),
						cantidad: Math.max(1, Number(x.cantidad) || 1),
					})),
				componentes: cart.cart
					.filter((x) => x.tipo === 'componente')
					.map((x) => ({
						idComponente: String(x.id),
						cantidad: Math.max(1, Number(x.cantidad) || 1),
					})),
			}

			const pdfArrayBuffer = await generarPdfCotizacion(payload)
			const blob = toArrayBufferBlob(pdfArrayBuffer)
			downloadBlob(blob, 'cotizacion.pdf')
			message.success('¡Cotización creada exitosamente!')
			setShowSuccess(true)

			// Limpiar después de 3 segundos
			setTimeout(() => {
				cart.clear()
				setIdCliente(null)
				setClienteLabel('')
				setFechaInicio(null)
				setFechaFin(null)
				setShowSuccess(false)
			}, 3000)
		} catch (err) {
			message.error(String(err?.message || err))
		} finally {
			setLoadingSubmit(false)
		}
	}

	if (showSuccess) {
		return (
			<Card>
				<div style={{ textAlign: 'center', padding: '60px 20px' }}>
					<CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 24 }} />
					<Typography.Title level={2}>¡Cotización Completada!</Typography.Title>
					<Typography.Text>La cotización ha sido creada y descargada exitosamente</Typography.Text>
				</div>
			</Card>
		)
	}

	return (
		<div>
			<Space orientation="vertical" size={24} style={{ width: '100%' }}>
				{/* Header */}
				<div>
					<Typography.Title level={3} style={{ marginTop: 0, marginBottom: 0 }}>
						Nueva Cotización
					</Typography.Title>
					<Typography.Text type="secondary">Completa los datos para crear una cotización</Typography.Text>
				</div>

				{/* Sección 1: Datos del Cliente */}
				<ClienteDatosSection
					clientes={clientes}
					idCliente={idCliente}
					setIdCliente={setIdCliente}
					clienteLabel={clienteLabel}
					setClienteLabel={setClienteLabel}
					onNewCliente={() => setModalNuevoClienteVisible(true)}
				/>

				{/* Mostrar datos del cliente seleccionado */}
				{idCliente && (
					<ClienteDatosSeleccionado
						clienteLabel={clienteLabel}
						clienteData={clienteData}
					/>
				)}

				{/* Sección 2: Fechas de Validación */}
				<FechaValidacionSection
					fechaInicio={fechaInicio}
					setFechaInicio={setFechaInicio}
					fechaFin={fechaFin}
					setFechaFin={setFechaFin}
				/>

				{/* Sección 3: Agregar Productos */}
				<AgregarProductosSection
					productos={productos}
					componentes={componentes}
					cart={cart}
				/>

				{/* Sección 4: Productos Seleccionados */}
				<ProductosSeleccionadosTable
					lineas={lineas}
					moneda={moneda}
					onRemove={onRemove}
					onSetCantidad={onSetCantidad}
				/>

				<Divider style={{ margin: '8px 0' }} />

				{/* Botones de acción */}
				<Row justify="space-between" align="middle">
					<Col>
						<Typography.Text type="secondary">
							{cart.cart.length} producto(s) en cotización
						</Typography.Text>
					</Col>
					<Col>
						<Space>
							<Button onClick={() => cart.clear()}>Limpiar</Button>
							<Button
								type="primary"

								icon={<PlusOutlined />}
								loading={loadingSubmit}
								onClick={handleGenerarCotizacion}
								disabled={!idCliente || !cart.cart.length || !fechaInicio || !fechaFin}
							>
								Generar Cotización
							</Button>
						</Space>
					</Col>
				</Row>
			</Space>

			{/* Modal para nuevo cliente */}
			<ModalNuevoCliente
				visible={modalNuevoClienteVisible}
				onClose={() => setModalNuevoClienteVisible(false)}
				onSuccess={(nuevoCliente) => {
					setIdCliente(nuevoCliente.id || Date.now())
					setClienteLabel(nuevoCliente.nombre)
					setClienteData(nuevoCliente)
					clientes.setSearch(nuevoCliente.nombre)
					message.success('Cliente registrado exitosamente')
				}}
			/>
		</div>
	)
}
import React, { useMemo, useState } from 'react'
import {
	AutoComplete,
	Button,
	Col,
	Divider,
	Row,
	Space,
	Steps,
	Tabs,
	Typography,
	message,
} from 'antd'

import CatalogTable from './CatalogTable'
import SelectedItemsPanel from './SelectedItemsPanel'

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

export default function Cotizacion() {
	const [tab, setTab] = useState('productos')
	const [idCliente, setIdCliente] = useState(null)
	const [clienteLabel, setClienteLabel] = useState('')
	const [moneda] = useState('Bs')

	const clientes = useClientesSearch()
	const productos = useCatalogSearch(fetchProductos)
	const componentes = useCatalogSearch(fetchComponentes)

	const cart = useCotizacionCart()
	const preview = useCotizacionPreview({ idCliente, moneda, cart: cart.cart })

	const selectedRowKeysProductos = useMemo(
		() => cart.cart.filter((x) => x.tipo === 'producto').map((x) => String(x.id)),
		[cart.cart],
	)
	const selectedRowKeysComponentes = useMemo(
		() => cart.cart.filter((x) => x.tipo === 'componente').map((x) => String(x.id)),
		[cart.cart],
	)

	const lineas = preview.data?.lineas ?? []

	async function onContinuar() {
		if (!idCliente) {
			message.warning('Selecciona un cliente')
			return
		}
		if (!cart.cart.length) {
			message.warning('Selecciona al menos un producto o componente')
			return
		}

		const payload = {
			idCliente: String(idCliente),
			moneda,
			productos: cart.cart
				.filter((x) => x.tipo === 'producto')
				.map((x) => ({ idProducto: String(x.id), cantidad: x.cantidad })),
			componentes: cart.cart
				.filter((x) => x.tipo === 'componente')
				.map((x) => ({ idComponente: String(x.id), cantidad: x.cantidad })),
		}

		try {
			const pdfArrayBuffer = await generarPdfCotizacion(payload)
			const blob = toArrayBufferBlob(pdfArrayBuffer)
			downloadBlob(blob, 'cotizacion.pdf')
			message.success('PDF generado')
		} catch (err) {
			message.error(String(err?.message || err))
		}
	}

	function onRemove(tipo, id) {
		cart.removeItem(tipo, String(id))
	}

	function onSetCantidad(tipo, id, cantidad) {
		cart.setCantidad(tipo, String(id), cantidad)
	}

	return (
		<div>
			<Space direction="vertical" size={16} style={{ width: '100%' }}>
				<div>
					<Typography.Title level={3} style={{ marginTop: 0, marginBottom: 0 }}>
						Nueva cotización
					</Typography.Title>
					<Typography.Text type="secondary">Selecciona cliente y agrega ítems</Typography.Text>
				</div>

				<Steps
					current={0}
					items={[
						{ title: 'Cesta' },
						{ title: 'Procede al pago' },
						{ title: 'Pagar' },
						{ title: 'Pedido completado' },
					]}
				/>

				<Row gutter={[16, 16]}>
					<Col xs={24} lg={10}>
						<Typography.Text strong>Cliente</Typography.Text>
						<AutoComplete
							style={{ width: '100%', marginTop: 8 }}
							value={clientes.search}
							options={clientes.options}
							onSearch={(v) => {
								clientes.setSearch(v)
								if (idCliente && v !== clienteLabel) {
									setIdCliente(null)
								}
							}}
							onSelect={(value) => {
								setIdCliente(value)
								const label = clientes.options.find((o) => o.value === value)?.label ?? value
								setClienteLabel(label)
								clientes.setSearch(label)
							}}
							placeholder="Busca por nombre, email o teléfono"
							allowClear
						/>
						<Typography.Text type="secondary">
							Escribe al menos 2 caracteres.
						</Typography.Text>
					</Col>
					<Col xs={24} lg={14}>
						<SelectedItemsPanel
							lineas={lineas}
							moneda={moneda}
							onRemove={onRemove}
							onSetCantidad={onSetCantidad}
						/>
					</Col>
				</Row>

				<Divider style={{ margin: '8px 0' }} />

				<Tabs
					activeKey={tab}
					onChange={setTab}
					items={[
						{
							key: 'productos',
							label: 'Productos',
							children: (
								<CatalogTable
									title="Producto"
									loading={productos.loading}
									items={productos.items.map((p) => ({
										...p,
										id: p.idProducto,
									}))}
									search={productos.search}
									onSearchChange={productos.setSearch}
									rowKey="idProducto"
									selectedRowKeys={selectedRowKeysProductos}
									onSelectionChange={(keys) =>
										cart.setSelectionFromList(
											'producto',
											keys,
											productos.items.map((p) => ({
												id: p.idProducto,
												nombre: p.nombre,
											})),
										)
									}
								/>
							),
						},
						{
							key: 'componentes',
							label: 'Componentes',
							children: (
								<CatalogTable
									title="Componente"
									loading={componentes.loading}
									items={componentes.items.map((c) => ({
										...c,
										id: c.idComponente,
									}))}
									search={componentes.search}
									onSearchChange={componentes.setSearch}
									rowKey="idComponente"
									selectedRowKeys={selectedRowKeysComponentes}
									onSelectionChange={(keys) =>
										cart.setSelectionFromList(
											'componente',
											keys,
											componentes.items.map((c) => ({
												id: c.idComponente,
												nombre: c.nombre,
											})),
										)
									}
								/>
							),
						},
					]}
				/>

				<Space style={{ width: '100%', justifyContent: 'space-between' }}>
					<Typography.Text type="secondary">
						{cart.cart.length} item(s) seleccionados
					</Typography.Text>
					<Space>
						<Button onClick={() => cart.clear()}>Cancelar</Button>
						<Button type="primary" loading={preview.loading} onClick={onContinuar}>
							Continuar
						</Button>
					</Space>
				</Space>
			</Space>
		</div>
	)
}

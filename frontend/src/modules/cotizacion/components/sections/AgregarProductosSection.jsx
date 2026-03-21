import React, { useState } from 'react'
import { Card, Select, InputNumber, Button, Row, Col, Typography, Space, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

export default function AgregarProductosSection({
	productos,
	componentes,
	cart,
}) {
	const [selectedId, setSelectedId] = useState(null)
	const [selectedType, setSelectedType] = useState('producto')
	const [cantidad, setCantidad] = useState(1)

	const items = selectedType === 'producto' ? productos.items : componentes.items
	const keyField = selectedType === 'producto' ? 'idProducto' : 'idComponente'

	const options = items.map((item) => ({
		label: `${item.nombre} (${item.codigo || 'S/N'})`,
		value: item[keyField],
		item: item,
	}))

	function handleAgregar() {
		if (!selectedId) {
			message.warning('Selecciona un producto o componente')
			return
		}

		const item = items.find((i) => i[keyField] === selectedId)
		if (!item) return

		cart.addItem({
			tipo: selectedType,
			id: selectedId,
			nombre: item.nombre,
			cantidad: Math.max(1, Number(cantidad) || 1),
		})

		message.success(`${item.nombre} agregado al carrito`)
		setSelectedId(null)
		setCantidad(1)
	}

	return (
		<Card
			title={
				<Space>
					<PlusOutlined />
					<span>Agregar Productos</span>
				</Space>
			}
		>
			<Row gutter={[16, 16]} align="bottom">
				<Col xs={24} md={6}>
					<Typography.Text type="secondary">Tipo *</Typography.Text>
					<Select
						style={{ width: '100%', marginTop: 8 }}
						value={selectedType}
						onChange={setSelectedType}
						options={[
							{ label: 'Producto', value: 'producto' },
							{ label: 'Componente', value: 'componente' },
						]}
					/>
				</Col>

				<Col xs={24} md={12}>
					<Typography.Text type="secondary">Selecciona producto *</Typography.Text>
					<Select
						style={{ width: '100%', marginTop: 8 }}
						placeholder="-- Selecciona producto --"
						value={selectedId}
						onChange={setSelectedId}
						options={options}
						loading={selectedType === 'producto' ? productos.loading : componentes.loading}
					/>
				</Col>

				<Col xs={24} md={4}>
					<Typography.Text type="secondary">Cantidad</Typography.Text>
					<InputNumber
						style={{ width: '100%', marginTop: 8 }}
						min={1}
						value={cantidad}
						onChange={setCantidad}
					/>
				</Col>

				<Col xs={24} md={2}>
					<Button
                     type="primary"
                     icon={<PlusOutlined style={{ color: 'white' }} />} onClick={handleAgregar} className='argregar-btn'>
						Agregar
					</Button>
				</Col>
			</Row>
		</Card>
	)
}

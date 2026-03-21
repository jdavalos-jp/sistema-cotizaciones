import React, { useState } from 'react'
import { AutoComplete, Button, Card, Space, Typography, Row, Col, Statistic, Divider, message } from 'antd'
import { UserOutlined, FileAddOutlined, PlusOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { fetchClienteById } from '../../services/api/clientesApi'

export default function ClienteDatosSection({
	clientes,
	idCliente,
	setIdCliente,
	clienteLabel,
	setClienteLabel,
	onNewCliente,
}) {
	const [clienteData, setClienteData] = useState(null)
	const [loadingCliente, setLoadingCliente] = useState(false)

	const handleSelectCliente = async (value) => {
		setIdCliente(value)
		const label = clientes.options.find((o) => o.value === value)?.label ?? value
		setClienteLabel(label)
		clientes.setSearch(label)

		// Cargar datos completos del cliente
		setLoadingCliente(true)
		try {
			const cliente = await fetchClienteById(value)
			setClienteData(cliente)
		} catch (err) {
			message.error('No se pudieron cargar los datos del cliente')
			console.error(err)
		} finally {
			setLoadingCliente(false)
		}
	}

	const handleSearchChange = (v) => {
		clientes.setSearch(v)
		if (idCliente && v !== clienteLabel) {
			setIdCliente(null)
			setClienteData(null)
		}
	}

	return (
		<Card
			title={
				<Space>
					<UserOutlined />
					<span>Cliente</span>
				</Space>
			}
			extra={
				<Button
					type="primary"
					icon={<PlusOutlined style={{ color: 'white' }} />}
					onClick={onNewCliente}
					className="btn-nuevo-cliente"
				>
					Nuevo Cliente
				</Button>
			}
		>
			<Space direction="vertical" style={{ width: '100%' }} size={12}>
				<div>
					<Typography.Text type="secondary">Seleccionar cliente *</Typography.Text>
					<AutoComplete
						style={{ width: '100%', marginTop: 8 }}
						value={clientes.search}
						options={clientes.options}
						placeholder="Buscar cliente..."
						onSearch={handleSearchChange}
						onSelect={handleSelectCliente}
						allowClear
						loading={clientes.loading}
					/>
					<Typography.Text type="secondary" style={{ fontSize: '12px' }}>
						Escribe al menos 2 caracteres o crea uno nuevo
					</Typography.Text>
				</div>

				{/* Mostrar datos del cliente seleccionado */}
				{idCliente && clienteData && (
					<>
						<Divider style={{ margin: '12px 0' }} />
						<div>
							<Typography.Text strong style={{ fontSize: '14px' }}>
								Datos del Cliente
							</Typography.Text>
							<Row gutter={[16, 16]} style={{ marginTop: 12 }}>
								<Col xs={24} sm={12}>
									<div>
										<Typography.Text type="secondary" style={{ fontSize: '12px' }}>
											Nombre
										</Typography.Text>
										<div style={{ fontSize: '16px', fontWeight: '500', marginTop: 4 }}>
											{clienteData.nombreCompleto || '-'}
										</div>
									</div>
								</Col>
								<Col xs={24} sm={12}>
									<div>
										<Typography.Text type="secondary" style={{ fontSize: '12px' }}>
											Correo
										</Typography.Text>
										<div style={{ fontSize: '16px', fontWeight: '500', marginTop: 4 }}>
											{clienteData.email || '-'}
										</div>
									</div>
								</Col>
								<Col xs={24} sm={12}>
									<div>
										<Typography.Text type="secondary" style={{ fontSize: '12px' }}>
											Teléfono
										</Typography.Text>
										<div style={{ fontSize: '16px', fontWeight: '500', marginTop: 4 }}>
											{clienteData.telefono || '-'}
										</div>
									</div>
								</Col>
								{clienteData.institucion && (
									<Col xs={24} sm={12}>
										<div>
											<Typography.Text type="secondary" style={{ fontSize: '12px' }}>
												Razón Social
											</Typography.Text>
											<div style={{ fontSize: '16px', fontWeight: '500', marginTop: 4 }}>
												{clienteData.institucion.nombre || '-'}
											</div>
										</div>
									</Col>
								)}
							</Row>
						</div>
					</>
				)}
			</Space>
		</Card>
	)
}

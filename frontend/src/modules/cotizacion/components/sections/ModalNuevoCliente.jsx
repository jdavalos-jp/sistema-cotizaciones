import React, { useState } from 'react'
import { Modal, Form, Input, Button, Space, message, Row, Col } from 'antd'
import { UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { apiPost } from '../../../../services/api/http'

function ModalNuevoCliente({ visible, onClose, onSuccess }) {
	const [form] = Form.useForm()
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (values) => {
		setLoading(true)
		try {
			const payload = {
				nombreCompleto: values.nombre,
				email: values.correo,
				telefono: values.telefono,
				direccion: values.direccion,
				ciudad: values.ciudad,
				cargo: values.cargo,
				institucion: values.institucion,
				observaciones: values.observaciones,
			}

			const responseData = await apiPost('/clientes', payload)
			const cliente = responseData?.data ?? responseData

			message.success('Cliente creado exitosamente')
			form.resetFields()
			onSuccess({
				...cliente,
				id: cliente?.idCliente ?? cliente?.id,
				nombre: cliente?.nombreCompleto ?? cliente?.nombre ?? values.nombre,
			})
			onClose()
		} catch (err) {
			message.error(err.message || 'Error al crear cliente')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Modal
			title="Registrar Nuevo Cliente"
			open={visible}
			onCancel={onClose}
			footer={null}
			width={600}
		>
			<Form
				form={form}
				layout="vertical"
				onFinish={handleSubmit}
			>
				<Form.Item
					label="Nombre del cliente"
					name="nombre"
				>
					<Input prefix={<UserOutlined />} placeholder="Nombre completo" />
				</Form.Item>

				<Row gutter={16}>
					<Col span={12}>
						<Form.Item
							label="Correo electrónico"
							name="correo"
							rules={[
								{ type: 'email', message: 'Formato de correo inválido' },
							]}
						>
							<Input prefix={<MailOutlined />} placeholder="correo@ejemplo.com" />
						</Form.Item>
					</Col>

					<Col span={12}>
						<Form.Item
							label="Teléfono"
							name="telefono"
						>
							<Input prefix={<PhoneOutlined />} placeholder="Número de teléfono" />
						</Form.Item>
					</Col>
				</Row>

				<Form.Item
					label="Dirección"
					name="direccion"
				>
					<Input prefix={<EnvironmentOutlined />} placeholder="Dirección completa" />
				</Form.Item>

				<Row gutter={16}>
					<Col span={12}>
						<Form.Item
							label="Ciudad"
							name="ciudad"
						>
							<Input placeholder="Ciudad" />
						</Form.Item>
					</Col>

					<Col span={12}>
						<Form.Item
							label="Cargo"
							name="cargo"
						>
							<Input placeholder="Cargo del cliente" />
						</Form.Item>
					</Col>
				</Row>

				<Form.Item
					label="Institución"
					name="institucion"
				>
					<Input placeholder="Nombre de la institución" />
				</Form.Item>

				<Form.Item
					label="Contacto en la institución"
					name="observaciones"
				>
					<Input.TextArea placeholder="Contacto en la institución" rows={3} />
				</Form.Item>

				<Space style={{ width: '100%', justifyContent: 'flex-end' }}>
					<Button onClick={onClose}>Cancelar</Button>
					<Button type="primary" htmlType="submit" loading={loading}>
						Registrar Cliente
					</Button>
				</Space>
			</Form>
		</Modal>
	)
}

export default ModalNuevoCliente

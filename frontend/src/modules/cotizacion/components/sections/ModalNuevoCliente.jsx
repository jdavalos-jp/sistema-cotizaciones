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
			message.success('Cliente creado exitosamente')
			form.resetFields()
			onSuccess(responseData.data)
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
					rules={[{ required: true, message: 'Por favor ingresa el nombre' }]}
				>
					<Input prefix={<UserOutlined />} placeholder="Nombre completo" />
				</Form.Item>

				<Row gutter={16}>
					<Col span={12}>
						<Form.Item
							label="Correo electrónico"
							name="correo"
							rules={[
								{ required: true, message: 'Por favor ingresa el correo' },
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
							rules={[{ required: true, message: 'Por favor ingresa el teléfono' }]}
						>
							<Input prefix={<PhoneOutlined />} placeholder="Número de teléfono" />
						</Form.Item>
					</Col>
				</Row>

				<Form.Item
					label="Dirección"
					name="direccion"
					rules={[{ required: true, message: 'Por favor ingresa la dirección' }]}
				>
					<Input prefix={<EnvironmentOutlined />} placeholder="Dirección completa" />
				</Form.Item>

				<Row gutter={16}>
					<Col span={12}>
						<Form.Item
							label="Ciudad"
							name="ciudad"
							rules={[{ required: true, message: 'Por favor ingresa la ciudad' }]}
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
					label="Observaciones"
					name="observaciones"
				>
					<Input.TextArea placeholder="Notas adicionales (opcional)" rows={3} />
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
import React, { useState } from 'react'
import { Modal, Form, Input, Button, Space, message } from 'antd'
import { UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons'

export default function ModalNuevoCliente({ visible, onClose, onSuccess }) {
	const [form] = Form.useForm()
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (values) => {
		setLoading(true)
		try {
			// Aquí iría la llamada a tu API para crear cliente
			// const response = await createCliente(values)
			message.success('Cliente creado exitosamente')
			form.resetFields()
			onSuccess(values)
			onClose()
		} catch (err) {
			message.error('Error al crear cliente')
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

				<Form.Item
					label="Teléfono"
					name="telefono"
					rules={[{ required: true, message: 'Por favor ingresa el teléfono' }]}
				>
					<Input prefix={<PhoneOutlined />} placeholder="Número de teléfono" />
				</Form.Item>

				<Form.Item
					label="Dirección"
					name="direccion"
					rules={[{ required: true, message: 'Por favor ingresa la dirección' }]}
				>
					<Input prefix={<EnvironmentOutlined />} placeholder="Dirección completa" />
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

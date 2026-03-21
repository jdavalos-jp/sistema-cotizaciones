import React from 'react'
import { AutoComplete, Button, Card, Space, Typography } from 'antd'
import { UserOutlined, FileAddOutlined ,PlusOutlined} from '@ant-design/icons'

export default function ClienteDatosSection({
	clientes,
	idCliente,
	setIdCliente,
	clienteLabel,
	setClienteLabel,
	onNewCliente,
}) {
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
			<Space direction="vertical" style={{ width: '100%' }} size={8}>
				<Typography.Text type="secondary">Seleccionar cliente *</Typography.Text>
				<AutoComplete
					style={{ width: '100%' }}
					value={clientes.search}
					options={clientes.options}
					placeholder="Buscar cliente..."
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
					allowClear
				/>
				<Typography.Text type="secondary" style={{ fontSize: '12px' }}>
					Escribe al menos 2 caracteres o crea uno nuevo
				</Typography.Text>
			</Space>
		</Card>
	)
}

import React, { useMemo } from 'react'
import { Card, Table, Button, Space, Typography, Empty, Row, Col, Statistic } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'

export default function ProductosSeleccionadosTable({
	lineas = [],
	moneda = 'Bs',
	onRemove = () => {},
	onSetCantidad = () => {},
}) {
	const total = useMemo(() => {
		return lineas.reduce((acc, l) => acc + (Number(l.totalLinea) || 0), 0)
	}, [lineas])

	const daysTotal = useMemo(() => {
		const uniqueDays = new Set(lineas.map((l) => l.dias).filter(Boolean))
		return uniqueDays.size > 0 ? Array.from(uniqueDays)[0] : 1
	}, [lineas])

	const columns = [
		{
			title: 'PRODUCTO',
			dataIndex: 'nombre',
			key: 'nombre',
			render: (text) => <Typography.Text>{text}</Typography.Text>,
		},
		{
			title: `PRECIO/DÍA (${moneda})`,
			dataIndex: 'precioUnitario',
			key: 'precioUnitario',
			align: 'right',
			width: 120,
			render: (price) => <Typography.Text>{Number(price || 0).toFixed(2)}</Typography.Text>,
		},
		{
			title: 'DÍAS',
			dataIndex: 'dias',
			key: 'dias',
			align: 'center',
			width: 60,
			render: (dias) => <Typography.Text strong>{dias || 1}</Typography.Text>,
		},
		{
			title: 'CANTIDAD',
			dataIndex: 'cantidad',
			key: 'cantidad',
			align: 'center',
			width: 80,
			render: (cantidad, record) => (
				<input
					type="number"
					min="1"
					value={cantidad}
					onChange={(e) =>
						onSetCantidad(record.tipo, String(record.id), Math.max(1, Number(e.target.value) || 1))
					}
					style={{
						width: '100%',
						textAlign: 'center',
						padding: '4px',
						border: '1px solid #d9d9d9',
						borderRadius: '4px',
					}}
				/>
			),
		},
		{
			title: 'STOCK',
			dataIndex: 'stock',
			key: 'stock',
			align: 'center',
			width: 60,
			render: (stock) => (
				<Typography.Text strong style={{ color: stock > 0 ? '#52c41a' : '#ff4d4f' }}>
					{stock || 0}
				</Typography.Text>
			),
		},
		{
			title: `TOTAL (${moneda})`,
			dataIndex: 'totalLinea',
			key: 'totalLinea',
			align: 'right',
			width: 100,
			render: (total) => (
				<Typography.Text strong style={{ color: '#1890ff' }}>
					{Number(total || 0).toFixed(2)}
				</Typography.Text>
			),
		},
		{
			title: 'ACCIÓN',
			key: 'action',
			align: 'center',
			width: 70,
			render: (_, record) => (
				<Button
					type="text"
					danger
					size="small"
					icon={<DeleteOutlined />}
					onClick={() => onRemove(record.tipo, String(record.id))}
				/>
			),
		},
	]

	return (
		<Card
			title={
				<Space>
					<Typography.Title level={5} style={{ margin: 0 }}>
						Productos Seleccionados
					</Typography.Title>
					<Typography.Text type="secondary">({lineas.length} item{lineas.length !== 1 ? 's' : ''})</Typography.Text>
				</Space>
			}
		>
			{lineas.length === 0 ? (
				<Empty description="Sin productos seleccionados" style={{ marginTop: 20 }} />
			) : (
				<>
					<Table
						columns={columns}
						dataSource={lineas.map((l, idx) => ({
							...l,
							key: `${l.tipo}:${l.id}`,
						}))}
						pagination={false}
						size="small"
					/>
					<Row justify="end" style={{ marginTop: 16 }} gutter={[16, 16]}>
						<Col xs={24} md={6}>
							<Statistic
								title={`Total 1 día de ${daysTotal} (${moneda})`}
								value={total.toFixed(2)}
								valueStyle={{ color: '#389e0d', fontSize: '20px', fontWeight: 'bold' }}
							/>
						</Col>
					</Row>
				</>
			)}
		</Card>
	)
}

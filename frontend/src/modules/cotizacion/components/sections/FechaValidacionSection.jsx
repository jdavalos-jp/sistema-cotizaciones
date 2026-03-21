import React from 'react'
import { Card, DatePicker, Row, Col, Typography, Space } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

export default function FechaValidacionSection({ fechaInicio, setFechaInicio, fechaFin, setFechaFin }) {
	return (
		<Card
			title={
				<Space>
					<CalendarOutlined />
					<span>Fechas de Validación</span>
				</Space>
			}
		>
			<Row gutter={[16, 16]}>
				<Col xs={24} md={12}>
					<Typography.Text type="secondary">Fecha de Inicio *</Typography.Text>
					<DatePicker
						style={{ width: '100%', marginTop: 8 }}
						value={fechaInicio ? dayjs(fechaInicio) : null}
						onChange={(date) => setFechaInicio(date ? date.toDate() : null)}
						placeholder="Selecciona fecha de inicio"
					/>
				</Col>

				<Col xs={24} md={12}>
					<Typography.Text type="secondary">Fecha de Fin *</Typography.Text>
					<DatePicker
						style={{ width: '100%', marginTop: 8 }}
						value={fechaFin ? dayjs(fechaFin) : null}
						onChange={(date) => setFechaFin(date ? date.toDate() : null)}
						placeholder="Selecciona fecha de fin"
						disabledDate={(current) => {
							if (!fechaInicio) return false
							return current && current < dayjs(fechaInicio)
						}}
					/>
				</Col>

				{fechaInicio && fechaFin && (
					<Col xs={24}>
						<Typography.Text type="secondary">Validez de la cotización:</Typography.Text>
						<div style={{ marginTop: 8 }}>
							<Typography.Text>
								{dayjs(fechaInicio).format('DD/MM/YYYY')} → {dayjs(fechaFin).format('DD/MM/YYYY')} (
								{dayjs(fechaFin).diff(fechaInicio, 'days')} días)
							</Typography.Text>
						</div>
					</Col>
				)}
			</Row>
		</Card>
	)
}

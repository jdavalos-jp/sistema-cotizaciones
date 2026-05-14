import React, { useMemo } from 'react'
import { Card, InputNumber, Row, Col, Typography, Space } from 'antd'
import { CalendarOutlined, CarOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

/**
 * Sección de fechas y días de entrega para una cotización.
 *
 * Correcciones respecto a la versión original:
 * - Date nativo eliminado: todo el manejo de fechas usa dayjs (evita bugs de timezone)
 * - Bug de timezone corregido: ya no se concatena 'T00:00:00' a strings de fecha
 * - diasValidez/diasEntrega null controlado: InputNumber nunca propaga null al estado padre
 * - Fechas calculadas no se muestran si los días son null (en lugar de mostrar fecha inválida)
 * - Emojis reemplazados por iconos de antd (renderizado consistente en todos los OS)
 * - CampoDisplay extraído para eliminar estilos inline duplicados
 * - Alias fechaEmision: fechaEmisionProp eliminado — nombre directo en la firma
 */

/**
 * Campo de solo lectura con fondo de color para valores calculados o fijos.
 * @param {'neutral'|'info'} variant - neutral = gris, info = azul claro
 */
function CampoDisplay({ label, value, variant = 'neutral' }) {
  const bgColor = variant === 'info' ? '#f0f7ff' : '#fafafa'

  return (
    <div>
      <Typography.Text type="secondary">{label}</Typography.Text>
      <div
        style={{
          marginTop: 8,
          padding: '8px 12px',
          backgroundColor: bgColor,
          border: '1px solid #f0f0f0',
          borderRadius: 6,
        }}
      >
        <Typography.Text strong>{value}</Typography.Text>
      </div>
    </div>
  )
}

function FechaValidacionSection({
  diasValidez,
  setDiasValidez,
  diasEntrega,
  setDiasEntrega,
  fechaEmision,
}) {
  // Fecha de inicio: usar fechaEmision si es válida (modo edición) o hoy (modo nuevo)
  // Todo en dayjs para evitar bugs de timezone con Date nativo
  const fechaInicio = useMemo(() => {
    if (fechaEmision) {
      const parsed = dayjs(fechaEmision)
      if (parsed.isValid()) return parsed
    }
    return dayjs()
  }, [fechaEmision])

  // Fecha de validez calculada — solo si diasValidez es un número válido
  const fechaValidez = useMemo(() => {
    if (!diasValidez || diasValidez < 1) return null
    return fechaInicio.add(diasValidez, 'day')
  }, [diasValidez, fechaInicio])

  // Guard de null: InputNumber puede llamar onChange con null si el usuario borra el campo
  const handleDiasValidezChange = (v) => setDiasValidez(v ?? 1)
  const handleDiasEntregaChange = (v) => setDiasEntrega(v ?? 1)

  const inicioFormateado = fechaInicio.format('DD/MM/YYYY')
  const validezFormateada = fechaValidez ? fechaValidez.format('DD/MM/YYYY') : '—'

  return (
    <Card
      variant="borderless"
      style={{
        borderRadius: 8,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
      styles={{
        header: { padding: '16px 24px', borderBottom: '1px solid #f0f0f0' },
        body: { padding: 24 },
      }}
      title={
        <Space>
          <CalendarOutlined />
          <span>Fechas y Entrega</span>
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <CampoDisplay
            label="Fecha Inicio"
            value={inicioFormateado}
            variant="neutral"
          />
        </Col>

        <Col xs={24} md={12}>
          <Typography.Text type="secondary">Días de Validez *</Typography.Text>
          <InputNumber
            style={{ width: '100%', marginTop: 8 }}
            value={diasValidez}
            onChange={handleDiasValidezChange}
            min={1}
            max={365}
            placeholder="Ej: 10"
          />
        </Col>

        <Col xs={24} md={12}>
          <CampoDisplay
            label="Fecha Validez (Calculada)"
            value={validezFormateada}
            variant="info"
          />
        </Col>

        <Col xs={24} md={12}>
          <Typography.Text type="secondary">Días de Entrega *</Typography.Text>
          <InputNumber
            style={{ width: '100%', marginTop: 8 }}
            value={diasEntrega}
            onChange={handleDiasEntregaChange}
            min={1}
            max={30}
            placeholder="Ej: 5"
          />
        </Col>

        {/* Resumen — solo visible cuando ambos valores están completos */}
        {fechaValidez && diasEntrega && (
          <Col xs={24}>
            <div
              style={{
                backgroundColor: '#fafafa',
                padding: 12,
                borderRadius: 6,
                border: '1px solid #f0f0f0',
              }}
            >
              <Typography.Text type="secondary">Resumen</Typography.Text>
              <div style={{ marginTop: 8 }}>
                <Space>
                  <CalendarOutlined />
                  <Typography.Text>
                    Inicio: {inicioFormateado} / Validez: {validezFormateada} ({diasValidez} días)
                  </Typography.Text>
                </Space>
              </div>
              <div style={{ marginTop: 6 }}>
                <Space>
                  <CarOutlined />
                  <Typography.Text>
                    Entrega: {diasEntrega} días hábiles
                  </Typography.Text>
                </Space>
              </div>
            </div>
          </Col>
        )}
      </Row>
    </Card>
  )
}

export default FechaValidacionSection

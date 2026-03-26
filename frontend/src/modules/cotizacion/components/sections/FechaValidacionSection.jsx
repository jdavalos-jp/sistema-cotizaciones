import React, { useMemo } from 'react';
import { Card, InputNumber, Row, Col, Typography, Space } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

function FechaValidacionSection({ diasValidez, setDiasValidez, diasEntrega, setDiasEntrega, fechaEmision: fechaEmisionProp }) {
  // Fecha de inicio: usar fechaEmision si viene (edición) o hoy (nueva)
  const fechaInicio = useMemo(() => {
    if (fechaEmisionProp) {
      const d = new Date(fechaEmisionProp);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  }, [fechaEmisionProp]);

  // Fecha de validez calculada automáticamente
  const fechaValidez = useMemo(() => {
    const base = new Date(fechaInicio + 'T00:00:00');
    base.setDate(base.getDate() + (diasValidez || 0));
    return base.toISOString().split('T')[0];
  }, [diasValidez, fechaInicio]);

  return (
    <Card
      title={
        <Space>
          <CalendarOutlined />
          <span>Fechas y Entrega</span>
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        {/* Fecha inicio */}
        <Col xs={24} md={12}>
          <Typography.Text type="secondary">Fecha Inicio (Hoy)</Typography.Text>
          <div style={{ marginTop: 8, padding: '8px 12px', backgroundColor: '#f0f0f0', borderRadius: 4 }}>
            <Typography.Text strong>{dayjs(fechaInicio).format('DD/MM/YYYY')}</Typography.Text>
          </div>
        </Col>

        {/* Días de validez */}
        <Col xs={24} md={12}>
          <Typography.Text type="secondary">Días de Validez *</Typography.Text>
          <InputNumber
            style={{ width: '100%', marginTop: 8 }}
            value={diasValidez}
            onChange={setDiasValidez}
            min={1}
            max={365}
            placeholder="Ej: 10"
          />
        </Col>

        {/* Fecha validez */}
        <Col xs={24} md={12}>
          <Typography.Text type="secondary">Fecha Validez (Calculada)</Typography.Text>
          <div style={{ marginTop: 8, padding: '8px 12px', backgroundColor: '#e6f7ff', borderRadius: 4 }}>
            <Typography.Text strong>{dayjs(fechaValidez).format('DD/MM/YYYY')}</Typography.Text>
          </div>
        </Col>

        {/* Días de entrega */}
        <Col xs={24} md={12}>
          <Typography.Text type="secondary">Días de Entrega *</Typography.Text>
          <InputNumber
            style={{ width: '100%', marginTop: 8 }}
            value={diasEntrega}
            onChange={setDiasEntrega}
            min={1}
            max={30}
            placeholder="Ej: 5"
          />
        </Col>

        {/* Resumen */}
        <Col xs={24}>
          <div style={{ backgroundColor: '#f6ffed', padding: 12, borderRadius: 4, borderLeft: '4px solid #52c41a' }}>
            <Typography.Text type="secondary">Resumen:</Typography.Text>
            <div style={{ marginTop: 8 }}>
              <Typography.Text>
                📅 Inicio: {dayjs(fechaInicio).format('DD/MM/YYYY')} / Validez: {dayjs(fechaValidez).format('DD/MM/YYYY')} ({diasValidez} días)
              </Typography.Text>
            </div>
            <div style={{ marginTop: 4 }}>
              <Typography.Text>🚚 Entrega: {diasEntrega} días hábiles</Typography.Text>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
}

export default FechaValidacionSection;
import React from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Statistic,
  Space,
  Empty,
  Divider,
} from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';

function ClienteDatosSeleccionado({ clienteLabel, clienteData }) {
  if (!clienteLabel) return null;

  return (
    <Card
      title={
        <Space>
          <UserOutlined />
          <span>Datos del Cliente Seleccionado</span>
        </Space>
      }
      style={{ marginTop: 16 }}
    >
      {clienteData ? (
        <Space orientation="vertical" style={{ width: '100%' }} size={16}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Statistic
                title="Nombre"
                value={clienteData.nombre || '-'}
                prefix={<UserOutlined />}
                valueStyle={{ fontSize: '16px', fontWeight: 'normal' }}
              />
            </Col>
            <Col xs={24} md={12}>
              <Statistic
                title="Correo"
                value={clienteData.correo || '-'}
                prefix={<MailOutlined />}
                valueStyle={{ fontSize: '16px', fontWeight: 'normal' }}
              />
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Statistic
                title="Teléfono"
                value={clienteData.telefono || '-'}
                prefix={<PhoneOutlined />}
                valueStyle={{ fontSize: '16px', fontWeight: 'normal' }}
              />
            </Col>
            <Col xs={24} md={12}>
              <Statistic
                title="Dirección"
                value={clienteData.direccion || '-'}
                prefix={<EnvironmentOutlined />}
                valueStyle={{ fontSize: '16px', fontWeight: 'normal' }}
              />
            </Col>
          </Row>

          {clienteData.observaciones && (
            <>
              <Divider style={{ margin: '8px 0' }} />
              <div>
                <Typography.Text type="secondary">Observaciones:</Typography.Text>
                <Typography.Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                  {clienteData.observaciones}
                </Typography.Paragraph>
              </div>
            </>
          )}
        </Space>
      ) : (
        <Empty description="Datos del cliente no disponibles" />
      )}
    </Card>
  );
}

export default ClienteDatosSeleccionado;
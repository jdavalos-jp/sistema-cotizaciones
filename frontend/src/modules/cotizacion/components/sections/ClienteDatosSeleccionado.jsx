import React from 'react'
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Empty,
  Divider,
  Skeleton,
} from 'antd'
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import { safeRender } from '../../../../shared/utils/safeRender'

function CampoCliente({ icon, label, value }) {
  return (
    <div>
      <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
        {label}
      </Typography.Text>
      <div style={{ marginTop: 4 }}>
        <Space size={6}>
          {icon}
          <Typography.Text style={{ fontSize: '15px' }}>
            {value}
          </Typography.Text>
        </Space>
      </div>
    </div>
  )
}

function ClienteDatosSeleccionado({ clienteLabel, clienteData }) {
  // Sin clienteLabel no hay cliente seleccionado — no renderizar nada
  if (!clienteLabel) return null

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
      {/* clienteLabel existe pero clienteData aún no llegó (fetch en vuelo) → Skeleton */}
      {!clienteData ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : (
        <>
          <Row gutter={[16, 20]}>
            <Col xs={24} md={12}>
              <CampoCliente
                icon={<UserOutlined />}
                label="Nombre"
                value={safeRender(clienteData.nombreCompleto)}
              />
            </Col>
            <Col xs={24} md={12}>
              <CampoCliente
                icon={<MailOutlined />}
                label="Correo"
                value={safeRender(clienteData.email)}
              />
            </Col>
            <Col xs={24} md={12}>
              <CampoCliente
                icon={<PhoneOutlined />}
                label="Teléfono"
                value={safeRender(clienteData.telefono)}
              />
            </Col>
            <Col xs={24} md={12}>
              <CampoCliente
                icon={<EnvironmentOutlined />}
                label="Dirección"
                value={safeRender(clienteData.direccion)}
              />
            </Col>
          </Row>

          {clienteData.observaciones && (
            <>
              <Divider style={{ margin: '16px 0 12px' }} />
              <div>
                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                  Observaciones
                </Typography.Text>
                <Typography.Paragraph style={{ marginTop: 6, marginBottom: 0 }}>
                  {clienteData.observaciones}
                </Typography.Paragraph>
              </div>
            </>
          )}
        </>
      )}
    </Card>
  )
}

export default ClienteDatosSeleccionado
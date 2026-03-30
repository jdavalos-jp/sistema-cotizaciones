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

/**
 * Muestra los datos del cliente actualmente seleccionado.
 *
 * Correcciones respecto a la versión original:
 * - Statistic reemplazado por Typography: Statistic es para métricas numéricas, no datos textuales
 * - clienteData.correo corregido a clienteData.email (consistente con la API y ClienteDatosSection)
 * - Guard mejorado: muestra Skeleton mientras clienteLabel existe pero clienteData aún no llegó
 * - Un solo Row en lugar de dos — antd hace el wrap automáticamente con xs={24} md={12}
 * - Space orientation="vertical" eliminado — redundante con el layout de Row/Col
 * - safeRender usado en lugar de || '-' — consistente con el resto del proyecto
 */

/** Campo de dato individual con icono y label */
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
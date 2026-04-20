import { Card, Form, Input, Typography, theme, Space } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import RichTextEditor from '../../../shared/components/RichTextEditor'

const { Text } = Typography

/**
 * CategoriaInfoGeneral
 * Campos básicos: nombre y descripción de la categoría
 */
export default function CategoriaInfoGeneral() {
  const { token } = theme.useToken()

  return (
    <Card
      title={
        <Space>
          <InfoCircleOutlined
            style={{ color: token.colorPrimary, fontSize: 18 }}
          />
          <span>Información General</span>
        </Space>
      }
      size="small"
      style={{
        marginBottom: 0,
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${token.colorBorder}`,
        boxShadow: `0 1px 2px 0 rgba(0, 0, 0, 0.03)`,
      }}
      bodyStyle={{ padding: '16px' }}
    >
      {/* CAMPO: NOMBRE */}
      <Form.Item
        label="Nombre de la Categoría"
        name="nombre"
        rules={[
          { required: true, message: 'Campo requerido' },
          { min: 3, message: 'Mínimo 3 caracteres' },
          { max: 150, message: 'Máximo 150 caracteres' },
        ]}
        style={{ marginBottom: 16 }}
      >
        <Input
          placeholder="Ej. Electrónicos"
          maxLength={150}
          allowClear
          size="large"
        />
      </Form.Item>

      {/* CAMPO: DESCRIPCIÓN */}
      <Form.Item
        label="Descripción"
        name="descripcion"
        rules={[
          { required: true, message: 'Campo requerido' },
        ]}
        style={{ marginBottom: 0 }}
      >
        <RichTextEditor placeholder="Describe la categoría..." />
      </Form.Item>
    </Card>
  )
}

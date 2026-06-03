import { Card, Form, Input, theme } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import RichTextEditor from '../../../shared/components/RichTextEditor'

export default function ProductoInfoGeneral() {
  const { token } = theme.useToken()

  return (
    <Card
      title={
        <span>
          <InfoCircleOutlined style={{ color: token.colorPrimary, marginRight: 8, fontSize: 18 }} />
          Informacion General
        </span>
      }
      size="small"
      style={{
        marginBottom: 0,
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${token.colorBorder}`,
        boxShadow: `0 2px 8px ${token.colorBorder}`,
      }}
    >
      <Form.Item
        label="Nombre del producto"
        name="nombre"
        rules={[
          { required: true, message: 'Campo requerido' },
          { min: 2, message: 'Minimo 2 caracteres' },
          { max: 200, message: 'Maximo 200 caracteres' },
        ]}
      >
        <Input placeholder="Ej. Reloj Inteligente Serie 5" maxLength={200} allowClear />
      </Form.Item>

      <Form.Item
        label="Descripcion"
        name="descripcion"
        rules={[{ max: 1000, message: 'Maximo 1000 caracteres' }]}
      >
        <RichTextEditor
          placeholder="Describe las caracteristicas principales, beneficios y materiales..."
          maxLength={1000}
        />
      </Form.Item>
    </Card>
  )
}

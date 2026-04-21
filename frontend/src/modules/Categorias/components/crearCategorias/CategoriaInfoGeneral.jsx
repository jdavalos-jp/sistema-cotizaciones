import { Card, Form, Input, Typography, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

const { Text } = Typography

/**
 * CategoriaInfoGeneral
 * Campos: nombre, descripción, y subcategorías
 */
export default function CategoriaInfoGeneral({ form }) {
  const nombreValue = Form.useWatch('nombre', form) || ''
  const descValue = Form.useWatch('descripcion', form) || ''

  return (
    <Card
      title={<span style={{ fontWeight: 600, fontSize: 16 }}>Información General</span>}
      style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', height: '100%' }}
      bodyStyle={{ padding: '24px 32px' }}
    >
      <Form.Item
        label={<span style={{ fontWeight: 500 }}>Nombre de la Categoría</span>}
        name="nombre"
        rules={[
          { required: true, message: 'Campo requerido' },
          { min: 3, message: 'Mínimo 3 caracteres' },
          { max: 40, message: 'Máximo 40 caracteres' },
        ]}
      >
        <Input
          placeholder="Ej: Electrónicos"
          maxLength={40}
          size="large"
          suffix={<Text type="secondary" style={{ fontSize: 12 }}>{nombreValue.length} / 40</Text>}
          style={{ borderRadius: 8 }}
        />
      </Form.Item>

      <Form.Item
        label={<span style={{ fontWeight: 500 }}>Descripción</span>}
        name="descripcion"
        rules={[
          { required: true, message: 'Campo requerido' },
          { min: 10, message: 'Mínimo 10 caracteres' },
          { max: 200, message: 'Máximo 200 caracteres' }
        ]}
        style={{ marginTop: 24 }}
      >
        <Input.TextArea
          placeholder="Descripción de la categoría... (mínimo 10 caracteres)"
          rows={4}
          maxLength={200}
          showCount
          style={{ borderRadius: 8 }}
        />
      </Form.Item>

      <div style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 8, fontWeight: 500 }}><span style={{ color: '#ff4d4f', marginRight: 4, fontFamily: 'SimSun, sans-serif' }}>*</span>Subcategorías</div>
        <Button 
          type="dashed" 
          block 
          icon={<PlusOutlined />} 
          style={{ height: 48, borderRadius: 8, color: '#8c8c8c' }}
        >
          Agregar Subcategoría
        </Button>
      </div>
    </Card>
  )
}

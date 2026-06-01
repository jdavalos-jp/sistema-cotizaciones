import { Card, Form, Input, Typography, Button, Space, Divider } from 'antd'
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'

const { Text } = Typography

export default function CategoriaInfoGeneral() {
  return (
    <Card
      title="Información general"
      variant="borderless"
      style={{ borderRadius: 8, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)' }}
      styles={{ body: { padding: 24 } }}
    >
      <Form.Item
        label="Nombre de la categoría"
        name="nombre"
        tooltip="Este nombre será visible en productos y componentes."
        normalize={(value) => value?.replace(/\s+/g, ' ')}
        rules={[
          { required: true, message: 'Ingresa un nombre' },
          { min: 3, message: 'Mínimo 3 caracteres' },
          { max: 150, message: 'Máximo 150 caracteres' },
        ]}
      >
        <Input placeholder="Ej: Suelos de laboratorio" maxLength={150} showCount />
      </Form.Item>

      <Form.Item
        label={
          <Space>
            <span>Descripción</span>
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 'normal' }}>
              (Opcional)
            </Text>
          </Space>
        }
        name="descripcion"
        tooltip="Describe brevemente el alcance de esta categoría."
        normalize={(value) => value?.replace(/\s+/g, ' ')}
        rules={[
          {
            validator: async (_, value) => {
              const text = String(value || '').trim()
              if (text && text.length < 10) {
                throw new Error('Si ingresas una descripción, debe tener al menos 10 caracteres')
              }
            },
          },
          { max: 255, message: 'Máximo 255 caracteres' },
        ]}
      >
        <Input.TextArea
          placeholder="Describe la categoría..."
          rows={4}
          maxLength={255}
          showCount
        />
      </Form.Item>

      <Divider />

      <div>
        <Space style={{ marginBottom: 12 }}>
          <Text strong>Subcategorías</Text>
          <Text type="secondary">(Opcional)</Text>
        </Space>

        <Form.List name="subcategorias">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <Form.Item {...restField} name={[name, 'idSubcategoria']} hidden>
                    <Input />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, 'nombre']}
                    normalize={(value) => value?.replace(/\s+/g, ' ')}
                    rules={[
                      { required: true, message: 'Ingresa un nombre' },
                      { min: 2, message: 'Mínimo 2 caracteres' },
                      { max: 150, message: 'Máximo 150 caracteres' },
                    ]}
                    style={{ flex: 1, marginBottom: 0 }}
                  >
                    <Input placeholder="Ej: Ensayos de compactación" allowClear maxLength={150} />
                  </Form.Item>

                  <Button
                    danger
                    type="text"
                    aria-label="Quitar subcategoría"
                    icon={<MinusCircleOutlined />}
                    onClick={() => remove(name)}
                    style={{ height: 32 }}
                  />
                </div>
              ))}

              <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                Agregar subcategoría
              </Button>
            </>
          )}
        </Form.List>
      </div>
    </Card>
  )
}

import { Card, Form, Input, Typography, Button, Space, Divider } from 'antd'
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'

const { Text } = Typography

export default function CategoriaInfoGeneral({ form }) {
  const nombreValue = Form.useWatch('nombre', form) || ''
  const descValue = Form.useWatch('descripcion', form) || ''

  return (
    <Card
      title="Información General"
      variant="borderless"
      styles={{
        body: { padding: 24 }
      }}
    >
      {/* Nombre */}
      <Form.Item
        label="Nombre de la Categoría"
        name="nombre"
        tooltip="Este nombre será visible para los usuarios"
        rules={[
          { required: true, message: 'Ingresa un nombre' },
          { min: 3, message: 'Mínimo 3 caracteres' },
          { max: 40, message: 'Máximo 40 caracteres' },
        ]}
      >
        <Input
          placeholder="SUELOS DE LABORATORIO"
          maxLength={40}
          showCount
        />
      </Form.Item>

            {/* Descripción */}
      <Form.Item
        label={
          <Space>
            <span>Descripción</span>
            <Text type="secondary" style={{ fontSize: '12px', fontWeight: 'normal' }}>(Opcional)</Text>
          </Space>
        }
        name="descripcion"
        tooltip="Describe brevemente esta categoría"
        rules={[
          {
            validator: async (_, value) => {
              if (value && value.trim().length > 0 && value.trim().length < 10) {
                return Promise.reject(new Error('Si ingresas una descripción, debe tener al menos 10 caracteres'));
              }
              return Promise.resolve();
            }
          },
          { max: 200, message: 'Máximo 200 caracteres' }
        ]}
      >
        <Input.TextArea
          placeholder="Describe la categoría..."
          rows={4}
          maxLength={200}
          showCount
        />
      </Form.Item>

      <Divider />

      {/* Subcategorías */}
      <div>
        <Space style={{ marginBottom: 8 }}>
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
                    gap: '8px', // Espacio entre input y botón borrar
                    marginBottom: 12
                  }}
                >
                  {/* Este campo ID oculto es crucial para que el Backend sepa si debe actualizar o crear */}
                  <Form.Item
                    {...restField}
                    name={[name, 'idSubcategoria']}
                    hidden
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, 'nombre']}
                    rules={[
                      { required: true, message: 'Ingresa un nombre' },
                      { min: 2, message: 'Muy corto' }
                    ]}
                    style={{ flex: 1, marginBottom: 0 }} // flex: 1 hace que crezca todo lo posible
                  >
                    <Input
                      placeholder="Ej: Smartphones"
                      allowClear
                      maxLength={40}
                    />
                  </Form.Item>

                  <Button
                    danger
                    type="text"
                    icon={<MinusCircleOutlined />}
                    onClick={() => remove(name)}
                    style={{ height: '32px' }} // Alineación visual con el input
                  />
                </div>
              ))}

              <Button
                type="dashed"
                onClick={() => add()}
                icon={<PlusOutlined />}
                block
              >
                Agregar subcategoría
              </Button>
            </>
          )}
        </Form.List>
      </div>
    </Card>
  )
}
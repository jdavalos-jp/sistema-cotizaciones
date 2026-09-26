import { useEffect, useState } from 'react'
import { Alert, Button, Col, Form, Input, Row, Select, Space } from 'antd'
import { CloseOutlined, SaveOutlined, UserAddOutlined } from '@ant-design/icons'
import { useClienteOptions } from '../hooks/useClienteOptions.js'
import NuevoClienteModal from './NuevoClienteModal.jsx'

const EMPTY_VALUES = {
  clienteId: undefined,
  nombre: '',
  cargo: '',
  correo: '',
  telefono: '',
  ciudad: '',
}

function clienteToRotulo(cliente) {
  return {
    clienteId: String(cliente.idCliente),
    nombre: cliente.nombreCompleto || '',
    cargo: cliente.cargo || '',
    correo: cliente.email || '',
    telefono: cliente.telefono || '',
    ciudad: cliente.ciudad || '',
  }
}

export default function RotuloForm({ editingRotulo, onCancel, onChange, onSave }) {
  const [form] = Form.useForm()
  const [newClientOpen, setNewClientOpen] = useState(false)
  const { clientes, loading, error, setSearch, addCliente } = useClienteOptions()

  useEffect(() => {
    const values = editingRotulo || EMPTY_VALUES
    form.setFieldsValue(values)
    onChange(values)
  }, [editingRotulo, form, onChange])

  const selectCliente = (cliente) => {
    const values = clienteToRotulo(cliente)
    form.setFieldsValue(values)
    onChange(values)
  }

  const handleClienteChange = (clienteId) => {
    const cliente = clientes.find((item) => String(item.idCliente) === String(clienteId))
    if (cliente) selectCliente(cliente)
  }

  const handleClienteCreated = (cliente) => {
    addCliente(cliente)
    selectCliente(cliente)
  }

  const handleFinish = (values) => {
    const normalized = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
    )
    onSave(normalized)
    form.resetFields()
    onChange(EMPTY_VALUES)
  }

  const options = clientes.map((cliente) => ({
    value: String(cliente.idCliente),
    label: `${cliente.nombreCompleto}${cliente.institucion ? ` - ${cliente.institucion}` : ''}`,
  }))

  if (editingRotulo?.clienteId && !options.some((option) => option.value === String(editingRotulo.clienteId))) {
    options.unshift({ value: String(editingRotulo.clienteId), label: editingRotulo.nombre })
  }

  return (
    <>
      <Form form={form} layout="vertical" requiredMark={false} autoComplete="off" onFinish={handleFinish}>
        <div className="rotulo-client-picker">
          <Form.Item
            className="rotulo-client-picker__select"
            label="Buscar cliente registrado"
            name="clienteId"
            rules={[{ required: true, message: 'Selecciona un cliente' }]}
          >
            <Select
              showSearch
              filterOption={false}
              loading={loading}
              options={options}
              onSearch={setSearch}
              onChange={handleClienteChange}
              placeholder="Escribe el nombre, correo, teléfono o institución"
              notFoundContent={loading ? 'Buscando clientes...' : 'No se encontraron clientes'}
            />
          </Form.Item>
          <Button icon={<UserAddOutlined />} onClick={() => setNewClientOpen(true)}>
            Nuevo cliente
          </Button>
        </div>

        {error && (
          <Alert
            showIcon
            type="error"
            message="No se pudieron cargar los clientes"
            description={error.message}
            className="rotulo-client-picker__error"
          />
        )}

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Nombre" name="nombre">
              <Input disabled placeholder="Se completará al seleccionar un cliente" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Cargo" name="cargo">
              <Input disabled placeholder="Sin cargo registrado" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Correo" name="correo">
              <Input disabled placeholder="Sin correo registrado" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Teléfono" name="telefono">
              <Input disabled placeholder="Sin teléfono registrado" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Ciudad" name="ciudad">
              <Input disabled placeholder="Sin ciudad registrada" />
            </Form.Item>
          </Col>
        </Row>

        <Space className="rotulo-form__actions" wrap>
          {editingRotulo && (
            <Button icon={<CloseOutlined />} onClick={onCancel}>
              Cancelar edición
            </Button>
          )}
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
            {editingRotulo ? 'Guardar cambios' : 'Crear rótulo'}
          </Button>
        </Space>
      </Form>

      <NuevoClienteModal
        open={newClientOpen}
        onClose={() => setNewClientOpen(false)}
        onCreated={handleClienteCreated}
      />
    </>
  )
}

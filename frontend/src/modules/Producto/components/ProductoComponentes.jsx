import React, { useState, useEffect } from 'react'
import {
  Button,
  Card,
  Form,
  InputNumber,
  Input,
  Table,
  Select,
  Space,
  message,
  Empty,
  theme,
  Typography,
} from 'antd'
import { DeleteOutlined, PlusOutlined, ToolOutlined } from '@ant-design/icons'
import * as componentesApi from '../Services/api/componentesApi'

const { Text } = Typography

export default function ProductoComponentes({
  componentesAgregados = [],
  onAgregarComponente,
  onEliminarComponente,
}) {
  const { token } = theme.useToken()
  const [form] = Form.useForm()
  const [componentes, setComponentes] = useState([])
  const [loadingComponentes, setLoadingComponentes] = useState(false)

  // Cargar lista de componentes disponibles
  useEffect(() => {
    const cargarComponentes = async () => {
      setLoadingComponentes(true)
      try {
        const res = await componentesApi.getComponentes()
        const list = Array.isArray(res) ? res : res?.data
        const options = Array.isArray(list)
          ? list.map((c) => ({
              value: c.idComponente,
              label: `${c.nombre} (${c.sku || 'N/A'})`,
              ...c,
            }))
          : []
        setComponentes(options)
      } catch (err) {
        message.error('Error cargando componentes')
        console.error(err)
      } finally {
        setLoadingComponentes(false)
      }
    }
    cargarComponentes()
  }, [])

  const handleAgregarComponente = async () => {
    try {
      const values = await form.validateFields()
      const componenteSeleccionado = componentes.find((c) => c.value === values.idComponente)

      if (!componenteSeleccionado) {
        message.error('Componente no encontrado')
        return
      }

      // Verificar si ya existe
      if (componentesAgregados.some((c) => c.idComponente === values.idComponente)) {
        message.warning('Este componente ya fue agregado')
        return
      }

      const nuevoComponente = {
        idComponente: values.idComponente,
        nombre: componenteSeleccionado.nombre,
        sku: componenteSeleccionado.sku,
        precioBase: componenteSeleccionado.precio_base,
        cantidad: values.cantidad || 1,
      }

      onAgregarComponente(nuevoComponente)
      form.resetFields()
      message.success('Componente agregado')
    } catch (err) {
      console.error(err)
    }
  }

  const columns = [
    {
      title: 'Componente',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            SKU: {record.sku || 'N/A'}
          </Text>
        </div>
      ),
      width: 200,
    },
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
      key: 'cantidad',
      align: 'center',
      width: 100,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Precio Base',
      dataIndex: 'precioBase',
      key: 'precioBase',
      align: 'right',
      width: 120,
      render: (text) => `$${text || 0}`,
    },
    {
      title: 'Acción',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => {
            onEliminarComponente(record.idComponente)
            message.success('Componente eliminado')
          }}
        />
      ),
    },
  ]

  return (
    <Card
      title={
        <span>
          <ToolOutlined style={{ color: token.colorPrimary, marginRight: 8, fontSize: 18 }} />
          Componentes del Producto
        </span>
      }
      size="small"
      style={{
        marginTop: 0,
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${token.colorBorder}`,
        boxShadow: `0 2px 8px ${token.colorBorder}`,
      }}
    >
      {/* Formulario para agregar componentes */}
      <div style={{ marginBottom: 24, padding: token.paddingSM, background: token.colorBgElevated, borderRadius: token.borderRadiusLG }}>
        <Form form={form} layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12 }}>
            <Form.Item
              label="Seleccionar Componente"
              name="idComponente"
              rules={[{ required: true, message: 'Selecciona un componente' }]}
            >
              <Select
                placeholder="Buscar componente..."
                loading={loadingComponentes}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) => {
                  const q = String(input || '').toLowerCase().trim()
                  const label = String(option?.label || '').toLowerCase()
                  const nombre = String(option?.nombre || '').toLowerCase()
                  const sku = String(option?.sku || '').toLowerCase()
                  return label.includes(q) || nombre.includes(q) || sku.includes(q)
                }}
                options={componentes}
              />
            </Form.Item>

            <Form.Item label="Cantidad" name="cantidad" initialValue={1}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item label=" ">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAgregarComponente}
                loading={loadingComponentes}
                block
              >
                Agregar
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>

      {/* Tabla de componentes agregados */}
      {componentesAgregados.length > 0 ? (
        <Table
          columns={columns}
          dataSource={componentesAgregados.map((c) => ({
            ...c,
            key: c.idComponente, // ✅ Use stable ID instead of index
          }))}
          pagination={false}
          size="middle"
          bordered
          style={{ marginTop: token.marginMD }}
          rowClassName={(_, index) => index % 2 === 0 ? 'ant-table-row-light' : ''}
        />
      ) : (
        <Empty description="Sin componentes agregados" />
      )}
    </Card>
  )
}

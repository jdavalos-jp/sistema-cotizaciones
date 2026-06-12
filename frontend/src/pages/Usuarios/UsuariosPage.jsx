import { useEffect, useState } from 'react'
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd'
import { EditOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons'
import { apiDelete, apiGet, apiPost, apiPut } from '../../services/api/http.js'

const { Title } = Typography

const emptyUser = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  password: '',
  rol: 'vendedor',
  estado: 'activo',
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  const loadUsuarios = async () => {
    setLoading(true)
    try {
      const response = await apiGet('/usuarios')
      setUsuarios(response.data || [])
    } catch (err) {
      message.error(err.message || 'No se pudieron cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsuarios()
  }, [])

  const openCreate = () => {
    setEditingUser(null)
    form.setFieldsValue(emptyUser)
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditingUser(record)
    form.setFieldsValue({ ...record, password: '' })
    setModalOpen(true)
  }

  const handleSubmit = async (values) => {
    setSaving(true)
    try {
      const payload = { ...values }
      if (editingUser && !payload.password) delete payload.password

      if (editingUser) {
        await apiPut(`/usuarios/${editingUser.idUsuario}`, payload)
        message.success('Usuario actualizado')
      } else {
        await apiPost('/usuarios', payload)
        message.success('Usuario creado')
      }

      setModalOpen(false)
      await loadUsuarios()
    } catch (err) {
      message.error(err.message || 'No se pudo guardar el usuario')
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (record) => {
    try {
      await apiDelete(`/usuarios/${record.idUsuario}`)
      message.success('Usuario desactivado')
      await loadUsuarios()
    } catch (err) {
      message.error(err.message || 'No se pudo desactivar el usuario')
    }
  }

  const columns = [
      {
        title: 'Nombre',
        dataIndex: 'nombre',
        key: 'nombre',
        render: (value, record) => [value, record.apellido].filter(Boolean).join(' '),
      },
      {
        title: 'Correo',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: 'Rol',
        dataIndex: 'rol',
        key: 'rol',
        render: (rol) => <Tag color={rol === 'administrador' ? 'blue' : 'green'}>{rol}</Tag>,
      },
      {
        title: 'Estado',
        dataIndex: 'estado',
        key: 'estado',
        render: (estado) => <Tag color={estado === 'activo' ? 'success' : 'default'}>{estado}</Tag>,
      },
      {
        title: 'Acciones',
        key: 'actions',
        align: 'right',
        render: (_, record) => (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => openEdit(record)}>
              Editar
            </Button>
            <Popconfirm
              title="Desactivar usuario"
              description="El usuario ya no podra iniciar sesion."
              okText="Desactivar"
              cancelText="Cancelar"
              onConfirm={() => handleDeactivate(record)}
            >
              <Button danger icon={<StopOutlined />} disabled={record.estado === 'inactivo'}>
                Desactivar
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ]

  return (
    <>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 18 }}>
        <Title level={2} style={{ margin: 0 }}>
          Usuarios
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Nuevo usuario
        </Button>
      </Space>

      <Table
        rowKey="idUsuario"
        columns={columns}
        dataSource={usuarios}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingUser ? 'Editar usuario' : 'Nuevo usuario'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
          <Form.Item
            label="Nombre"
            name="nombre"
            rules={[{ required: true, message: 'Ingresa el nombre' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Apellido" name="apellido">
            <Input />
          </Form.Item>

          <Form.Item
            label="Correo"
            name="email"
            rules={[
              { required: true, message: 'Ingresa el correo' },
              { type: 'email', message: 'Ingresa un correo valido' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Telefono" name="telefono">
            <Input />
          </Form.Item>

          <Form.Item
            label={editingUser ? 'Nueva contrasena' : 'Contrasena'}
            name="password"
            rules={editingUser ? [] : [{ required: true, message: 'Ingresa una contrasena' }]}
          >
            <Input.Password placeholder={editingUser ? 'Dejar vacio para no cambiar' : undefined} />
          </Form.Item>

          <Form.Item
            label="Rol"
            name="rol"
            rules={[{ required: true, message: 'Selecciona un rol' }]}
          >
            <Select
              options={[
                { label: 'Administrador', value: 'administrador' },
                { label: 'Vendedor', value: 'vendedor' },
              ]}
            />
          </Form.Item>

          {editingUser ? (
            <Form.Item label="Estado" name="estado">
              <Select
                options={[
                  { label: 'Activo', value: 'activo' },
                  { label: 'Inactivo', value: 'inactivo' },
                ]}
              />
            </Form.Item>
          ) : null}

          <Button type="primary" htmlType="submit" block loading={saving}>
            Guardar
          </Button>
        </Form>
      </Modal>
    </>
  )
}

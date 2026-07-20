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
import { apiGet, apiPost, apiPut, apiPatch } from '../../services/api/http.js'
import { useIsMobile } from '../../hooks/useIsMobile.js'
import MobileCardList from '../../shared/components/MobileCardList.jsx'
import PageWrapper from '../../shared/components/PageWrapper.jsx'

const { Title, Text } = Typography

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
  const isMobile = useIsMobile()
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
      await apiPatch(`/usuarios/${record.idUsuario}`, { estado: 'inactivo' })
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
              description="El usuario ya no podrá iniciar sesión."
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

  const renderCard = (user) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text strong>
          {[user.nombre, user.apellido].filter(Boolean).join(' ')}
        </Text>
      </div>
      <Text type="secondary" style={{ fontSize: 13 }}>{user.email}</Text>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Tag color={user.rol === 'administrador' ? 'blue' : 'green'}>{user.rol}</Tag>
        <Tag color={user.estado === 'activo' ? 'success' : 'default'}>{user.estado}</Tag>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(user)}>
          Editar
        </Button>
        <Popconfirm
          title="Desactivar usuario"
          description="El usuario ya no podrá iniciar sesión."
          okText="Desactivar"
          cancelText="Cancelar"
          onConfirm={() => handleDeactivate(user)}
        >
          <Button size="small" danger icon={<StopOutlined />} disabled={user.estado === 'inactivo'}>
            Desactivar
          </Button>
        </Popconfirm>
      </div>
    </div>
  )

  return (
    <PageWrapper>
      <Space
        style={{
          width: '100%',
          justifyContent: 'space-between',
          marginBottom: 18,
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: 12,
        }}
      >
        <Title level={isMobile ? 3 : 2} style={{ margin: 0 }}>
          Usuarios
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} block={isMobile}>
          Nuevo usuario
        </Button>
      </Space>

      {isMobile ? (
        <MobileCardList
          data={usuarios}
          loading={loading}
          renderCard={renderCard}
          totalText="usuarios"
        />
      ) : (
        <Table
          rowKey="idUsuario"
          columns={columns}
          dataSource={usuarios}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      )}

      <Modal
        title={editingUser ? 'Editar usuario' : 'Nuevo usuario'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={isMobile ? '95%' : 520}
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
              { type: 'email', message: 'Ingresa un correo válido' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Telefono" name="telefono">
            <Input />
          </Form.Item>

          <Form.Item
            label={editingUser ? 'Nueva contraseña' : 'Contraseña'}
            name="password"
            rules={editingUser ? [] : [{ required: true, message: 'Ingresa una contraseña' }]}
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
    </PageWrapper>
  )
}

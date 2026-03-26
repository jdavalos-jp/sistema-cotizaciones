import React, { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Input,
  Modal,
  message,
} from 'antd'
import {
  EditOutlined,
  SearchOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import FormEditarComponente from './FormEditarComponente'
import { useComponentesList } from '../hooks/useCatalogoManager'

const isNonNullable = (val) => {
  return val !== undefined && val !== null
}

const getTableParams = (params, searchText) => {
  const { pagination, filters, sortField, sortOrder } = params
  const result = {}

  result.skip = ((pagination?.current || 1) - 1) * (pagination?.pageSize || 10)
  result.take = pagination?.pageSize || 10

  if (searchText) {
    result.search = searchText
  }

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (isNonNullable(value)) {
        result[key] = value
      }
    })
  }

  if (sortField) {
    result.sortField = sortField
    result.sortOrder = sortOrder === 'ascend' ? 'asc' : 'desc'
  }

  return result
}

export default function ListaComponentes() {
  const [searchText, setSearchText] = useState('')
  const [editingComponente, setEditingComponente] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const {
    componentes,
    loading,
    pagination,
    loadComponentes,
    updateComponente,
    deleteComponente,
  } = useComponentesList()

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    sortField: null,
    sortOrder: null,
    filters: null,
  })

  // Cargar componentes al montar y cuando cambien los parámetros
  useEffect(() => {
    const params = getTableParams(tableParams, searchText)
    loadComponentes(params)
  }, [tableParams, searchText])

  const handleSearch = (value) => {
    setSearchText(value)
    setTableParams({
      ...tableParams,
      pagination: {
        ...tableParams.pagination,
        current: 1,
      },
    })
  }

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters,
      sortOrder: Array.isArray(sorter) ? null : sorter.order || null,
      sortField: Array.isArray(sorter) ? null : sorter.field || null,
    })
  }

  const handleShowSizeChange = (current, pageSize) => {
    console.log(current, pageSize)
    setTableParams({
      pagination: { current, pageSize },
      filters: tableParams.filters,
      sortOrder: tableParams.sortOrder,
      sortField: tableParams.sortField,
    })
  }

  const handleEdit = (componente) => {
    setEditingComponente(componente)
    setModalVisible(true)
  }

  const handleDelete = async (idComponente) => {
    try {
      await deleteComponente(idComponente)
      message.success('Componente eliminado')
      const params = getTableParams(tableParams, searchText)
      loadComponentes(params)
    } catch (err) {
      message.error('Error al eliminar componente')
    }
  }

  const handleEditSuccess = async (updatedData) => {
    try {
      await updateComponente(editingComponente.idComponente, updatedData)
      message.success('Componente actualizado')
      setModalVisible(false)
      setEditingComponente(null)
      const params = getTableParams(tableParams, searchText)
      loadComponentes(params)
    } catch (err) {
      message.error('Error al actualizar componente')
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'idComponente',
      key: 'idComponente',
      width: 60,
      sorter: true,
      render: (id) => <span style={{ fontWeight: '500' }}>{id}</span>,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 100,
      sorter: true,
      render: (sku) => <span style={{ fontWeight: '500', color: '#666' }}>{sku || '-'}</span>,
    },
    {
      title: 'NOMBRE',
      dataIndex: 'nombre',
      key: 'nombre',
      width: 150,
      sorter: true,
      render: (text) => <span style={{ color: '#0066cc', fontWeight: '500' }}>{text}</span>,
    },
    {
      title: 'DESCRIPCIÓN',
      dataIndex: 'descripcion',
      key: 'descripcion',
      ellipsis: true,
      width: 200,
      render: (text) => <span style={{ fontSize: '13px' }}>{text || '-'}</span>,
    },
    {
      title: 'PRECIO',
      dataIndex: 'precio_base',
      key: 'precio',
      width: 100,
      align: 'right',
      sorter: true,
      render: (price) => <span style={{ fontWeight: '600' }}>${Number(price || 0)}</span>,
    },
    {
      title: 'CANTIDAD',
      dataIndex: 'cantidad',
      key: 'cantidad',
      width: 100,
      align: 'center',
      sorter: true,
      render: (cantidad) => <span style={{ fontWeight: '600' }}>{cantidad}</span>,
    },
    {
      title: 'SUBCATEGORÍA',
      dataIndex: ['subcategoria', 'nombre'],
      key: 'subcategoria',
      width: 150,
      render: (text) => <span style={{ fontWeight: '500' }}>{text || '-'}</span>,
    },
    {
      title: 'ACCIONES',
      key: 'acciones',
      width: 100,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
          style={{ color: '#0066cc' }}
        >
          Editar
        </Button>
      ),
    },
  ]

  return (
    <div>
      <Space orientation="vertical" style={{ width: '100%' }} size={16}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Input
            placeholder="Buscar componentes..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />}>
            Nuevo Componente
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={componentes}
          rowKey="idComponente"
          loading={loading}
          pagination={{
            ...tableParams.pagination,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total) => `Total: ${total} componentes`,
            onShowSizeChange: handleShowSizeChange,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
          style={{
            backgroundColor: '#ffffff',
          }}
          size="middle"
        />
      </Space>

      {/* Modal de Edición */}
      <Modal
        title="Editar Componente"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          setEditingComponente(null)
        }}
        footer={null}
        width={500}
      >
        {editingComponente && (
          <FormEditarComponente
            componente={editingComponente}
            onSuccess={handleEditSuccess}
            onCancel={() => {
              setModalVisible(false)
              setEditingComponente(null)
            }}
          />
        )}
      </Modal>
    </div>
  )
}

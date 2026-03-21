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
import FormEditarProducto from './FormEditarProducto'
import { useProductosList } from '../hooks/useCatalogoManager'

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

export default function ListaProductos() {
  const [searchText, setSearchText] = useState('')
  const [editingProducto, setEditingProducto] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const {
    productos,
    loading,
    pagination,
    loadProductos,
    updateProducto,
    deleteProducto,
  } = useProductosList()

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

  // Cargar productos al montar y cuando cambien los parámetros
  useEffect(() => {
    const params = getTableParams(tableParams, searchText)
    loadProductos(params)
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

  const handleEdit = (producto) => {
    setEditingProducto(producto)
    setModalVisible(true)
  }

  const handleDelete = async (idProducto) => {
    try {
      await deleteProducto(idProducto)
      message.success('Producto eliminado')
      const params = getTableParams(tableParams, searchText)
      loadProductos(params)
    } catch (err) {
      message.error('Error al eliminar producto')
    }
  }

  const handleEditSuccess = async (updatedData) => {
    try {
      await updateProducto(editingProducto.idProducto, updatedData)
      message.success('Producto actualizado')
      setModalVisible(false)
      setEditingProducto(null)
      const params = getTableParams(tableParams, searchText)
      loadProductos(params)
    } catch (err) {
      message.error('Error al actualizar producto')
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'idProducto',
      key: 'idProducto',
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
      key: 'precio_base',
      width: 100,
      align: 'right',
      sorter: true,
      render: (price) => <span style={{ fontWeight: '600' }}>${parseFloat(price || 0).toFixed(2)}</span>,
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
            placeholder="Buscar productos..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />}>
            Nuevo Producto
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={productos}
          rowKey="idProducto"
          loading={loading}
          pagination={{
            ...tableParams.pagination,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} productos`,
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
        title="Editar Producto"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          setEditingProducto(null)
        }}
        footer={null}
        width={500}
      >
        {editingProducto && (
          <FormEditarProducto
            producto={editingProducto}
            onSuccess={handleEditSuccess}
            onCancel={() => {
              setModalVisible(false)
              setEditingProducto(null)
            }}
          />
        )}
      </Modal>
    </div>
  )
}

import React, { useMemo } from 'react'
import { Input, Table } from 'antd'

export default function CatalogTable({
  title,
  loading,
  items,
  search,
  onSearchChange,
  rowKey,
  selectedRowKeys,
  onSelectionChange,
}) {
  const columns = useMemo(
    () => [
      {
        title,
        dataIndex: 'nombre',
        key: 'nombre',
        render: (_, record) => record.nombre,
      },
      {
        title: 'Precio',
        dataIndex: 'precioBase',
        key: 'precioBase',
        width: 140,
        render: (value) => {
          const n = typeof value?.toNumber === 'function' ? value.toNumber() : Number(value ?? 0)
          return `Bs. ${n.toFixed(2)}`
        },
      },
      {
        title: 'SKU',
        dataIndex: 'sku',
        key: 'sku',
        width: 160,
        render: (value) => value || '-',
      },
      {
        title: 'Cantidad Restante',
        key: 'stock',
        width: 170,
        render: () => '-',
      },
    ],
    [title],
  )

  return (
    <div>
      <Input.Search
        placeholder="Buscar artículo por nombre o SKU"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        allowClear
        style={{ marginBottom: 12 }}
      />

      <Table
        size="middle"
        rowKey={(r) => String(r[rowKey])}
        loading={loading}
        columns={columns}
        dataSource={items}
        pagination={false}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => onSelectionChange(keys.map(String)),
        }}
      />
    </div>
  )
}

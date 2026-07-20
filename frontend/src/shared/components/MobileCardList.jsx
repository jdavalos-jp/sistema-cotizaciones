import { Card, Empty, Pagination, Spin, Typography } from 'antd'

const { Text } = Typography

function MobileCardList({
  data = [],
  loading = false,
  renderCard,
  pagination,
  onPaginationChange,
  emptyText = 'Sin datos',
  totalText = 'items',
}) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (data.length === 0) {
    return <Empty description={emptyText} style={{ marginTop: 40 }} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {data.map((item, index) => (
        <Card
          key={item.id || item.idProducto || item.idComponente || item.idCliente || item.idCategoria || item.idCotizacion || index}
          variant="borderless"
          size="small"
          style={{
            borderRadius: 8,
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
          styles={{ body: { padding: 14 } }}
        >
          {renderCard(item)}
        </Card>
      ))}

      {pagination && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 8 }}>
          <Pagination
            size="small"
            current={pagination.current || pagination.page}
            pageSize={pagination.pageSize || pagination.take || 10}
            total={pagination.total || 0}
            onChange={onPaginationChange}
            showSizeChanger={false}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {pagination.total || 0} {totalText}
          </Text>
        </div>
      )}
    </div>
  )
}

export default MobileCardList

import React, { useMemo } from 'react'
import { Button, Card, Col, Empty, Row, Space, Typography, InputNumber } from 'antd'
import { CloseOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons'

function money(value) {
  const n = typeof value?.toNumber === 'function' ? value.toNumber() : Number(value ?? 0)
  return n
}

export default function SelectedItemsPanel({ lineas, moneda = 'Bs', onRemove, onSetCantidad }) {
  const total = useMemo(() => {
    if (!lineas?.length) return 0
    return lineas.reduce((acc, l) => acc + money(l.totalLinea), 0)
  }, [lineas])

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between' }} align="baseline">
        <Typography.Text type="secondary">Añadir productos a este pedido</Typography.Text>
        <Typography.Title level={4} style={{ margin: 0, color: '#389e0d' }}>
          {moneda} {total.toFixed(2)}
        </Typography.Title>
      </Space>

      <div
        style={{
          marginTop: 12,
          padding: 16,
          border: '1px dashed #91caff',
          borderRadius: 8,
          background: '#e6f4ff',
          minHeight: 170,
        }}
      >
        {!lineas?.length ? (
          <Empty description="Aún no has seleccionado productos." />
        ) : (
          <Row gutter={[12, 12]}>
            {lineas.map((l) => (
              <Col key={`${l.tipo}:${String(l.id)}`} xs={24} sm={12} md={8} lg={6}>
                <Card
                  size="small"
                  title={
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Typography.Text ellipsis>{l.nombre}</Typography.Text>
                      <Button
                        size="small"
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={() => onRemove(l.tipo, String(l.id))}
                      />
                    </Space>
                  }
                >
                  <Typography.Text type="secondary">
                    Precio: {moneda} {money(l.precioUnitario).toFixed(2)}
                  </Typography.Text>
                  <br />
                  <Typography.Text type="secondary">SKU: {l.codigo || '-'}</Typography.Text>

                  <div style={{ marginTop: 12 }}>
                    <Space.Compact>
                      <Button
                        icon={<MinusOutlined />}
                        onClick={() => onSetCantidad(l.tipo, String(l.id), Math.max(1, l.cantidad - 1))}
                      />
                      <InputNumber
                        min={1}
                        value={l.cantidad}
                        onChange={(v) => onSetCantidad(l.tipo, String(l.id), v)}
                        style={{ width: 90 }}
                      />
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => onSetCantidad(l.tipo, String(l.id), l.cantidad + 1)}
                      />
                    </Space.Compact>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <Typography.Text type="secondary">Total</Typography.Text>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      {moneda} {money(l.totalLinea).toFixed(2)}
                    </Typography.Title>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  )
}

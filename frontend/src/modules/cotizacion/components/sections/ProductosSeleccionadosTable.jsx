import React, { useMemo } from 'react';
import { Card, Table, Button, Space, Typography, Empty, Row, Col, Statistic, Input, InputNumber } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

function ProductosSeleccionadosTable({
  lineas = [],
  moneda = 'Bs',
  onRemove = () => { },
  onSetCantidad = () => { },
  onSetPrecio = () => { },
  onSetNombre = () => { },
  onSetDescripcion = () => { },
  onSetObservaciones = () => { },
}) {
  const total = useMemo(() => lineas.reduce((acc, l) => acc + (Number(l.totalLinea) || 0), 0), [lineas]);

  const daysTotal = useMemo(() => {
    const uniqueDays = new Set(lineas.map((l) => l.dias).filter(Boolean));
    return uniqueDays.size > 0 ? Array.from(uniqueDays)[0] : 1;
  }, [lineas]);

  const columns = [
    {
      title: 'PRODUCTO',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (text, record) => (
        <Input
          value={text || ''}
          onChange={(e) => onSetNombre(record.tipo, String(record.id), e.target.value)}
          placeholder="Nombre del producto"
          size="small"
        />
      ),
    },
    {
      title: 'DESCRIPCIÓN',
      dataIndex: 'descripcion',
      key: 'descripcion',
      render: (text, record) => (
        <Input
          value={text || ''}
          onChange={(e) => onSetDescripcion(record.tipo, String(record.id), e.target.value)}
          placeholder="Sin descripción"
          size="small"
        />
      ),
    },
    {
      title: 'NOTAS / ENTREGA',
      dataIndex: 'observaciones',
      key: 'observaciones',
      width: 140,
      render: (text, record) => (
        <Input
          value={text || ''}
          onChange={(e) => onSetObservaciones(record.tipo, String(record.id), e.target.value)}
          placeholder="Ej: Inmediata"
          size="small"
        />
      ),
    },
    {
      title: `PRECIO (${moneda})`,
      dataIndex: 'precioUnitario',
      key: 'precioUnitario',
      align: 'right',
      width: 140,
      render: (price, record) => (
        <InputNumber
          min={0}
          step={1}
          precision={0}
          value={Number(price || 0)}
          onChange={(val) => {
            if (Number.isInteger(val)) {
              onSetPrecio(record.tipo, String(record.id), Math.max(0, val || 0));
            }
          }}
          style={{ width: '100%' }}
          size="small"
        />
      ),
    },
    {
      title: 'CANTIDAD',
      dataIndex: 'cantidad',
      key: 'cantidad',
      align: 'center',
      width: 100,
      render: (cantidad, record) => (
        <InputNumber
          min={1}
          step={1}
          precision={0}
          value={cantidad}
          onChange={(val) => {
            if (Number.isInteger(val)) {
              onSetCantidad(record.tipo, String(record.id), Math.max(1, val || 1));
            }
          }}
          style={{ width: '100%' }}
          size="small"
        />
      ),
    },
    {
      title: `TOTAL (${moneda})`,
      dataIndex: 'totalLinea',
      key: 'totalLinea',
      align: 'right',
      width: 120,
      render: (total) => (
        <span style={{ fontWeight: 600 }}>
          {Number(total || 0).toLocaleString('es-BO')}
        </span>
      ),
    },
    {
      title: 'ACCIÓN',
      key: 'action',
      align: 'center',
      width: 70,
      render: (_, record) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => onRemove(record.tipo, String(record.id))}
        />
      ),
    },
  ];

  return (
    <Card
      variant="borderless"
      style={{
        borderRadius: 8,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
      styles={{
        header: { padding: '16px 24px', borderBottom: '1px solid #f0f0f0' },
        body: { padding: 24 },
      }}
      title={
        <Space>
          <Typography.Title level={5} style={{ margin: 0 }}>
            Productos Seleccionados
          </Typography.Title>
          <span style={{ opacity: 0.65 }}>
            ({lineas.length} item{lineas.length !== 1 ? 's' : ''})
          </span>
        </Space>
      }
    >
      {lineas.length === 0 ? (
        <Empty description="Sin productos seleccionados" style={{ marginTop: 20 }} />
      ) : (
        <>
          <Table
            columns={columns}
            rowKey={(record) => `${record.tipo}-${record.id}`}
            dataSource={lineas}
            pagination={false}
            size="small"
            scroll={{ x: true }}
          />
          <Row justify="end" style={{ marginTop: 16 }} gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Statistic
                title={`Total 1 día de ${daysTotal} (${moneda})`}
                value={total.toFixed(2)}
                styles={{
                  content: { color: '#389e0d', fontSize: 20, fontWeight: 'bold' }
                }}
              />
            </Col>
          </Row>
        </>
      )}
    </Card>
  );
}

export default ProductosSeleccionadosTable;

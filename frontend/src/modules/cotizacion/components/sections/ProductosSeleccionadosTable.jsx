import React, { useMemo } from 'react';
import { Card, Table, Button, Space, Typography, Empty, Row, Col, Statistic } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

function ProductosSeleccionadosTable({
  lineas = [],
  moneda = 'Bs',
  onRemove = () => {},
  onSetCantidad = () => {},
  onSetPrecio = () => {},
  onSetNombre = () => {},
  onSetDescripcion = () => {},
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
        <input
          type="text"
          value={text || ''}
          onChange={(e) => onSetNombre(record.tipo, String(record.id), e.target.value)}
          style={{
            width: '100%',
            padding: 4,
            border: '1px solid #d9d9d9',
            borderRadius: 4,
            fontWeight: 500,
          }}
        />
      ),
    },
    {
      title: 'DESCRIPCIÓN',
      dataIndex: 'descripcion',
      key: 'descripcion',
      render: (text, record) => (
        <input
          type="text"
          value={text || ''}
          onChange={(e) => onSetDescripcion(record.tipo, String(record.id), e.target.value)}
          placeholder="Sin descripción"
          style={{
            width: '100%',
            padding: 4,
            border: '1px solid #d9d9d9',
            borderRadius: 4,
            fontSize: 12,
          }}
        />
      ),
    },
    {
      title: `PRECIO (${moneda})`,
      dataIndex: 'precioUnitario',
      key: 'precioUnitario',
      align: 'right',
      width: 120,
      render: (price, record) => (
        <input
          type="number"
          min={1}
          step={1}
          value={Number(price || 0)}
          onChange={(e) => onSetPrecio(record.tipo, String(record.id), Math.max(0, Number(e.target.value) || 0))}
          style={{
            width: '100%',
            textAlign: 'right',
            padding: 4,
            border: '1px solid #d9d9d9',
            borderRadius: 4,
          }}
        />
      ),
    },
    {
      title: 'CANTIDAD',
      dataIndex: 'cantidad',
      key: 'cantidad',
      align: 'center',
      width: 80,
      render: (cantidad, record) => (
        <input
          type="number"
          min={1}
          value={cantidad}
          onChange={(e) => onSetCantidad(record.tipo, String(record.id), Math.max(1, Number(e.target.value) || 1))}
          style={{
            width: '100%',
            textAlign: 'center',
            padding: 4,
            border: '1px solid #d9d9d9',
            borderRadius: 4,
          }}
        />
      ),
    },
    {
      title: `TOTAL (${moneda})`,
      dataIndex: 'totalLinea',
      key: 'totalLinea',
      align: 'right',
      width: 100,
      render: (total) => (
        <span style={{ fontWeight: 600 }}>
          {Number(total || 0).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'ACCIÓN',
      key: 'action',
      align: 'center',
      width: 70,
      render: (_, record) => (
        <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => onRemove(record.tipo, String(record.id))} />
      ),
    },
  ];

  return (
    <Card
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
            rowKey={(record) => `${record.tipo}:${record.id}`}
            dataSource={lineas}
            pagination={false}
            size="small"
          />
          <Row justify="end" style={{ marginTop: 16 }} gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Statistic
                title={`Total 1 día de ${daysTotal} (${moneda})`}
                value={total.toFixed(2)}
                valueStyle={{ color: '#389e0d', fontSize: 20, fontWeight: 'bold' }}
              />
            </Col>
          </Row>
        </>
      )}
    </Card>
  );
}

export default ProductosSeleccionadosTable;
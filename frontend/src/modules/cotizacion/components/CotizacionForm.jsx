import React, { useState, useMemo } from 'react';
import { Button, Space, Typography, message, Divider, Row, Col, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  ClienteDatosSection,
  FechaValidacionSection,
  AgregarProductosSection,
  ProductosSeleccionadosTable,
  ModalNuevoCliente,
} from './sections';
import { useCotizacionPreview } from '../hooks/useCotizacionPreview';

export default function CotizacionForm({
  initialCliente,
  initialDiasValidez = 10,
  initialDiasEntrega = 5,
  initialCart,
  moneda = 'Bs',
  onSubmit,
  submitLabel = 'Generar Cotización',
  submitting = false,
  onCancel, // Callback optional para botón cancelar
  clientes = null, // Datos de búsqueda de clientes (opcional)
  productos = null, // Datos de búsqueda de productos (opcional)
  componentes = null, // Datos de búsqueda de componentes (opcional)
}) {
  const [idCliente, setIdCliente] = useState(initialCliente?.id || null);
  const [clienteLabel, setClienteLabel] = useState(initialCliente?.nombre || '');
  const [diasValidez, setDiasValidez] = useState(initialDiasValidez);
  const [diasEntrega, setDiasEntrega] = useState(initialDiasEntrega);
  const [modalNuevoClienteVisible, setModalNuevoClienteVisible] = useState(false);
  const cart = initialCart;

  // Hook para calcular líneas con estructura completa (precios, subtotales, etc)
  const preview = useCotizacionPreview({
    idCliente,
    moneda,
    cart: cart.cart,
    removeItem: cart.removeItem,
  });

  const lineas = preview.data?.lineas ?? [];

  // Mapear lineas con ediciones del carrito (nombre y descripción personalizados)
  const lineasConEdiciones = useMemo(() => {
    return lineas.map((linea) => {
      const cartItem = cart.cart.find((x) => x.tipo === linea.tipo && String(x.id) === String(linea.id));
      if (cartItem) {
        return {
          ...linea,
          nombre: cartItem.nombre ?? linea.nombre,
          descripcion: cartItem.descripcion ?? linea.descripcion,
        };
      }
      return linea;
    });
  }, [lineas, cart.cart]);

  const handleSubmit = async () => {
    if (!idCliente) return message.warning('Selecciona un cliente');
    if (!cart.cart.length) return message.warning('Agrega al menos un producto o componente');
    if (!diasValidez) return message.warning('Ingresa los días de validez');
    if (!diasEntrega) return message.warning('Ingresa los días de entrega');

    const payload = {
      idCliente,
      diasValidez,
      diasEntrega,
      moneda,
      productos: cart.cart.filter(x => x.tipo === 'producto'),
      componentes: cart.cart.filter(x => x.tipo === 'componente'),
    };

    await onSubmit(payload);
  };

  return (
    <Space orientation="vertical" size={24} style={{ width: '100%' }}>
      {clientes ? (
        // Modo búsqueda (nuevo)
        <ClienteDatosSection
          clientes={clientes}
          idCliente={idCliente}
          setIdCliente={setIdCliente}
          clienteLabel={clienteLabel}
          setClienteLabel={setClienteLabel}
          onNewCliente={() => setModalNuevoClienteVisible(true)}
        />
      ) : (
        // Modo lectura (edición)
        <Card title="Cliente">
          <Typography.Text strong>{clienteLabel}</Typography.Text>
        </Card>
      )}
      <FechaValidacionSection
        diasValidez={diasValidez}
        setDiasValidez={setDiasValidez}
        diasEntrega={diasEntrega}
        setDiasEntrega={setDiasEntrega}
      />
      <AgregarProductosSection 
        productos={productos || { items: [], loading: false }} 
        componentes={componentes || { items: [], loading: false }} 
        cart={cart} 
      />
      <ProductosSeleccionadosTable
        lineas={lineasConEdiciones}
        moneda={moneda}
        onRemove={cart.removeItem}
        onSetCantidad={cart.setCantidad}
        onSetPrecio={cart.setPrecioUnitario}
        onSetNombre={cart.setNombre}
        onSetDescripcion={cart.setDescripcion}
      />
      <Divider />
      <Row justify="end" style={{ marginBottom: 80 }}>
        <Col>
          <div style={{
            position: 'fixed', bottom: 0, left: 0, width: '100%',
            background: '#fff', borderTop: '1px solid #f0f0f0',
            padding: '16px 24px', zIndex: 10, display: 'flex', justifyContent: 'flex-end', gap: 16
          }}>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleSubmit}
              loading={submitting}
              disabled={!idCliente || !cart.cart.length || lineasConEdiciones.length === 0}
              style={{ borderRadius: 8, minWidth: 100, fontWeight: 600 }}
            >
              Guradar
            </Button>
            <Button size="large" onClick={() => cart.clear()} style={{ borderRadius: 8 }}>
              Limpiar
            </Button>
            {onCancel && <Button size="large" onClick={onCancel} style={{ borderRadius: 8 }}>Cancelar</Button>}
          </div>
        </Col>
      </Row>
      <ModalNuevoCliente
        visible={modalNuevoClienteVisible}
        onClose={() => setModalNuevoClienteVisible(false)}
        onSuccess={(nuevoCliente) => {
          setIdCliente(nuevoCliente.id || Date.now());
          setClienteLabel(nuevoCliente.nombre);
          message.success('Cliente registrado exitosamente');
        }}
      />
    </Space>
  );
}
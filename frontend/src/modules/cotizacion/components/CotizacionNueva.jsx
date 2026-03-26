import React, { useState } from 'react';
import { Button, Space, Typography, message, Card, Row, Col, Divider } from 'antd';
import { CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';

import { 
  ClienteDatosSection, 
  FechaValidacionSection, 
  AgregarProductosSection, 
  ProductosSeleccionadosTable, 
  ModalNuevoCliente 
} from './sections';

import { useCatalogSearch } from '../hooks/useCatalogSearch';
import { useClientesSearch } from '../hooks/useClientesSearch';
import { useCotizacionCart } from '../hooks/useCotizacionCart';
import { useCotizacionPreview } from '../hooks/useCotizacionPreview';

import { fetchProductos, fetchComponentes } from '../services/api/catalogoApi';
import { generarPdfCotizacion } from '../services/api/cotizacionesApi';

// Helpers para descargar PDF
function toArrayBufferBlob(arrayBuffer) {
  return new Blob([arrayBuffer], { type: 'application/pdf' });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function CotizacionNueva() {
  const [idCliente, setIdCliente] = useState(null);
  const [clienteLabel, setClienteLabel] = useState('');
  const [diasValidez, setDiasValidez] = useState(10);
  const [diasEntrega, setDiasEntrega] = useState(5);
  const [moneda] = useState('Bs');
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [modalNuevoClienteVisible, setModalNuevoClienteVisible] = useState(false);

  const clientes = useClientesSearch();
  const productos = useCatalogSearch(fetchProductos);
  const componentes = useCatalogSearch(fetchComponentes);
  const cart = useCotizacionCart();
  const preview = useCotizacionPreview({ idCliente, moneda, cart: cart.cart });

  const lineas = preview.data?.lineas ?? [];

  const lineasConEdiciones = lineas.map((linea) => {
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

  const getFechaInicio = () => new Date().toISOString().split('T')[0];
  const getFechaFin = () => {
    const hoy = new Date();
    hoy.setDate(hoy.getDate() + (diasValidez || 0));
    return hoy.toISOString().split('T')[0];
  };

  const onRemove = (tipo, id) => cart.removeItem(tipo, String(id));
  const onSetCantidad = (tipo, id, cantidad) => cart.setCantidad(tipo, String(id), cantidad);
  const onSetPrecio = (tipo, id, precio) => cart.setPrecioUnitario(tipo, String(id), precio);
  const onSetNombre = (tipo, id, nombre) => cart.setNombre(tipo, String(id), nombre);
  const onSetDescripcion = (tipo, id, descripcion) => cart.setDescripcion(tipo, String(id), descripcion);

  const handleGenerarCotizacion = async () => {
    if (!idCliente) return message.warning('Selecciona un cliente');
    if (!cart.cart.length) return message.warning('Selecciona al menos un producto o componente');
    if (!diasValidez) return message.warning('Ingresa los días de validez');
    if (!diasEntrega) return message.warning('Ingresa los días de entrega');

    setLoadingSubmit(true);
    try {
      const fechaValidezStr = getFechaFin();

      const payload = {
        idCliente: String(idCliente),
        moneda,
        diasEntrega,
        ...(fechaValidezStr && { fechaValidez: fechaValidezStr }),
        productos: cart.cart
          .filter((x) => x.tipo === 'producto')
          .map((x) => ({
            idProducto: String(x.id),
            cantidad: Math.max(1, Number(x.cantidad) || 1),
            ...(x.precioUnitario !== undefined && { precioUnitario: x.precioUnitario }),
            ...(x.nombre && { nombre: x.nombre }),
            ...(x.descripcion && { descripcion: x.descripcion }),
          })),
        componentes: cart.cart
          .filter((x) => x.tipo === 'componente')
          .map((x) => ({
            idComponente: String(x.id),
            cantidad: Math.max(1, Number(x.cantidad) || 1),
            ...(x.precioUnitario !== undefined && { precioUnitario: x.precioUnitario }),
            ...(x.nombre && { nombre: x.nombre }),
            ...(x.descripcion && { descripcion: x.descripcion }),
          })),
      };

      const pdfArrayBuffer = await generarPdfCotizacion(payload);
      const blob = toArrayBufferBlob(pdfArrayBuffer);
      downloadBlob(blob, 'cotizacion.pdf');

      message.success('¡Cotización creada exitosamente!');
      setShowSuccess(true);

      setTimeout(() => {
        cart.clear();
        setIdCliente(null);
        setClienteLabel('');
        setDiasValidez(10);
        setDiasEntrega(5);
        setShowSuccess(false);
      }, 3000);
    } catch (err) {
      message.error(String(err?.message || err));
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div>
      {showSuccess && (
        <Card>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 24 }} />
            <Typography.Title level={2}>¡Cotización Completada!</Typography.Title>
            <Typography.Text>La cotización ha sido creada y descargada exitosamente</Typography.Text>
          </div>
        </Card>
      )}

      <div style={{ display: showSuccess ? 'none' : 'block' }} aria-hidden={showSuccess}>
        <Space orientation="vertical" size={24} style={{ width: '100%' }}>
        <div>
          <Typography.Title level={3} style={{ marginTop: 0, marginBottom: 0 }}>
            Nueva Cotización
          </Typography.Title>
          <Typography.Text type="secondary">Completa los datos para crear una cotización</Typography.Text>
        </div>

        <ClienteDatosSection
          clientes={clientes}
          idCliente={idCliente}
          setIdCliente={setIdCliente}
          clienteLabel={clienteLabel}
          setClienteLabel={setClienteLabel}
          onNewCliente={() => setModalNuevoClienteVisible(true)}
        />

        <FechaValidacionSection
          diasValidez={diasValidez}
          setDiasValidez={setDiasValidez}
          diasEntrega={diasEntrega}
          setDiasEntrega={setDiasEntrega}
        />

        <AgregarProductosSection
          productos={productos}
          componentes={componentes}
          cart={cart}
        />

        <ProductosSeleccionadosTable
          lineas={lineasConEdiciones}
          moneda={moneda}
          onRemove={onRemove}
          onSetCantidad={onSetCantidad}
          onSetPrecio={onSetPrecio}
          onSetNombre={onSetNombre}
          onSetDescripcion={onSetDescripcion}
        />

        <Divider style={{ margin: '8px 0' }} />

        <Row justify="space-between" align="middle">
          <Col>
            <Typography.Text type="secondary">{cart.cart.length} producto(s) en cotización</Typography.Text>
          </Col>
          <Col>
            <Space>
              <Button onClick={() => cart.clear()}>Limpiar</Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                loading={loadingSubmit}
                onClick={handleGenerarCotizacion}
                disabled={!idCliente || !cart.cart.length || !diasValidez || !diasEntrega}
              >
                Generar Cotización
              </Button>
            </Space>
          </Col>
        </Row>
        </Space>

        <ModalNuevoCliente
          visible={modalNuevoClienteVisible}
          onClose={() => setModalNuevoClienteVisible(false)}
          onSuccess={(nuevoCliente) => {
            setIdCliente(nuevoCliente.id || Date.now());
            setClienteLabel(nuevoCliente.nombre);
            clientes.setSearch(nuevoCliente.nombre);
            message.success('Cliente registrado exitosamente');
          }}
        />
      </div>
    </div>
  );
}

export default CotizacionNueva;
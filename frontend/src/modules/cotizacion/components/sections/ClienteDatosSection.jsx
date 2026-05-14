import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  AutoComplete,
  Button,
  Card,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  message,
} from 'antd'
import { UserOutlined, PlusOutlined } from '@ant-design/icons'
import { fetchClienteById } from '../../services/api/clientesApi'
import { safeRender } from '../../../../shared/utils/safeRender'

function ClienteDatosSection({
  clientes,
  idCliente,
  setIdCliente,
  clienteLabel,
  setClienteLabel,
  onNewCliente,
}) {
  const [clienteData, setClienteData] = useState(null)
  const [loadingCliente, setLoadingCliente] = useState(false)

  // Caché en memoria: evita re-fetches al reseleccionar el mismo cliente en la sesión
  const clienteCache = useRef(new Map())

  // Referencia al AbortController activo: cancela el request previo si el usuario
  // cambia de cliente antes de que llegue la respuesta (evita race condition)
  const abortRef = useRef(null)

  // Evita llamar setState sobre un componente ya desmontado.
  // Escenario típico: usuario navega fuera mientras hay un fetch en vuelo.
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      abortRef.current?.abort() // cancelar cualquier request en vuelo al desmontar
    }
  }, [])

  const handleSelectCliente = useCallback(async (value) => {
    setIdCliente(value)

    const label = clientes.options.find((o) => o.value === value)?.label ?? value
    setClienteLabel(label)
    clientes.setSearch(label)

    // Cancelar request previo en vuelo antes de lanzar uno nuevo
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    // Servir desde caché si ya fue cargado antes en esta sesión
    if (clienteCache.current.has(value)) {
      setClienteData(clienteCache.current.get(value))
      return
    }

    setLoadingCliente(true)
    try {
      const cliente = await fetchClienteById(value, { signal: abortRef.current.signal })

      // Solo actualizar estado si el componente sigue montado
      if (!mountedRef.current) return

      clienteCache.current.set(value, cliente)
      setClienteData(cliente)
    } catch (err) {
      // AbortError es intencional (cambio de cliente o desmonte), no mostrar error
      if (err.name !== 'AbortError' && mountedRef.current) {
        message.error('No se pudieron cargar los datos del cliente')
      }
    } finally {
      if (mountedRef.current) setLoadingCliente(false)
    }
  }, [clientes, setIdCliente, setClienteLabel])

  const handleSearchChange = useCallback((v) => {
    clientes.setSearch(v)

    // Si el usuario edita el texto después de haber seleccionado un cliente,
    // limpiar la selección para que no queden datos huérfanos en pantalla
    if (idCliente && v !== clienteLabel) {
      setIdCliente(null)
      setClienteData(null)
      abortRef.current?.abort()
    }
  }, [idCliente, clienteLabel, clientes, setIdCliente])

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
          <UserOutlined />
          <span>Cliente</span>
        </Space>
      }
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined style={{ color: 'white' }} />}
          onClick={onNewCliente}
        >
          Nuevo Cliente
        </Button>
      }
    >
      {/* orientation="vertical" es la prop correcta en antd v6 — direction está deprecado */}
      <Space orientation="vertical" style={{ width: '100%' }} size={12}>
        <div>
          <Typography.Text type="secondary">Seleccionar cliente *</Typography.Text>
          <AutoComplete
            style={{ width: '100%', marginTop: 8 }}
            value={clientes.search}
            options={clientes.options}
            placeholder="Buscar cliente..."
            onSearch={handleSearchChange}
            onSelect={handleSelectCliente}
            allowClear
            loading={clientes.loading || loadingCliente}
          />
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            Escribe al menos 2 caracteres o crea uno nuevo
          </Typography.Text>
        </div>

        {idCliente && clienteData && (
          // key={idCliente}: fuerza remount limpio del subtree al cambiar de cliente.
          // Corrige el NotFoundError "removeChild" causado por nodos que React intenta
          // eliminar pero que ya fueron movidos (extensiones del navegador como Google
          // Translate, o renders concurrentes en vuelo).
          <React.Fragment key={idCliente}>
            <Divider style={{ margin: '12px 0' }} />
            <div>
              <Typography.Text strong style={{ fontSize: '14px' }}>
                Datos del Cliente
              </Typography.Text>
              <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
                <Col xs={24} sm={12}>
                  <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    Nombre
                  </Typography.Text>
                  <div style={{ fontSize: '16px', fontWeight: 500, marginTop: 4 }}>
                    {/* Sin optional chaining: clienteData está garantizado por el guard superior */}
                    {safeRender(clienteData.nombreCompleto)}
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    Correo
                  </Typography.Text>
                  <div style={{ fontSize: '16px', fontWeight: 500, marginTop: 4 }}>
                    {safeRender(clienteData.email)}
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    Teléfono
                  </Typography.Text>
                  <div style={{ fontSize: '16px', fontWeight: 500, marginTop: 4 }}>
                    {safeRender(clienteData.telefono)}
                  </div>
                </Col>
                {clienteData.institucion && (
                  <Col xs={24} sm={12}>
                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                      Razón Social
                    </Typography.Text>
                    <div style={{ fontSize: '16px', fontWeight: 500, marginTop: 4 }}>
                      {safeRender(clienteData.institucion)}
                    </div>
                  </Col>
                )}
              </Row>
            </div>
          </React.Fragment>
        )}
      </Space>
    </Card>
  )
}

export default ClienteDatosSection

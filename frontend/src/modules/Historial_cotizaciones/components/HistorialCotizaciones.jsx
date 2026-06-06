import { useState, useEffect, useMemo, useCallback } from 'react'
import { Modal, Spin, Alert, message, Typography, Card, Input, Button, DatePicker, Select, Space } from 'antd'
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useCotizacionesList } from '../hooks/useCotizacionesManager'
import { toDateOnlyString } from '../../../shared/utils'

import CotizacionesTable from './CotizacionesTable'
import VerDetalleCotizacion from './VerDetalleCotizacion'

const { RangePicker } = DatePicker

function HistorialCotizaciones() {
  const navigate = useNavigate()
  const {
    cotizaciones,
    loading,
    error,
    pagination,
    loadCotizaciones,
    changeStatus,
    remove,
  } = useCotizacionesList()

  const [filtro, setFiltro] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [fechas, setFechas] = useState(null)
  const [paginacion, setPaginacion] = useState({ current: 1, pageSize: 10 })
  const [modalVisible, setModalVisible] = useState(false)
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null)
  const { current, pageSize } = paginacion

  const cargarCotizaciones = useCallback(async (signal) => {
    try {
      const estado = filtro === 'todos' ? null : filtro
      const skip = (current - 1) * pageSize

      await loadCotizaciones({
        estado,
        skip,
        take: pageSize,
        signal,
      })
    } catch (err) {
      if (err.name === 'AbortError') return
      message.error('Error al cargar cotizaciones')
    }
  }, [filtro, loadCotizaciones, current, pageSize])

  useEffect(() => {
    const controller = new AbortController()
    cargarCotizaciones(controller.signal)
    return () => controller.abort()
  }, [cargarCotizaciones])

  const cotizacionesFiltradas = useMemo(() => {
    let result = cotizaciones

    if (busqueda.trim()) {
      const searchTerm = busqueda.toLowerCase().trim()
      result = result.filter((cotizacion) => {
        const numeroMatch = cotizacion.numeroCotizacion?.toLowerCase().includes(searchTerm)
        const clienteMatch = cotizacion.cliente?.nombreCompleto?.toLowerCase().includes(searchTerm)
        return numeroMatch || clienteMatch
      })
    }

    if (fechas && fechas.length === 2) {
      const [start, end] = fechas
      const startDate = start.format('YYYY-MM-DD')
      const endDate = end.format('YYYY-MM-DD')

      result = result.filter((cotizacion) => {
        const fechaEmision = toDateOnlyString(cotizacion.fechaEmision)
        return fechaEmision >= startDate && fechaEmision <= endDate
      })
    }

    return result
  }, [cotizaciones, busqueda, fechas])

  const handleFiltroChange = (value) => {
    setFiltro(value)
    setPaginacion((prev) => ({ ...prev, current: 1 }))
  }

  const handleCambiarEstado = async (id, estado) => {
    await changeStatus(id, estado)
    cargarCotizaciones()
  }

  const handleEliminar = async (id) => {
    await remove(id)
    cargarCotizaciones()
  }

  const handleVerDetalles = (cotizacion) => {
    setCotizacionSeleccionada(cotizacion)
    setModalVisible(true)
  }

  const opcionesFiltro = [
    { label: 'Todas', value: 'todos' },
    { label: 'Borradores', value: 'borrador' },
    { label: 'Enviadas', value: 'enviada' },
    { label: 'Aceptadas', value: 'aceptada' },
    { label: 'Rechazadas', value: 'rechazada' },
  ]

  return (
    <div style={{ backgroundColor: '#f5f5f5', padding: 24, minHeight: '100vh', margin: '-24px' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Historial de Cotizaciones
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 14 }}>
            Inicio / Cotizaciones / Historial
          </Typography.Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => cargarCotizaciones()} loading={loading}>
            Refrescar
          </Button>
        </Space>
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          message="No se pudo cargar el historial"
          description={error}
          style={{ marginBottom: 16 }}
        />
      )}

      <Card
        variant="borderless"
        styles={{ body: { padding: 24 } }}
        style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
      >
        <Spin spinning={loading}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <Input
              allowClear
              placeholder="Buscar por numero o cliente..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              style={{ flex: 1, minWidth: 200 }}
              suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
            />
            
            <RangePicker 
              style={{ width: 260 }} 
              onChange={(dates) => setFechas(dates)}
              placeholder={['Fecha inicial', 'Fecha final']}
              format="DD/MM/YYYY"
            />

            <Select
              value={filtro}
              onChange={handleFiltroChange}
              style={{ width: 160 }}
              options={opcionesFiltro}
            />

            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/cotizaciones/nueva')}>
              Nueva Cotización
            </Button>
          </div>

          <CotizacionesTable
            cotizaciones={cotizacionesFiltradas}
            paginacion={paginacion}
            total={busqueda.trim() || fechas ? cotizacionesFiltradas.length : pagination.total}
            setPaginacion={setPaginacion}
            onVer={handleVerDetalles}
            onEliminar={handleEliminar}
            onCambiarEstado={handleCambiarEstado}
          />
        </Spin>
      </Card>

      <Modal
        open={modalVisible}
        footer={null}
        width={1120}
        onCancel={() => setModalVisible(false)}
        title="Detalle de cotizacion"
        className="cotizaciones-modal"
        centered
      >
        {cotizacionSeleccionada && (
          <VerDetalleCotizacion
            idCotizacion={cotizacionSeleccionada.idCotizacion}
          />
        )}
      </Modal>
    </div>
  )
}

export default HistorialCotizaciones
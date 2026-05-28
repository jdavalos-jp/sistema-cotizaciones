import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Modal, Spin, message } from 'antd'
import { useCotizacionesList } from '../hooks/useCotizacionesManager'

import CotizacionesHeader from './CotizacionesHeader'
import CotizacionesFiltros from './CotizacionesFiltros'
import CotizacionesTable from './CotizacionesTable'
import VerDetalleCotizacion from './VerDetalleCotizacion'
import './historialCotizaciones.css'

function HistorialCotizaciones() {
  const {
    cotizaciones,
    loading,
    error,
    loadCotizaciones,
    changeStatus,
    remove,
  } = useCotizacionesList()

  const [filtro, setFiltro] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [paginacion, setPaginacion] = useState({ current: 1, pageSize: 10 })
  const [modalVisible, setModalVisible] = useState(false)
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null)

  const cargarCotizaciones = useCallback(async () => {
    try {
      const estado = filtro === 'todos' ? null : filtro
      const skip = (paginacion.current - 1) * paginacion.pageSize

      await loadCotizaciones({
        estado,
        skip,
        take: paginacion.pageSize,
      })
    } catch {
      message.error('Error al cargar cotizaciones')
    }
  }, [filtro, loadCotizaciones, paginacion])

  useEffect(() => {
    cargarCotizaciones()
  }, [cargarCotizaciones])

  const cotizacionesFiltradas = useMemo(() => {
    if (!busqueda.trim()) return cotizaciones

    const searchTerm = busqueda.toLowerCase().trim()

    return cotizaciones.filter((cotizacion) => {
      const numeroMatch = cotizacion.numeroCotizacion?.toLowerCase().includes(searchTerm)
      const clienteMatch = cotizacion.cliente?.nombreCompleto?.toLowerCase().includes(searchTerm)
      return numeroMatch || clienteMatch
    })
  }, [cotizaciones, busqueda])

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

  if (error) return <div className="cotizaciones-error">{error}</div>

  return (
    <div className="cotizaciones-page">
      <CotizacionesHeader />

      <section className="cotizaciones-panel">
        <CotizacionesFiltros
          cotizaciones={cotizaciones}
          filtro={filtro}
          setFiltro={setFiltro}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
        />

        <Spin spinning={loading}>
          <CotizacionesTable
            cotizaciones={cotizacionesFiltradas}
            paginacion={paginacion}
            setPaginacion={setPaginacion}
            onVer={handleVerDetalles}
            onEliminar={handleEliminar}
            onCambiarEstado={handleCambiarEstado}
          />
        </Spin>
      </section>

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

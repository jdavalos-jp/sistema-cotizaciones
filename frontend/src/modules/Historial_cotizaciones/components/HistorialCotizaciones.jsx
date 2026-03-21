import React, { useState, useEffect } from 'react'
import { Modal, Spin, message } from 'antd'
import { useCotizacionesList } from '../hooks/useCotizacionesManager'

import CotizacionesHeader from './CotizacionesHeader'
import CotizacionesFiltros from './CotizacionesFiltros'
import CotizacionesTable from './CotizacionesTable'
import VerDetalleCotizacion from './VerDetalleCotizacion'

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
  const [paginacion, setPaginacion] = useState({ current: 1, pageSize: 10 })
  const [modalVisible, setModalVisible] = useState(false)
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null)

  useEffect(() => {
    cargarCotizaciones()
  }, [filtro, paginacion])

  const cargarCotizaciones = async () => {
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

  if (error) return <div style={{ color: 'red' }}>{error}</div>

  return (
    <>
      <CotizacionesHeader />

      <CotizacionesFiltros
        cotizaciones={cotizaciones}
        filtro={filtro}
        setFiltro={setFiltro}
      />

      <Spin spinning={loading}>
        <CotizacionesTable
          cotizaciones={cotizaciones}
          paginacion={paginacion}
          setPaginacion={setPaginacion}
          onVer={handleVerDetalles}
          onEliminar={handleEliminar}
          onCambiarEstado={handleCambiarEstado}
        />
      </Spin>

      <Modal
        open={modalVisible}
        footer={null}
        width="90%"
        onCancel={() => setModalVisible(false)}
        title="Detalles de Cotización"
      >
        {cotizacionSeleccionada && (
          <VerDetalleCotizacion
            idCotizacion={cotizacionSeleccionada.idCotizacion}
          />
        )}
      </Modal>
    </>
  )
}

export default HistorialCotizaciones
import { useMemo } from 'react'
import { Select, Input, Statistic } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

function CotizacionesFiltros({
  cotizaciones = [],
  total = 0,
  filtro,
  setFiltro,
  busqueda,
  setBusqueda,
}) {
  const estadisticas = useMemo(() => {
    return cotizaciones.reduce(
      (acc, item) => {
        acc[item.estado] = (acc[item.estado] || 0) + 1
        return acc
      },
      { borrador: 0, enviada: 0, aceptada: 0, rechazada: 0 }
    )
  }, [cotizaciones])

  const opcionesFiltro = [
    { label: 'Todas', value: 'todos' },
    { label: 'Borradores', value: 'borrador' },
    { label: 'Enviadas', value: 'enviada' },
    { label: 'Aceptadas', value: 'aceptada' },
    { label: 'Rechazadas', value: 'rechazada' },
  ]

  return (
    <div className="cotizaciones-toolbar">
      <div className="cotizaciones-metrics">
        <Statistic title="Total" value={total} />
        <Statistic title="Borradores" value={estadisticas.borrador} />
        <Statistic title="Enviadas" value={estadisticas.enviada} />
        <Statistic title="Aceptadas" value={estadisticas.aceptada} />
      </div>

      <div className="cotizaciones-filters">
        <Input
          placeholder="Buscar por numero o cliente"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          className="cotizaciones-search"
          prefix={<SearchOutlined />}
          allowClear
        />

        <Select
          value={filtro}
          onChange={setFiltro}
          className="cotizaciones-select"
          options={opcionesFiltro}
        />
      </div>
    </div>
  )
}

export default CotizacionesFiltros

import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Dropdown, Empty, Spin, Table, Typography } from 'antd'
import {
  AppstoreOutlined,
  ArrowDownOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
  FileTextOutlined,
  MoreOutlined,
  PlusOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  TeamOutlined,
  UserAddOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { apiGet } from '../../services/api/http'
import './DashboardPage.css'

const { Title, Text } = Typography

const metricConfig = {
  productos: { icon: <ShoppingOutlined />, color: 'blue' },
  componentes: { icon: <AppstoreOutlined />, color: 'green' },
  clientes: { icon: <TeamOutlined />, color: 'orange' },
  cotizacionesActivas: { icon: <FileTextOutlined />, color: 'red' },
}

const estadoConfig = {
  borrador: { color: '#2f7df6', bg: '#eaf2ff' },
  pendiente: { color: '#2f7df6', bg: '#eaf2ff' },
  enviada: { color: '#ffad2f', bg: '#fff4df' },
  aceptada: { color: '#35c76b', bg: '#e8f9ef' },
  rechazada: { color: '#aeb9c6', bg: '#f2f5f8' },
  cancelada: { color: '#f45d5d', bg: '#ffecec' },
}

function unwrapData(response) {
  return response?.data ?? response
}

function safeNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function MiniTrend({ points = [], color = '#2f7df6' }) {
  const values = points.length ? points.map((p) => safeNumber(p.total)) : [0]
  const max = Math.max(...values, 1)
  const width = 150
  const height = 36
  const step = values.length > 1 ? width / (values.length - 1) : width
  const d = values
    .map((value, index) => {
      const x = index * step
      const y = height - (value / max) * (height - 6) - 3
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg className="dashboard-mini-trend" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={`${d} L ${width} ${height} L 0 ${height} Z`} fill={color} opacity="0.08" />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MetricCard({ metricKey, metric, trend }) {
  const cfg = metricConfig[metricKey] || metricConfig.productos
  const change = metric?.change
  const hasChange = typeof change === 'number'
  const changePositive = safeNumber(change) >= 0

  return (
    <section className="dashboard-metric-card">
      <div className="dashboard-metric-top">
        <div className={`dashboard-metric-icon dashboard-metric-icon--${cfg.color}`}>{cfg.icon}</div>
        <button className="dashboard-icon-button" type="button" aria-label="Mas opciones">
          <MoreOutlined />
        </button>
      </div>
      <Text className="dashboard-metric-label">{metric?.label}</Text>
      <div className={`dashboard-metric-value dashboard-metric-value--${cfg.color}`}>
        {safeNumber(metric?.value).toLocaleString('es-BO')}
      </div>
      <div className="dashboard-metric-change">
        {hasChange ? (
          <span className={changePositive ? 'dashboard-change-up' : 'dashboard-change-down'}>
            {changePositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {Math.abs(change)}%
          </span>
        ) : (
          <span className="dashboard-change-neutral">Total</span>
        )}
        <span>vs. periodo anterior</span>
      </div>
      <MiniTrend points={trend} color={`var(--dashboard-${cfg.color})`} />
    </section>
  )
}

function BarChart({ data = [] }) {
  const compact = data.filter((_, index) => index % 4 === 0 || index === data.length - 1)
  const max = Math.max(...compact.map((item) => safeNumber(item.total)), 1)

  return (
    <div className="dashboard-bar-chart">
      <div className="dashboard-chart-grid">
        {[20, 15, 10, 5, 0].map((value) => (
          <span key={value}>{value}</span>
        ))}
      </div>
      <div className="dashboard-bars">
        {compact.map((item) => {
          const height = Math.max(8, (safeNumber(item.total) / max) * 132)
          return (
            <div className="dashboard-bar-item" key={item.key}>
              <div className="dashboard-bar-track">
                <div className="dashboard-bar" style={{ height }} title={`${item.label}: ${item.total}`} />
              </div>
              <span>{item.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DonutChart({ data = [] }) {
  const total = data.reduce((sum, item) => sum + safeNumber(item.total), 0)
  const segments = data.filter((item) => safeNumber(item.total) > 0)
  let offset = 0
  const gradient = segments.length
    ? segments
        .map((item) => {
          const cfg = estadoConfig[item.key] || estadoConfig.borrador
          const start = offset
          const end = offset + (safeNumber(item.total) / total) * 100
          offset = end
          return `${cfg.color} ${start}% ${end}%`
        })
        .join(', ')
    : '#e8edf4 0% 100%'

  return (
    <div className="dashboard-status-layout">
      <div className="dashboard-donut" style={{ background: `conic-gradient(${gradient})` }}>
        <div>
          <strong>{total}</strong>
          <span>Total</span>
        </div>
      </div>
      <div className="dashboard-status-list">
        {data.map((item) => {
          const cfg = estadoConfig[item.key] || estadoConfig.borrador
          return (
            <div className="dashboard-status-row" key={item.key}>
              <span className="dashboard-status-dot" style={{ backgroundColor: cfg.color }} />
              <span>{item.label}</span>
              <strong>{item.total}</strong>
              <em>{safeNumber(item.percent).toFixed(1)}%</em>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = async ({ signal } = {}) => {
    setLoading(true)
    setError('')
    try {
      const response = await apiGet('/dashboard/summary', { signal })
      setSummary(unwrapData(response))
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message || 'No se pudo cargar el dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    loadDashboard({ signal: controller.signal })
    return () => controller.abort()
  }, [])

  const metrics = summary?.metrics || {}
  const trend = summary?.cotizacionesTiempo || []
  const recent = summary?.ultimasCotizaciones || []

  const columns = useMemo(
    () => [
      { title: 'Numero', dataIndex: 'numeroCotizacion', key: 'numeroCotizacion' },
      {
        title: 'Cliente',
        dataIndex: 'cliente',
        key: 'cliente',
        render: (cliente, record) => (
          <div>
            <Text>{cliente}</Text>
            {record.contacto ? <div className="dashboard-table-muted">{record.contacto}</div> : null}
          </div>
        ),
      },
      { title: 'Fecha', dataIndex: 'fecha', key: 'fecha' },
      {
        title: 'Estado',
        dataIndex: 'estadoLabel',
        key: 'estado',
        render: (label, record) => {
          const cfg = estadoConfig[record.estado] || estadoConfig.borrador
          return (
            <span className="dashboard-status-pill" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
              <span style={{ backgroundColor: cfg.color }} />
              {label}
            </span>
          )
        },
      },
      { title: 'Total', dataIndex: 'total', key: 'total', align: 'right' },
      {
        title: 'Acciones',
        key: 'acciones',
        align: 'right',
        render: () => (
          <Dropdown menu={{ items: [{ key: 'history', label: 'Ver historial', onClick: () => navigate('/cotizaciones/historial') }] }}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        ),
      },
    ],
    [navigate],
  )

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <Title level={1}>Dashboard</Title>
          <Text>Resumen general del sistema de cotizaciones</Text>
        </div>
        <Button icon={<CalendarOutlined />} onClick={() => loadDashboard()}>
          {summary?.period?.label || 'Ultimos 30 dias'}
        </Button>
      </header>

      {error ? (
        <Alert
          className="dashboard-alert"
          type="error"
          showIcon
          message={error}
          action={<Button icon={<ReloadOutlined />} onClick={() => loadDashboard()}>Reintentar</Button>}
        />
      ) : null}

      <Spin spinning={loading}>
        <section className="dashboard-metrics-grid">
          {['productos', 'componentes', 'clientes', 'cotizacionesActivas'].map((key) => (
            <MetricCard key={key} metricKey={key} metric={metrics[key]} trend={trend} />
          ))}
        </section>

        <section className="dashboard-panels-grid">
          <article className="dashboard-panel">
            <div className="dashboard-panel-header">
              <h2>Cotizaciones en el tiempo</h2>
              <Button size="small">Ultimos 30 dias</Button>
            </div>
            {trend.length ? <BarChart data={trend} /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin datos" />}
          </article>

          <article className="dashboard-panel">
            <div className="dashboard-panel-header">
              <h2>Estados de cotizacion</h2>
            </div>
            <DonutChart data={summary?.estadosCotizacion || []} />
            <div className="dashboard-updated">Actualizado hoy, {summary?.period?.updatedAt || '--:--'}</div>
          </article>
        </section>

        <section className="dashboard-quick-actions">
          <h2>Acciones Rapidas</h2>
          <div>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/cotizaciones/nueva')}>
              Nueva Cotizacion <ArrowRightOutlined />
            </Button>
            <Button icon={<ShoppingOutlined />} onClick={() => navigate('/productos/crear')}>
              Agregar Producto <ArrowRightOutlined />
            </Button>
            <Button icon={<UserAddOutlined />} onClick={() => navigate('/clientes/crear')}>
              Nuevo Cliente <ArrowRightOutlined />
            </Button>
            <Button icon={<FileTextOutlined />} onClick={() => navigate('/cotizaciones/historial')}>
              Ver Historial <ArrowRightOutlined />
            </Button>
          </div>
        </section>

        <section className="dashboard-recent">
          <div className="dashboard-panel-header">
            <h2>Ultimas Cotizaciones</h2>
            <Button type="link" onClick={() => navigate('/cotizaciones/historial')}>
              Ver todas <ArrowRightOutlined />
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={recent}
            rowKey="idCotizacion"
            pagination={false}
            size="middle"
            locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin cotizaciones" /> }}
            scroll={{ x: 760 }}
          />
        </section>
      </Spin>
    </div>
  )
}

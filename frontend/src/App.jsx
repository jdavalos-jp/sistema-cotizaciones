import { ConfigProvider } from 'antd'
import AppLayout from './layout/AppLayout.jsx'
import { CotizacionNueva } from './modules/cotizacion/components'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { antTheme } from './shared/theme/antTheme'

export default function App() {
  return (
    <ConfigProvider theme={antTheme}>
      <ErrorBoundary>
        <AppLayout>
          <CotizacionNueva />
        </AppLayout>
      </ErrorBoundary>
    </ConfigProvider>
  )
}

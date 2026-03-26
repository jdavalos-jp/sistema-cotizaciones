import React from 'react'
import { Button, Result } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'

/**
 * Error Boundary - Componente para capturar errores en React
 * Previene que la app entera se crashee si hay un error en un componente hijo
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error for debugging in development

    // Actualizar estado con detalles del error
    this.setState((prev) => ({
      error,
      errorInfo,
      errorCount: prev.errorCount + 1,
    }))

    // Opcionalmente, enviar a servicio de logging
    // logErrorToService(error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      const isDevelopment = import.meta.env.DEV
      const errorMessage = this.state.error?.message || 'Error desconocido'

      return (
        <div style={{ padding: '50px 20px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Result
            status="500"
            title="¡Algo salió mal!"
            subTitle={
              <div style={{ textAlign: 'left' }}>
                <p>{errorMessage}</p>
                {isDevelopment && this.state.errorInfo && (
                  <details style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Detalles del error (desarrollo)</summary>
                    <pre style={{ marginTop: '10px', fontSize: '12px', overflow: 'auto' }}>
                      {this.state.error.toString()}
                      {'\n\n'}
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            }
            extra={[
              <Button
                key="reset"
                type="primary"
                onClick={this.handleReset}
                icon={<ReloadOutlined />}
              >
                Reintentar
              </Button>,
              <Button
                key="reload"
                onClick={() => window.location.reload()}
              >
                Recargar página
              </Button>,
            ]}
          />
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

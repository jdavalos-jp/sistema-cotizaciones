import { ConfigProvider } from 'antd'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary.jsx'
//import { antTheme } from './shared/theme/antTheme'
import MainLayout from './layout/MainLayout.jsx'

// Páginas
import DashboardPage from './pages/Dashboard/DashboardPage.jsx'
import CatalogoPage from './pages/Catalogo/CatalogoPage.jsx'
import ProductosPage from './pages/Catalogo/ProductosPage.jsx'
import ProductoFormPage from './pages/Catalogo/ProductoFormPage.jsx'
import CategoriasPage from './pages/Catalogo/CategoriasPage.jsx'
import ComponentesPage from './pages/Catalogo/ComponentesPage.jsx'
import ComponenteFormPage from './pages/Catalogo/ComponenteFormPage.jsx'
import ClientesPage from './pages/Clientes/ClientesPage.jsx'
import ClienteFormPage from './pages/Clientes/ClienteFormPage.jsx'
import CotizacionNuevaPage from './pages/Cotizaciones/CotizacionNuevaPage.jsx'
import HistorialCotizacionesPage from './pages/Cotizaciones/HistorialCotizacionesPage.jsx'
import ProformasPage from './pages/Documentos/ProformasPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

/**
 * Componente raíz de la aplicación
 * - Configura el tema de Ant Design
 * - Establece las rutas con React Router v6
 * - Implementa error boundary para manejo de errores
 */
export default function App() {
  return (
   
      <ErrorBoundary>
        <Router>
          <Routes>
            {/* Rutas principales con layout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />

              {/* Catálogo */}
              <Route path="/catalogo" element={<CatalogoPage />} />
              <Route path="/productos" element={<ProductosPage />} />
              <Route path="/productos/crear" element={<ProductoFormPage />} />
              <Route path="/categorias" element={<CategoriasPage />} />
              <Route path="/componentes" element={<ComponentesPage />} />
              <Route path="/componentes/crear" element={<ComponenteFormPage />} />
              <Route path="/componentes/editar/:id" element={<ComponenteFormPage />} />

              {/* Clientes */}
              <Route path="/clientes" element={<ClientesPage />} />
              <Route path="/clientes/crear" element={<ClienteFormPage />} />
              <Route path="/clientes/editar/:id" element={<ClienteFormPage />} />

              {/* Cotizaciones */}
              <Route path="/cotizaciones/nueva" element={<CotizacionNuevaPage />} />
              <Route path="/cotizaciones/historial" element={<HistorialCotizacionesPage />} />
              <Route path="/proformas" element={<ProformasPage />} />
            </Route>

            {/* Página 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </ErrorBoundary>
  
  )
}

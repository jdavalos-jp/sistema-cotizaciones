import { ConfigProvider } from 'antd'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary.jsx'
//import { antTheme } from './shared/theme/antTheme'
import MainLayout from './layout/MainLayout.jsx'

// Páginas
import DashboardPage from './pages/Dashboard/DashboardPage.jsx'
import CatalogoPage from './modules/Catalogo/CatalogoPage.jsx'
import ProductosPage from './modules/Producto/ProductosPage.jsx'
import ProductoFormPage from './modules/Producto/ProductoFormPage.jsx'
import CategoriasPage from './modules/Categorias/CategoriasPage.jsx'
import ComponentesPage from './modules/Componentes/ComponentesPage.jsx'
import ComponenteFormPage from './modules/Componentes/ComponenteFormPage.jsx'
import ClientesPage from './modules/Clientes/ClientesPage.jsx'
import ClienteFormPage from './modules/Clientes/ClienteFormPage.jsx'
import CotizacionNuevaPage from './modules/cotizacion/CotizacionNuevaPage.jsx'
import HistorialCotizacionesPage from './modules/Historial_cotizaciones/HistorialCotizacionesPage.jsx'
import ProformasPage from './modules/Proformas/ProformasPage.jsx'
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
              <Route path="/productos/editar/:id" element={<ProductoFormPage />} />
              <Route path="/categorias" element={<CategoriasPage />} />
              <Route path="/categorias/crear" element={<CategoriasPage mode="crear" />} />
              <Route path="/categorias/editar/:id" element={<CategoriasPage mode="editar" />} />
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

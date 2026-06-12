import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import MainLayout from './layout/MainLayout.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import { ROLES, routeRoles } from './auth/accessControl.jsx'
import { useAuthUser } from './auth/useAuthUser.js'

import HomePage from './pages/Home/HomePage.jsx'
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
import AccessDeniedPage from './pages/AccessDeniedPage.jsx'
import AdminPlaceholderPage from './pages/AdminPlaceholderPage.jsx'
import UsuariosPage from './pages/Usuarios/UsuariosPage.jsx'

function PublicHomeRoute() {
  const user = useAuthUser()
  return user ? <Navigate to="/dashboard" replace /> : <HomePage />
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<PublicHomeRoute />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />

              <Route element={<ProtectedRoute allowedRoles={routeRoles['/productos']} />}>
                <Route path="/productos" element={<ProductosPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={routeRoles['/componentes']} />}>
                <Route path="/componentes" element={<ComponentesPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={routeRoles['/clientes']} />}>
                <Route path="/clientes" element={<ClientesPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={routeRoles['/clientes/crear']} />}>
                <Route path="/clientes/crear" element={<ClienteFormPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
                <Route path="/clientes/editar/:id" element={<ClienteFormPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={routeRoles['/cotizaciones/nueva']} />}>
                <Route path="/cotizaciones/nueva" element={<CotizacionNuevaPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={routeRoles['/cotizaciones/historial']} />}>
                <Route path="/cotizaciones/historial" element={<HistorialCotizacionesPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
                <Route path="/catalogo" element={<CatalogoPage />} />
                <Route path="/productos/crear" element={<ProductoFormPage />} />
                <Route path="/productos/editar/:id" element={<ProductoFormPage />} />
                <Route path="/categorias" element={<CategoriasPage />} />
                <Route path="/categorias/crear" element={<CategoriasPage mode="crear" />} />
                <Route path="/categorias/editar/:id" element={<CategoriasPage mode="editar" />} />
                <Route path="/componentes/crear" element={<ComponenteFormPage />} />
                <Route path="/componentes/editar/:id" element={<ComponenteFormPage />} />
                <Route path="/proformas" element={<ProformasPage />} />
                <Route path="/usuarios" element={<UsuariosPage />} />
                <Route path="/reportes" element={<AdminPlaceholderPage title="Reportes" />} />
                <Route path="/configuracion" element={<AdminPlaceholderPage title="Configuración" />} />
                <Route path="/inventario/stock" element={<AdminPlaceholderPage title="Stock" />} />
                <Route path="/inventario/movimientos" element={<AdminPlaceholderPage title="Movimientos" />} />
                <Route path="/descargas" element={<AdminPlaceholderPage title="Descargas" />} />
              </Route>

              <Route path="/acceso-denegado" element={<AccessDeniedPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  )
}

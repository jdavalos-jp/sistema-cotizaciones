import { Navigate, Outlet } from 'react-router-dom'
import { canAccessRoute } from './auth.js'
import { useAuthUser } from './useAuthUser.js'

export default function ProtectedRoute({ allowedRoles }) {
  const user = useAuthUser()

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (!canAccessRoute(user, allowedRoles)) {
    return <Navigate to="/acceso-denegado" replace />
  }

  return <Outlet />
}

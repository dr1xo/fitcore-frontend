import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '../hooks/useSession'

// Rutas de la aplicación: sin sesión iniciada, se va al login.
export function RequireSession() {
  const { usuario } = useSession()

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

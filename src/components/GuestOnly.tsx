import { Navigate, Outlet } from 'react-router-dom'
import { getHomeFor } from '../config/routes'
import { useSession } from '../hooks/useSession'
import { toProfile } from '../types/profile'

// Login y registro: si ya hay sesión, se va a la página de inicio del perfil.
export function GuestOnly() {
  const { usuario } = useSession()

  if (usuario) {
    return <Navigate to={getHomeFor(toProfile(usuario.perfil))} replace />
  }

  return <Outlet />
}

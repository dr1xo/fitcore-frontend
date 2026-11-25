import { toProfile } from '../types/profile'
import { useSession } from './useSession'

// El perfil sale del usuario logueado. Solo se usa dentro de rutas con sesión.
export function useProfile() {
  const { usuario } = useSession()
  if (!usuario) {
    throw new Error('useProfile requiere una sesión iniciada')
  }
  return { profile: toProfile(usuario.perfil) }
}

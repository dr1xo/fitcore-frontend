import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import type { Profile } from '../types/profile'

interface ProfileGuardProps {
  profiles: Profile[]
  children: ReactNode
}

// Si la sección no corresponde al perfil del usuario logueado, vuelve al inicio.
export function ProfileGuard({ profiles, children }: ProfileGuardProps) {
  const { profile } = useProfile()

  if (!profiles.includes(profile)) {
    return <Navigate to="/" replace />
  }

  return children
}

import { useState, type ReactNode } from 'react'
import type { Profile } from '../types/profile'
import { ProfileContext } from './ProfileContext'

// Mientras no exista el login, el perfil se simula con este estado.
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>('alumno')

  return (
    <ProfileContext value={{ profile, setProfile }}>{children}</ProfileContext>
  )
}

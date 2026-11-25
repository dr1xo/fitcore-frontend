import type { PerfilUsuario } from '../models/usuario'

export type Profile = 'alumno' | 'profesor' | 'administracion'

export const PROFILES: { value: Profile; label: string }[] = [
  { value: 'alumno', label: 'Alumno' },
  { value: 'profesor', label: 'Profesor' },
  { value: 'administracion', label: 'Administración' },
]

// El back usa el nombre del perfil ("Administración"); el front, un valor sin tildes.
const PROFILE_BY_PERFIL: Record<PerfilUsuario, Profile> = {
  Alumno: 'alumno',
  Profesor: 'profesor',
  Administración: 'administracion',
}

export function toProfile(perfil: PerfilUsuario): Profile {
  return PROFILE_BY_PERFIL[perfil]
}

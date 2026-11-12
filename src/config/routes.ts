import type { Profile } from '../types/profile'

export interface AppRoute {
  path: string
  label: string
  description: string
  profiles: Profile[]
}

const ALL: Profile[] = ['alumno', 'profesor', 'administracion']

// Fuente única de las secciones: de acá salen las rutas y el menú de cada perfil.
export const APP_ROUTES: AppRoute[] = [
  { path: '/', label: 'Inicio', description: 'Resumen general', profiles: ALL },
  {
    path: '/clases',
    label: 'Clases',
    description: 'Mirá los horarios y anotate a una clase',
    profiles: ['alumno'],
  },
  {
    path: '/mis-reservas',
    label: 'Mis reservas',
    description: 'Clases a las que ya estás anotado',
    profiles: ['alumno'],
  },
  {
    path: '/perfil',
    label: 'Mi perfil',
    description: 'Tus datos personales',
    profiles: ['alumno', 'profesor'],
  },
  {
    path: '/mis-clases',
    label: 'Mis clases',
    description: 'Clases que tenés a cargo',
    profiles: ['profesor'],
  },
  {
    path: '/alumnos',
    label: 'Alumnos inscriptos',
    description: 'Quién se anotó a cada clase',
    profiles: ['profesor'],
  },
  {
    path: '/usuarios',
    label: 'Usuarios',
    description: 'Alta, baja y modificación de usuarios',
    profiles: ['administracion'],
  },
  {
    path: '/gestion-clases',
    label: 'Gestión de clases',
    description: 'Horarios, cupos y disciplinas',
    profiles: ['administracion'],
  },
  {
    path: '/profesores',
    label: 'Profesores',
    description: 'Listado y asignación de profesores',
    profiles: ['administracion'],
  },
  {
    path: '/reportes',
    label: 'Reportes',
    description: 'Asistencia y ocupación de clases',
    profiles: ['administracion'],
  },
]

export function getMenuFor(profile: Profile): AppRoute[] {
  return APP_ROUTES.filter((route) => route.profiles.includes(profile))
}

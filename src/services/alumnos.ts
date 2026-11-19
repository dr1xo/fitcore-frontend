import type { Alumno, AlumnoEstado } from '../types/alumno'
import type { ItemResponse, PaginatedResponse } from '../types/api'
import { apiGet } from './api'

export interface AlumnosQuery {
  page: number
  limit: number
  search: string
  estado: '' | AlumnoEstado // '' = todos
}

// GET /alumnos?page=1&limit=10&search=gomez&estado=activo
export function getAlumnos(
  query: AlumnosQuery,
  signal?: AbortSignal,
): Promise<PaginatedResponse<Alumno>> {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  })
  if (query.search) params.set('search', query.search)
  if (query.estado) params.set('estado', query.estado)

  return apiGet<PaginatedResponse<Alumno>>(`/alumnos?${params}`, signal)
}

// GET /alumnos/:id
export async function getAlumno(
  id: string,
  signal?: AbortSignal,
): Promise<Alumno> {
  const response = await apiGet<ItemResponse<Alumno>>(
    `/alumnos/${encodeURIComponent(id)}`,
    signal,
  )
  return response.data
}

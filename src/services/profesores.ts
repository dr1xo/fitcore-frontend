import type { Profesor, ProfesorDetalle } from '../models/profesor'
import type { PaginatedResponse } from '../types/api'
import { apiGet, apiRequest } from './api'

export interface ProfesoresQuery {
  page: number
  limit: number
  search: string
  especialidad: string
}

export function getProfesores(
  query: ProfesoresQuery,
  signal?: AbortSignal,
): Promise<PaginatedResponse<Profesor>> {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  })

  if (query.search) {
    params.set('search', query.search)
  }

  if (query.especialidad) {
    params.set('especialidad', query.especialidad)
  }

  return apiGet<PaginatedResponse<Profesor>>(`/profesores?${params}`, signal)
}

export type ActualizarProfesorDTO = Omit<Profesor, 'id'>

export function getProfesorPorId(
  id: number,
  signal?: AbortSignal,
): Promise<{ data: ProfesorDetalle }> {
  return apiGet<{ data: ProfesorDetalle }>(
    `/profesores/${id}`,
    signal,
  )
}

export function actualizarProfesor(
  id: number,
  datos: ActualizarProfesorDTO,
): Promise<{ data: Profesor }> {
  return apiRequest<{ data: Profesor }>(
    `/profesores/${id}`,
    {
      method: 'PUT',
      body: datos,
    },
  )
}

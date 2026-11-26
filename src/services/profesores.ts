import type { Profesor } from '../models/profesor'
import type { PaginatedResponse } from '../types/api'
import { apiGet } from './api'

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

import type { Horario, DiaSemana } from '../models/horario'
import type { PaginatedResponse } from '../types/api'
import { apiRequest, ApiError } from './api'
import { loadSession } from './session'

export interface HorariosQuery {
  page: number
  limit: number
  claseId: string
  diaSemana: '' | DiaSemana
  profesorId: string
}

export function getHorarios(
  query: HorariosQuery,
  signal?: AbortSignal,
): Promise<PaginatedResponse<Horario>> {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  })

  if (query.claseId) {
    params.set('claseId', query.claseId)
  }

  if (query.diaSemana) {
    params.set('diaSemana', query.diaSemana)
  }

  if (query.profesorId) {
    params.set('profesorId', query.profesorId)
  }

  const session = loadSession()

  if (!session) {
    return Promise.reject(new ApiError('No hay sesión iniciada', 401))
  }

  return apiRequest<PaginatedResponse<Horario>>(`/horarios?${params}`, {
    signal,
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
  })
}

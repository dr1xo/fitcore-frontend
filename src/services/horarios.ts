import type { Horario, DiaSemana } from '../models/horario'
import type { PaginatedResponse } from '../types/api'
import { apiRequest, ApiError } from './api'
import { loadSession } from './session'
import type { Clase } from '../models/clase'

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

export async function getClasesParaHorarios(
  signal?: AbortSignal,
): Promise<Clase[]> {
  const session = loadSession()

  if (!session) {
    throw new ApiError('No hay sesión iniciada', 401)
  }

  const clases: Clase[] = []
  let page = 1
  let totalPages = 1

  do {
    const params = new URLSearchParams({
      page: String(page),
      limit: '100',
    })

    const response = await apiRequest<PaginatedResponse<Clase>>(
      `/clases?${params}`,
      {
        signal,
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      },
    )

    clases.push(...response.data)
    totalPages = response.meta.totalPages
    page++
  } while (page <= totalPages)

  return clases
}

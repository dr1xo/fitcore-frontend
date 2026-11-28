import type { Clase, ClaseDetalle } from '../models/clase'
import type { Horario } from '../models/horario'
import type { ItemResponse, PaginatedResponse } from '../types/api'
import { apiGet, apiRequest } from './api'

export interface ClasesQuery {
  page: number
  limit: number
  search?: string
  tipo?: string
  profesorId?: number
  diaSemana?: Horario['diaSemana']
  conCupo?: boolean
  sortBy?: 'id' | 'nombre' | 'tipo' | 'cupoMaximo' | 'cuposDisponibles'
  order?: 'asc' | 'desc'
}

export interface ActualizarClaseDTO {
  nombre: string
  tipo: string
  cupoMaximo: number
  profesorId: number
}

export function getClases(
  query: ClasesQuery,
  signal?: AbortSignal,
): Promise<PaginatedResponse<Clase>> {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  })

  if (query.search?.trim()) {
    params.set('search', query.search.trim())
  }

  if (query.tipo?.trim()) {
    params.set('tipo', query.tipo.trim())
  }

  if (query.profesorId !== undefined) {
    params.set('profesorId', String(query.profesorId))
  }

  if (query.diaSemana) {
    params.set('diaSemana', query.diaSemana)
  }

  if (query.conCupo !== undefined) {
    params.set('conCupo', String(query.conCupo))
  }

  if (query.sortBy) {
    params.set('sortBy', query.sortBy)
  }

  if (query.order) {
    params.set('order', query.order)
  }

  return apiGet<PaginatedResponse<Clase>>(
    `/clases?${params}`,
    signal,
  )
}

export async function getClase(
  id: string,
  signal?: AbortSignal,
): Promise<ClaseDetalle> {
  const response = await apiGet<ItemResponse<ClaseDetalle>>(
    `/clases/${encodeURIComponent(id)}`,
    signal,
  )

  return response.data
}

export async function actualizarClase(
  id: string,
  datos: ActualizarClaseDTO,
  signal?: AbortSignal,
): Promise<Clase> {
  const response = await apiRequest<ItemResponse<Clase>>(
    `/clases/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: datos,
      signal,
    },
  )

  return response.data
}
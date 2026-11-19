import type { PaginatedResponse, ItemResponse } from '../types/api'
import type { Cuota, CuotaEstado } from '../types/cuota'
import { apiGet } from './api'

export interface CuotasQuery {
  page: number
  limit: number
  alumnoId: string // '' = todos
  periodo: string // AAAA-MM, '' = todos
  estado: '' | CuotaEstado
}

// GET /cuotas?page=1&limit=10&alumnoId=15&periodo=2026-11&estado=vencida
export function getCuotas(
  query: CuotasQuery,
  signal?: AbortSignal,
): Promise<PaginatedResponse<Cuota>> {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  })
  if (query.alumnoId) params.set('alumnoId', query.alumnoId)
  if (query.periodo) params.set('periodo', query.periodo)
  if (query.estado) params.set('estado', query.estado)

  return apiGet<PaginatedResponse<Cuota>>(`/cuotas?${params}`, signal)
}

// GET /cuotas/:id
export async function getCuota(
  id: string,
  signal?: AbortSignal,
): Promise<Cuota> {
  const response = await apiGet<ItemResponse<Cuota>>(
    `/cuotas/${encodeURIComponent(id)}`,
    signal,
  )
  return response.data
}

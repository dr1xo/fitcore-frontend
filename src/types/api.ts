// Formatos de respuesta definidos en el contrato de la API (docs/contrato-api.md del back).
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface ItemResponse<T> {
  data: T
}

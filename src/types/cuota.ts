export type CuotaEstado = 'pagada' | 'pendiente' | 'vencida'

export const CUOTA_ESTADO_LABEL: Record<CuotaEstado, string> = {
  pagada: 'Pagada',
  pendiente: 'Pendiente',
  vencida: 'Vencida',
}

export interface CuotaAlumno {
  id: number
  nombre: string
  apellido: string
}

export interface CuotaPago {
  id: number
  fechaPago: string // AAAA-MM-DD
  medioPago: string
}

export interface Cuota {
  id: number
  alumno: CuotaAlumno
  periodo: string // AAAA-MM
  monto: number
  fechaVencimiento: string // AAAA-MM-DD
  estado: CuotaEstado // lo calcula el back
  pago: CuotaPago | null
}

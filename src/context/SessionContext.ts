import { createContext } from 'react'
import type { Usuario } from '../models/usuario'

export interface SessionContextValue {
  usuario: Usuario | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (nombre: string, email: string, password: string) => Promise<void>
  logout: () => void
}

export const SessionContext = createContext<SessionContextValue | null>(null)

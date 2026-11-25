import type { Session } from './auth'

// La sesión se guarda en localStorage para que no se pierda al recargar la página.
const STORAGE_KEY = 'fitcore.session'

// Lee la fecha de vencimiento (exp, en segundos) que viene dentro del token.
function isExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const { exp } = JSON.parse(json) as { exp?: unknown }
    return typeof exp !== 'number' || exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

export function saveSession(session: Session): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

// Devuelve la sesión guardada, o null si no hay, está dañada o el token venció.
export function loadSession(): Session | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const session = JSON.parse(stored) as Session
    if (!session?.token || !session.usuario || isExpired(session.token)) {
      clearSession()
      return null
    }
    return session
  } catch {
    clearSession()
    return null
  }
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY)
}

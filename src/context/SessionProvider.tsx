import { useState, type ReactNode } from 'react'
import { loginUser, registerUser, type Session } from '../services/auth'
import { clearSession, loadSession, saveSession } from '../services/session'
import { SessionContext } from './SessionContext'

// Guarda quién está logueado. Al abrir la página recupera la sesión guardada.
export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(loadSession)

  function start(nextSession: Session) {
    saveSession(nextSession)
    setSession(nextSession)
  }

  async function login(email: string, password: string) {
    start(await loginUser(email, password))
  }

  async function register(nombre: string, email: string, password: string) {
    start(await registerUser(nombre, email, password))
  }

  function logout() {
    clearSession()
    setSession(null)
  }

  return (
    <SessionContext
      value={{
        usuario: session?.usuario ?? null,
        token: session?.token ?? null,
        login,
        register,
        logout,
      }}
    >
      {children}
    </SessionContext>
  )
}

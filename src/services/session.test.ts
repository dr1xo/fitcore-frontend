import { afterEach, describe, expect, it } from 'vitest'
import { fakeToken } from '../test/tokens'
import { clearSession, loadSession, saveSession } from './session'

const usuario = {
  id: 1,
  nombre: 'Ana Pérez',
  email: 'admin@fitcore.com',
  perfil: 'Administración' as const,
  activo: true,
}

describe('session', () => {
  afterEach(() => localStorage.clear())

  it('guarda y recupera la sesión', () => {
    const session = { token: fakeToken(), usuario }

    saveSession(session)

    expect(loadSession()).toEqual(session)
  })

  it('no hay sesión después de cerrarla', () => {
    saveSession({ token: fakeToken(), usuario })

    clearSession()

    expect(loadSession()).toBeNull()
  })

  it('descarta la sesión si el token venció', () => {
    saveSession({ token: fakeToken(-60), usuario })

    expect(loadSession()).toBeNull()
    expect(localStorage.length).toBe(0)
  })

  it('descarta datos guardados que no son una sesión válida', () => {
    localStorage.setItem('fitcore.session', 'esto no es JSON')
    expect(loadSession()).toBeNull()

    saveSession({ token: 'token-sin-formato', usuario })
    expect(loadSession()).toBeNull()
  })
})

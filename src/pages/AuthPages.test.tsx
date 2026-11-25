import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from '../AppRoutes'
import { SessionProvider } from '../context/SessionProvider'
import type { Usuario } from '../models/usuario'
import { ApiError } from '../services/api'
import { loginUser, registerUser } from '../services/auth'
import { saveSession } from '../services/session'
import { fakeToken } from '../test/tokens'

vi.mock('../services/auth', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}))

const alumna: Usuario = {
  id: 11,
  nombre: 'Lucía Gómez',
  email: 'lucia.gomez88@gmail.com',
  perfil: 'Alumno',
  activo: true,
}
const admin: Usuario = {
  id: 1,
  nombre: 'Ana Pérez',
  email: 'admin@fitcore.com',
  perfil: 'Administración',
  activo: true,
}
const profesor: Usuario = {
  id: 101,
  nombre: 'Federico Martínez',
  email: 'federico.martinez@gmail.com',
  perfil: 'Profesor',
  activo: true,
}

function renderApp(path: string) {
  return render(
    <SessionProvider>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </SessionProvider>,
  )
}

async function fillLogin(email: string, password: string) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText(/Email/), email)
  await user.type(screen.getByLabelText(/Contraseña/), password)
  await user.click(screen.getByRole('button', { name: 'Ingresar' }))
}

beforeEach(() => {
  vi.mocked(loginUser).mockReset()
  vi.mocked(registerUser).mockReset()
})

afterEach(() => localStorage.clear())

describe('Login', () => {
  it('sin sesión, una ruta de la aplicación lleva al login', () => {
    renderApp('/clases')

    expect(
      screen.getByRole('heading', { name: 'Iniciar sesión' }),
    ).toBeInTheDocument()
  })

  it('muestra los errores de validación y no llama al back', async () => {
    renderApp('/login')

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(screen.getByText('Ingresá tu email')).toBeInTheDocument()
    expect(screen.getByText('Ingresá tu contraseña')).toBeInTheDocument()
    expect(loginUser).not.toHaveBeenCalled()
  })

  it('avisa si el email no tiene formato válido', async () => {
    renderApp('/login')

    await fillLogin('lucia', 'secreto123')

    expect(screen.getByText('Ingresá un email válido')).toBeInTheDocument()
    expect(loginUser).not.toHaveBeenCalled()
  })

  it('muestra el mensaje del back si las credenciales son incorrectas', async () => {
    vi.mocked(loginUser).mockRejectedValue(
      new ApiError('Email o contraseña incorrectos', 401),
    )
    renderApp('/login')

    await fillLogin('lucia.gomez88@gmail.com', 'otra-clave')

    expect(
      await screen.findByText('Email o contraseña incorrectos'),
    ).toBeInTheDocument()
    expect(localStorage.length).toBe(0)
  })

  it.each([
    [alumna, 'Clases'],
    [profesor, 'Mis clases'],
    [admin, 'Bienvenido a FitCore'],
  ])('redirige según el perfil (%s.perfil)', async (usuario, titulo) => {
    vi.mocked(loginUser).mockResolvedValue({ token: fakeToken(), usuario })
    renderApp('/login')

    await fillLogin(usuario.email, 'secreto123')

    expect(
      await screen.findByRole('heading', { level: 1, name: titulo }),
    ).toBeInTheDocument()
    expect(loginUser).toHaveBeenCalledWith(usuario.email, 'secreto123')
    expect(screen.getByText(usuario.nombre)).toBeInTheDocument()
  })

  it('cerrar sesión vuelve al login y borra la sesión guardada', async () => {
    saveSession({ token: fakeToken(), usuario: alumna })
    renderApp('/clases')

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    expect(
      screen.getByRole('heading', { name: 'Iniciar sesión' }),
    ).toBeInTheDocument()
    expect(localStorage.length).toBe(0)
  })

  it('con sesión iniciada, entrar al login lleva a la página del perfil', () => {
    saveSession({ token: fakeToken(), usuario: profesor })
    renderApp('/login')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Mis clases' }),
    ).toBeInTheDocument()
  })
})

describe('Registro', () => {
  async function fillRegister(nombre: string, email: string, password: string) {
    const user = userEvent.setup()
    if (nombre) await user.type(screen.getByLabelText(/Nombre/), nombre)
    if (email) await user.type(screen.getByLabelText(/Email/), email)
    if (password) await user.type(screen.getByLabelText(/Contraseña/), password)
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
  }

  it('valida los campos antes de enviar', async () => {
    renderApp('/registro')

    await fillRegister('', 'juan@mail.com', 'corta')

    expect(screen.getByText('Ingresá tu nombre')).toBeInTheDocument()
    expect(
      screen.getByText('La contraseña debe tener al menos 8 caracteres'),
    ).toBeInTheDocument()
    expect(registerUser).not.toHaveBeenCalled()
  })

  it('muestra el mensaje del back si el email ya existe', async () => {
    vi.mocked(registerUser).mockRejectedValue(
      new ApiError('Ya existe un usuario con ese email', 409),
    )
    renderApp('/registro')

    await fillRegister('Juan Gómez', 'juan@mail.com', 'clave1234')

    expect(
      await screen.findByText('Ya existe un usuario con ese email'),
    ).toBeInTheDocument()
  })

  it('al registrarse queda logueado como alumno', async () => {
    const nuevo: Usuario = {
      id: 131,
      nombre: 'Juan Gómez',
      email: 'juan@mail.com',
      perfil: 'Alumno',
      activo: true,
    }
    vi.mocked(registerUser).mockResolvedValue({
      token: fakeToken(),
      usuario: nuevo,
    })
    renderApp('/registro')

    await fillRegister('Juan Gómez', 'juan@mail.com', 'clave1234')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Clases' }),
    ).toBeInTheDocument()
    expect(registerUser).toHaveBeenCalledWith(
      'Juan Gómez',
      'juan@mail.com',
      'clave1234',
    )
  })
})

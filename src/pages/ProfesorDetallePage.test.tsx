import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { getProfesorPorId, actualizarProfesor } from '../services/profesores'
import { ProfesorDetallePage } from './ProfesorDetallePage'
import type { ProfesorDetalle } from '../models/profesor'

vi.mock('../services/profesores', () => ({
  getProfesorPorId: vi.fn(),
  actualizarProfesor: vi.fn(),
}))

const profesor: ProfesorDetalle = {
  id: 7,
  usuarioId: 107,
  dni: '29765432',
  nombre: 'Lucas',
  apellido: 'Romero',
  email: 'lucas@example.com',
  telefono: '2914567890',
  especialidad: 'Funcional',
  clases: [
    {
      id: 1,
      nombre: 'Entrenamiento funcional',
    },
  ],
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/profesores/7']}>
      <Routes>
        <Route path="/profesores/:id" element={<ProfesorDetallePage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProfesorDetallePage', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    vi.mocked(getProfesorPorId).mockResolvedValue({
      data: profesor,
    })
  })

  it('muestra un indicador mientras carga el profesor', () => {
    vi.mocked(getProfesorPorId).mockImplementation(() => new Promise(() => {}))

    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent('Cargando')
  })

  it('consulta el profesor utilizando el ID de la URL', async () => {
    renderPage()

    await screen.findByLabelText(/^Nombre/)

    expect(getProfesorPorId).toHaveBeenCalledWith(7, expect.any(AbortSignal))
  })

  it('muestra los datos del profesor en modo lectura', async () => {
    renderPage()

    expect(await screen.findByLabelText(/^Nombre/)).toHaveValue('Lucas')
    expect(screen.getByLabelText(/^Apellido/)).toHaveValue('Romero')
    expect(screen.getByLabelText(/^DNI/)).toHaveValue('29765432')
    expect(screen.getByLabelText(/^Email/)).toHaveValue('lucas@example.com')
    expect(screen.getByLabelText(/^Teléfono/)).toHaveValue('2914567890')
    expect(screen.getByLabelText(/^Especialidad/)).toHaveValue('Funcional')

    expect(screen.getByLabelText(/^Nombre/)).toBeDisabled()
    expect(screen.getByLabelText(/^Especialidad/)).toBeDisabled()

    expect(screen.getByText('Entrenamiento funcional')).toBeInTheDocument()
  })

  it('habilita los campos al presionar Editar', async () => {
    const user = userEvent.setup()

    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Editar' }))

    expect(screen.getByLabelText(/^Nombre/)).toBeEnabled()
    expect(screen.getByLabelText(/^Especialidad/)).toBeEnabled()

    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })

  it('descarta los cambios al cancelar la edición', async () => {
    const user = userEvent.setup()

    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Editar' }))

    const nombre = screen.getByLabelText(/^Nombre/)

    await user.clear(nombre)
    await user.type(nombre, 'Juan')

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.getByLabelText(/^Nombre/)).toHaveValue('Lucas')
    expect(screen.getByLabelText(/^Nombre/)).toBeDisabled()
    expect(actualizarProfesor).not.toHaveBeenCalled()
  })

  it('guarda los cambios realizados en el profesor', async () => {
    const user = userEvent.setup()

    vi.mocked(actualizarProfesor).mockResolvedValue({
      data: {
        ...profesor,
        especialidad: 'Boxeo',
      },
    })

    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Editar' }))

    const especialidad = screen.getByLabelText(/^Especialidad/)

    await user.clear(especialidad)
    await user.type(especialidad, 'Boxeo')

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(actualizarProfesor).toHaveBeenCalledWith(7, {
      usuarioId: 107,
      dni: '29765432',
      nombre: 'Lucas',
      apellido: 'Romero',
      email: 'lucas@example.com',
      telefono: '2914567890',
      especialidad: 'Boxeo',
    })

    expect(
      await screen.findByRole('button', { name: 'Editar' }),
    ).toBeInTheDocument()

    expect(screen.getByLabelText(/^Especialidad/)).toHaveValue('Boxeo')
    expect(screen.getByLabelText(/^Especialidad/)).toBeDisabled()
  })

  it('muestra un error cuando falla la consulta', async () => {
    vi.mocked(getProfesorPorId).mockRejectedValue(
      new Error('Error de conexión'),
    )

    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo conectar con el servidor.',
    )
  })

  it('muestra un error cuando falla el guardado', async () => {
    const user = userEvent.setup()

    vi.mocked(actualizarProfesor).mockRejectedValue(
      new Error('Error de conexión'),
    )

    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Editar' }))

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo guardar el profesor.',
    )

    expect(screen.getByLabelText(/^Nombre/)).toBeEnabled()
  })

  it('no permite guardar si falta un campo obligatorio', async () => {
    const user = userEvent.setup()

    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Editar' }))

    await user.clear(screen.getByLabelText(/^Nombre/))

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(actualizarProfesor).not.toHaveBeenCalled()
    expect(screen.getByLabelText(/^Nombre/)).toBeInvalid()
  })
})

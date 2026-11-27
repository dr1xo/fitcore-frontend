import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { HorarioDetallePage } from './HorarioDetallePage'
import {
  getHorarioById,
  updateHorario,
  getClasesParaHorarios,
} from '../services/horarios'
import { ApiError } from '../services/api'
import type { Horario } from '../models/horario'
import type { Clase } from '../models/clase'

vi.mock('../services/horarios', () => ({
  getHorarioById: vi.fn(),
  updateHorario: vi.fn(),
  getClasesParaHorarios: vi.fn(),
}))

const horario: Horario = {
  id: 1,
  claseId: 3,
  diaSemana: 'lunes',
  horaInicio: '09:00',
  horaFin: '10:00',
}

const clase: Clase = {
  id: 3,
  nombre: 'Funcional',
  tipo: 'Funcional',
  cupoMaximo: 20,
  cuposOcupados: 10,
  cuposDisponibles: 10,
  profesor: {
    id: 2,
    nombre: 'Juan',
    apellido: 'Pérez',
  },
}

function renderPagina() {
  return render(
    <MemoryRouter initialEntries={['/horarios/1']}>
      <Routes>
        <Route path="/horarios/:id" element={<HorarioDetallePage />} />

        <Route path="/horarios" element={<h1>Listado de horarios</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('HorarioDetallePage', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    vi.mocked(getHorarioById).mockResolvedValue(horario)
    vi.mocked(getClasesParaHorarios).mockResolvedValue([clase])
  })

  it('consulta el horario utilizando el ID de la ruta', async () => {
    renderPagina()

    await screen.findByLabelText(/Día de semana/i)

    expect(getHorarioById).toHaveBeenCalledWith(1, expect.any(AbortSignal))
  })

  it('muestra los datos del horario seleccionado', async () => {
    renderPagina()

    expect(await screen.findByLabelText(/Día de semana/i)).toHaveValue('lunes')

    expect(screen.getByLabelText(/Hora de inicio/i)).toHaveValue('09:00')

    expect(screen.getByLabelText(/Hora de fin/i)).toHaveValue('10:00')
  })

  it('muestra el nombre de la clase y del profesor', async () => {
    renderPagina()

    await waitFor(() => {
      expect(screen.getByLabelText('Clase')).toHaveValue('Funcional')

      expect(screen.getByLabelText('Profesor')).toHaveValue('Juan Pérez')
    })
  })

  it('muestra inicialmente el formulario en modo visualización', async () => {
    renderPagina()

    await screen.findByRole('button', { name: 'Editar' })

    expect(screen.getByLabelText(/Día de semana/i)).toBeDisabled()
    expect(screen.getByLabelText(/Hora de inicio/i)).toBeDisabled()
    expect(screen.getByLabelText(/Hora de fin/i)).toBeDisabled()

    expect(
      screen.queryByRole('button', { name: 'Guardar' }),
    ).not.toBeInTheDocument()
  })

  it('habilita los campos editables al presionar Editar', async () => {
    const user = userEvent.setup()

    renderPagina()

    await user.click(await screen.findByRole('button', { name: 'Editar' }))

    expect(screen.getByLabelText(/Día de semana/i)).toBeEnabled()
    expect(screen.getByLabelText(/Hora de inicio/i)).toBeEnabled()
    expect(screen.getByLabelText(/Hora de fin/i)).toBeEnabled()

    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })

  it('mantiene la clase y el profesor deshabilitados durante la edición', async () => {
    const user = userEvent.setup()

    renderPagina()

    await user.click(await screen.findByRole('button', { name: 'Editar' }))

    expect(screen.getByLabelText('Clase')).toBeDisabled()
    expect(screen.getByLabelText('Profesor')).toBeDisabled()
  })

  it('restaura los valores originales al cancelar la edición', async () => {
    const user = userEvent.setup()

    renderPagina()

    await user.click(await screen.findByRole('button', { name: 'Editar' }))

    await user.selectOptions(screen.getByLabelText(/Día de semana/i), 'martes')

    fireEvent.change(screen.getByLabelText(/Hora de inicio/i), {
      target: { value: '08:00' },
    })

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.getByLabelText(/Día de semana/i)).toHaveValue('lunes')

    expect(screen.getByLabelText(/Hora de inicio/i)).toHaveValue('09:00')

    expect(screen.getByLabelText(/Día de semana/i)).toBeDisabled()

    expect(updateHorario).not.toHaveBeenCalled()
  })

  it('guarda los cambios y vuelve al modo visualización', async () => {
    const user = userEvent.setup()

    vi.mocked(updateHorario).mockResolvedValue({
      ...horario,
      diaSemana: 'martes',
      horaInicio: '10:00',
      horaFin: '11:00',
    })

    renderPagina()

    await user.click(await screen.findByRole('button', { name: 'Editar' }))

    await user.selectOptions(screen.getByLabelText(/Día de semana/i), 'martes')

    fireEvent.change(screen.getByLabelText(/Hora de inicio/i), {
      target: { value: '10:00' },
    })

    fireEvent.change(screen.getByLabelText(/Hora de fin/i), {
      target: { value: '11:00' },
    })

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => {
      expect(updateHorario).toHaveBeenCalledWith(1, {
        diaSemana: 'martes',
        horaInicio: '10:00',
        horaFin: '11:00',
      })
    })

    await screen.findByRole('button', { name: 'Editar' })

    expect(screen.getByLabelText(/Día de semana/i)).toHaveValue('martes')

    expect(screen.getByLabelText(/Hora de inicio/i)).toHaveValue('10:00')

    expect(screen.getByLabelText(/Hora de fin/i)).toHaveValue('11:00')

    expect(screen.getByLabelText(/Día de semana/i)).toBeDisabled()
  })

  it('rechaza una hora de fin anterior a la hora de inicio', async () => {
    const user = userEvent.setup()

    renderPagina()

    await user.click(await screen.findByRole('button', { name: 'Editar' }))

    fireEvent.change(screen.getByLabelText(/Hora de fin/i), {
      target: { value: '08:00' },
    })

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(
      await screen.findByText(
        'La hora de fin debe ser posterior a la hora de inicio.',
      ),
    ).toBeInTheDocument()

    expect(updateHorario).not.toHaveBeenCalled()
  })

  it('rechaza horarios con la misma hora de inicio y fin', async () => {
    const user = userEvent.setup()

    renderPagina()

    await user.click(await screen.findByRole('button', { name: 'Editar' }))

    fireEvent.change(screen.getByLabelText(/Hora de fin/i), {
      target: { value: '09:00' },
    })

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(
      await screen.findByText(
        'La hora de fin debe ser posterior a la hora de inicio.',
      ),
    ).toBeInTheDocument()

    expect(updateHorario).not.toHaveBeenCalled()
  })

  it('muestra un error cuando no existe el horario', async () => {
    vi.mocked(getHorarioById).mockRejectedValue(
      new ApiError('Horario no encontrado', 404),
    )

    renderPagina()

    expect(await screen.findByText('Horario no encontrado')).toBeInTheDocument()

    expect(
      screen.queryByRole('button', { name: 'Editar' }),
    ).not.toBeInTheDocument()
  })

  it('permite consultar el horario aunque falle la carga de clases', async () => {
    vi.mocked(getClasesParaHorarios).mockRejectedValue(
      new ApiError('No se pudieron obtener las clases', 500),
    )

    renderPagina()

    expect(
      await screen.findByText('No se pudieron obtener las clases'),
    ).toBeInTheDocument()

    expect(await screen.findByLabelText(/Día de semana/i)).toHaveValue('lunes')

    expect(screen.getByLabelText('Clase')).toHaveValue('Clase no disponible')
  })

  it('muestra un error de guardado y mantiene el modo edición', async () => {
    const user = userEvent.setup()

    vi.mocked(updateHorario).mockRejectedValue(
      new ApiError('No se pudo actualizar el horario', 400),
    )

    renderPagina()

    await user.click(await screen.findByRole('button', { name: 'Editar' }))

    await user.selectOptions(screen.getByLabelText(/Día de semana/i), 'viernes')

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(
      await screen.findByText('No se pudo actualizar el horario'),
    ).toBeInTheDocument()

    expect(screen.getByLabelText(/Día de semana/i)).toBeEnabled()

    expect(screen.getByLabelText(/Día de semana/i)).toHaveValue('viernes')

    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })

  it('permite volver al listado de horarios', async () => {
    const user = userEvent.setup()

    renderPagina()

    await screen.findByRole('button', { name: 'Editar' })

    await user.click(screen.getByRole('button', { name: 'Volver al listado' }))

    expect(
      await screen.findByRole('heading', {
        name: 'Listado de horarios',
      }),
    ).toBeInTheDocument()
  })
})

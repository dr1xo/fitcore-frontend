import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { HorariosPage } from './HorariosPage'
import { getHorarios } from '../services/horarios'
import { ApiError } from '../services/api'
import type { Horario } from '../models/horario'

vi.mock('../services/horarios', () => ({
  getHorarios: vi.fn(),
}))

const horarios: Horario[] = [
  {
    id: 1,
    claseId: 3,
    diaSemana: 'lunes',
    horaInicio: '09:00',
    horaFin: '10:00',
  },
  {
    id: 2,
    claseId: 5,
    diaSemana: 'viernes',
    horaInicio: '18:00',
    horaFin: '19:00',
  },
]

const respuesta = {
  data: horarios,
  meta: {
    page: 1,
    limit: 10,
    total: 25,
    totalPages: 3,
  },
}

function renderPagina() {
  return render(
    <MemoryRouter initialEntries={['/horarios']}>
      <Routes>
        <Route path="/horarios" element={<HorariosPage />} />
        <Route path="/horarios/:id" element={<h1>Detalle de horario</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('HorariosPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(getHorarios).mockResolvedValue(respuesta)
  })

  it('muestra el listado de horarios', async () => {
    renderPagina()

    expect(
      screen.getByRole('heading', { name: 'Horarios' }),
    ).toBeInTheDocument()

    expect(await screen.findByText('09:00')).toBeInTheDocument()
    expect(screen.getByText('18:00')).toBeInTheDocument()
  })

  it('consulta inicialmente la primera página', async () => {
    renderPagina()

    await waitFor(() => {
      expect(getHorarios).toHaveBeenCalledWith(
        {
          page: 1,
          limit: 10,
          claseId: '',
          diaSemana: '',
          profesorId: '',
        },
        expect.any(AbortSignal),
      )
    })
  })

  it('permite filtrar por clase', async () => {
    const user = userEvent.setup()

    renderPagina()

    await user.type(screen.getByPlaceholderText('ID de la clase'), '3')

    await waitFor(() => {
      expect(getHorarios).toHaveBeenLastCalledWith(
        expect.objectContaining({
          claseId: '3',
          page: 1,
        }),
        expect.any(AbortSignal),
      )
    })
  })

  it('permite filtrar por profesor', async () => {
    const user = userEvent.setup()

    renderPagina()

    await user.type(screen.getByPlaceholderText('ID del profesor'), '2')

    await waitFor(() => {
      expect(getHorarios).toHaveBeenLastCalledWith(
        expect.objectContaining({
          profesorId: '2',
          page: 1,
        }),
        expect.any(AbortSignal),
      )
    })
  })

  it('permite filtrar por día de semana', async () => {
    const user = userEvent.setup()

    renderPagina()

    await user.selectOptions(screen.getByLabelText('Día de semana'), 'lunes')

    await waitFor(() => {
      expect(getHorarios).toHaveBeenLastCalledWith(
        expect.objectContaining({
          diaSemana: 'lunes',
          page: 1,
        }),
        expect.any(AbortSignal),
      )
    })
  })

  it('permite avanzar a la siguiente página', async () => {
    const user = userEvent.setup()

    renderPagina()

    await screen.findByText('09:00')

    await user.click(screen.getByRole('button', { name: /siguiente/i }))

    await waitFor(() => {
      expect(getHorarios).toHaveBeenLastCalledWith(
        expect.objectContaining({
          page: 2,
        }),
        expect.any(AbortSignal),
      )
    })
  })

  it('permite cambiar la cantidad de registros por página', async () => {
    const user = userEvent.setup()

    renderPagina()

    await screen.findByText('09:00')

    await user.selectOptions(
      screen.getByLabelText(/registros por página/i),
      '20',
    )

    await waitFor(() => {
      expect(getHorarios).toHaveBeenLastCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 20,
        }),
        expect.any(AbortSignal),
      )
    })
  })

  it('muestra un mensaje si no existen horarios', async () => {
    vi.mocked(getHorarios).mockResolvedValue({
      data: [],
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    })

    renderPagina()

    expect(
      await screen.findByText('No se encontraron horarios.'),
    ).toBeInTheDocument()
  })

  it('muestra los errores de la API', async () => {
    vi.mocked(getHorarios).mockRejectedValue(
      new ApiError('Error al obtener horarios', 500),
    )

    renderPagina()

    expect(
      await screen.findByText('Error al obtener horarios'),
    ).toBeInTheDocument()
  })

  it('navega al detalle al seleccionar un horario', async () => {
    const user = userEvent.setup()

    renderPagina()

    await user.click(await screen.findByText('09:00'))

    expect(
      await screen.findByRole('heading', {
        name: 'Detalle de horario',
      }),
    ).toBeInTheDocument()
  })
})

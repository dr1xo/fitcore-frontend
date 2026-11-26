import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { getProfesores } from '../services/profesores'
import { ProfesoresPage } from './ProfesoresPage'
import type { Profesor } from '../models/profesor'

vi.mock('../services/profesores', () => ({
  getProfesores: vi.fn(),
}))

const profesores: Profesor[] = [
  {
    id: 7,
    usuarioId: 107,
    dni: '29765432',
    nombre: 'Lucas',
    apellido: 'Romero',
    email: 'lucas@example.com',
    telefono: '2914567890',
    especialidad: 'Funcional',
  },
  {
    id: 8,
    usuarioId: 108,
    dni: '31234567',
    nombre: 'Martina',
    apellido: 'Gomez',
    email: 'martina@example.com',
    telefono: '2911234567',
    especialidad: 'Pilates',
  },
]

function renderPage() {
  return render(
    <MemoryRouter>
      <ProfesoresPage />
    </MemoryRouter>,
  )
}

describe('ProfesoresPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('muestra un indicador mientras carga los profesores', () => {
    vi.mocked(getProfesores).mockImplementation(() => new Promise(() => {}))

    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent('Cargando')
  })

  it('muestra los profesores recibidos del servicio', async () => {
    vi.mocked(getProfesores).mockResolvedValue({
      data: profesores,
      meta: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      },
    })

    renderPage()

    expect(await screen.findByText('Lucas')).toBeInTheDocument()
    expect(screen.getByText('Romero')).toBeInTheDocument()
    expect(screen.getByText('29765432')).toBeInTheDocument()
    expect(screen.getByText('Funcional')).toBeInTheDocument()

    expect(screen.getByText('Martina')).toBeInTheDocument()
    expect(screen.getByText('Gomez')).toBeInTheDocument()
    expect(screen.getByText('Pilates')).toBeInTheDocument()
  })

  it('muestra un mensaje cuando no hay profesores', async () => {
    vi.mocked(getProfesores).mockResolvedValue({
      data: [],
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    })

    renderPage()

    expect(
      await screen.findByText(/no se encontraron profesores/i),
    ).toBeInTheDocument()
  })

  it('muestra un mensaje cuando falla la petición', async () => {
    vi.mocked(getProfesores).mockRejectedValue(new Error('Error de conexión'))

    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo conectar con el servidor.',
    )
  })
})

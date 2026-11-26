import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiGet } from './api'
import { getProfesores } from '../services/profesores'

vi.mock('./api', () => ({
  apiGet: vi.fn(),
}))

describe('getProfesores', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('consulta el listado de profesores con paginado', async () => {
    await getProfesores({
      page: 1,
      limit: 10,
      search: '',
      especialidad: '',
    })

    expect(apiGet).toHaveBeenCalledWith(
      '/profesores?page=1&limit=10',
      undefined,
    )
  })

  it('permite cambiar la página y cantidad de registros', async () => {
    await getProfesores({
      page: 2,
      limit: 20,
      search: '',
      especialidad: '',
    })

    expect(apiGet).toHaveBeenCalledWith(
      '/profesores?page=2&limit=20',
      undefined,
    )
  })

  it('envía el parámetro de búsqueda', async () => {
    await getProfesores({
      page: 1,
      limit: 10,
      search: 'Romero',
      especialidad: '',
    })

    expect(apiGet).toHaveBeenCalledWith(
      '/profesores?page=1&limit=10&search=Romero',
      undefined,
    )
  })

  it('permite buscar por DNI', async () => {
    await getProfesores({
      page: 1,
      limit: 10,
      search: '29765432',
      especialidad: '',
    })

    expect(apiGet).toHaveBeenCalledWith(
      '/profesores?page=1&limit=10&search=29765432',
      undefined,
    )
  })

  it('envía el filtro por especialidad', async () => {
    await getProfesores({
      page: 1,
      limit: 10,
      search: '',
      especialidad: 'Cross training',
    })

    expect(apiGet).toHaveBeenCalledWith(
      '/profesores?page=1&limit=10&especialidad=Cross+training',
      undefined,
    )
  })

  it('combina la búsqueda y el filtro por especialidad', async () => {
    await getProfesores({
      page: 1,
      limit: 10,
      search: 'Lucas',
      especialidad: 'Funcional',
    })

    expect(apiGet).toHaveBeenCalledWith(
      '/profesores?page=1&limit=10&search=Lucas&especialidad=Funcional',
      undefined,
    )
  })

  it('permite cancelar la petición', async () => {
    const controller = new AbortController()

    await getProfesores(
      {
        page: 1,
        limit: 10,
        search: '',
        especialidad: '',
      },
      controller.signal,
    )

    expect(apiGet).toHaveBeenCalledWith(
      '/profesores?page=1&limit=10',
      controller.signal,
    )
  })
})

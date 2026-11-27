import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getHorarios, type HorariosQuery } from './horarios'
import { apiRequest } from './api'
import { loadSession } from './session'

vi.mock('./api', async (importOriginal) => {
  const original = await importOriginal<typeof import('./api')>()

  return {
    ...original,
    apiRequest: vi.fn(),
  }
})

vi.mock('./session', () => ({
  loadSession: vi.fn(),
}))

const query: HorariosQuery = {
  page: 1,
  limit: 10,
  claseId: '',
  diaSemana: '',
  profesorId: '',
}

const respuesta = {
  data: [],
  meta: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
}

describe('getHorarios', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    vi.mocked(loadSession).mockReturnValue({
      token: 'token-prueba',
    } as NonNullable<ReturnType<typeof loadSession>>)

    vi.mocked(apiRequest).mockResolvedValue(respuesta)
  })

  it('consulta el listado paginado de horarios', async () => {
    const resultado = await getHorarios(query)

    expect(apiRequest).toHaveBeenCalledWith(
      '/horarios?page=1&limit=10',
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer token-prueba',
        },
      }),
    )

    expect(resultado).toEqual(respuesta)
  })

  it('envía los parámetros de paginación', async () => {
    await getHorarios({
      ...query,
      page: 2,
      limit: 20,
    })

    expect(apiRequest).toHaveBeenCalledWith(
      '/horarios?page=2&limit=20',
      expect.any(Object),
    )
  })

  it('envía el filtro por clase', async () => {
    await getHorarios({
      ...query,
      claseId: '3',
    })

    expect(apiRequest).toHaveBeenCalledWith(
      '/horarios?page=1&limit=10&claseId=3',
      expect.any(Object),
    )
  })

  it('envía el filtro por día', async () => {
    await getHorarios({
      ...query,
      diaSemana: 'lunes',
    })

    expect(apiRequest).toHaveBeenCalledWith(
      '/horarios?page=1&limit=10&diaSemana=lunes',
      expect.any(Object),
    )
  })

  it('envía el filtro por profesor', async () => {
    await getHorarios({
      ...query,
      profesorId: '2',
    })

    expect(apiRequest).toHaveBeenCalledWith(
      '/horarios?page=1&limit=10&profesorId=2',
      expect.any(Object),
    )
  })

  it('permite combinar los tres filtros', async () => {
    await getHorarios({
      ...query,
      claseId: '3',
      diaSemana: 'viernes',
      profesorId: '2',
    })

    expect(apiRequest).toHaveBeenCalledWith(
      '/horarios?page=1&limit=10&claseId=3&diaSemana=viernes&profesorId=2',
      expect.any(Object),
    )
  })

  it('envía la señal de cancelación', async () => {
    const controller = new AbortController()

    await getHorarios(query, controller.signal)

    expect(apiRequest).toHaveBeenCalledWith(
      '/horarios?page=1&limit=10',
      expect.objectContaining({
        signal: controller.signal,
      }),
    )
  })

  it('rechaza la consulta si no existe una sesión', async () => {
    vi.mocked(loadSession).mockReturnValue(null)

    await expect(getHorarios(query)).rejects.toThrow('No hay sesión iniciada')

    expect(apiRequest).not.toHaveBeenCalled()
  })

  it('propaga los errores de la API', async () => {
    vi.mocked(apiRequest).mockRejectedValue(new Error('Error de conexión'))

    await expect(getHorarios(query)).rejects.toThrow('Error de conexión')
  })
})

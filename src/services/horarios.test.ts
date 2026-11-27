import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getHorarios,
  getClasesParaHorarios,
  type HorariosQuery,
} from './horarios'
import type { Clase } from '../models/clase'
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

describe('getClasesParaHorarios', () => {
  const clase1: Clase = {
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

  const clase2: Clase = {
    id: 5,
    nombre: 'Spinning',
    tipo: 'Spinning',
    cupoMaximo: 15,
    cuposOcupados: 5,
    cuposDisponibles: 10,
    profesor: {
      id: 4,
      nombre: 'María',
      apellido: 'García',
    },
  }

  beforeEach(() => {
    vi.resetAllMocks()

    vi.mocked(loadSession).mockReturnValue({
      token: 'token-prueba',
    } as NonNullable<ReturnType<typeof loadSession>>)

    vi.mocked(apiRequest).mockResolvedValue({
      data: [clase1, clase2],
      meta: {
        page: 1,
        limit: 100,
        total: 2,
        totalPages: 1,
      },
    })
  })

  it('obtiene las clases con los datos de sus profesores', async () => {
    const resultado = await getClasesParaHorarios()

    expect(apiRequest).toHaveBeenCalledWith(
      '/clases?page=1&limit=100',
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer token-prueba',
        },
      }),
    )

    expect(resultado).toEqual([clase1, clase2])
    expect(apiRequest).toHaveBeenCalledTimes(1)
  })

  it('obtiene todas las páginas de clases', async () => {
    vi.mocked(apiRequest)
      .mockResolvedValueOnce({
        data: [clase1],
        meta: {
          page: 1,
          limit: 100,
          total: 101,
          totalPages: 2,
        },
      })
      .mockResolvedValueOnce({
        data: [clase2],
        meta: {
          page: 2,
          limit: 100,
          total: 101,
          totalPages: 2,
        },
      })

    const resultado = await getClasesParaHorarios()

    expect(apiRequest).toHaveBeenNthCalledWith(
      1,
      '/clases?page=1&limit=100',
      expect.any(Object),
    )

    expect(apiRequest).toHaveBeenNthCalledWith(
      2,
      '/clases?page=2&limit=100',
      expect.any(Object),
    )

    expect(apiRequest).toHaveBeenCalledTimes(2)
    expect(resultado).toEqual([clase1, clase2])
  })

  it('devuelve un arreglo vacío cuando no existen clases', async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      data: [],
      meta: {
        page: 1,
        limit: 100,
        total: 0,
        totalPages: 0,
      },
    })

    const resultado = await getClasesParaHorarios()

    expect(resultado).toEqual([])
    expect(apiRequest).toHaveBeenCalledTimes(1)
  })

  it('envía la señal de cancelación', async () => {
    const controller = new AbortController()

    await getClasesParaHorarios(controller.signal)

    expect(apiRequest).toHaveBeenCalledWith(
      '/clases?page=1&limit=100',
      expect.objectContaining({
        signal: controller.signal,
      }),
    )
  })

  it('rechaza la consulta si no existe una sesión', async () => {
    vi.mocked(loadSession).mockReturnValue(null)

    await expect(getClasesParaHorarios()).rejects.toThrow(
      'No hay sesión iniciada',
    )

    expect(apiRequest).not.toHaveBeenCalled()
  })

  it('propaga los errores de la API', async () => {
    vi.mocked(apiRequest).mockRejectedValue(new Error('Error de conexión'))

    await expect(getClasesParaHorarios()).rejects.toThrow('Error de conexión')
  })
})

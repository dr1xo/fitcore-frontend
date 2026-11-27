import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Pagination,
  SearchInput,
  SelectField,
  Spinner,
} from '../components/ui'
import { ApiError } from '../services/api'
import { getHorarios, type HorariosQuery } from '../services/horarios'
import type { Horario, DiaSemana } from '../models/horario'
import type { PaginatedResponse } from '../types/api'
import './HorariosPage.css'

const PAGE_SIZES = [5, 10, 20, 50]
const SEARCH_DELAY_MS = 400

const COLUMNS = ['ID', 'Clase', 'Día', 'Hora de inicio', 'Hora de fin']

const DIAS = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
]

type Result =
  | { key: string; response: PaginatedResponse<Horario> }
  | { key: string; error: string }

function queryKey(query: HorariosQuery): string {
  return JSON.stringify(query)
}

export function HorariosPage() {
  const navigate = useNavigate()

  const [claseText, setClaseText] = useState('')
  const [profesorText, setProfesorText] = useState('')

  const [query, setQuery] = useState<HorariosQuery>({
    page: 1,
    limit: PAGE_SIZES[1],
    claseId: '',
    diaSemana: '',
    profesorId: '',
  })

  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const claseId = claseText.trim()
      const profesorId = profesorText.trim()

      setQuery((current) =>
        current.claseId === claseId && current.profesorId === profesorId
          ? current
          : {
              ...current,
              claseId,
              profesorId,
              page: 1,
            },
      )
    }, SEARCH_DELAY_MS)

    return () => window.clearTimeout(timer)
  }, [claseText, profesorText])

  useEffect(() => {
    const controller = new AbortController()
    const key = queryKey(query)

    getHorarios(query, controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) {
          setResult({ key, response })
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return

        const message =
          error instanceof ApiError
            ? error.message
            : 'No se pudo conectar con el servidor.'

        setResult({ key, error: message })
      })

    return () => controller.abort()
  }, [query])

  const loading = result === null || result.key !== queryKey(query)

  const response =
    !loading && result && 'response' in result ? result.response : null

  const error = !loading && result && 'error' in result ? result.error : null

  const horarios = response?.data ?? []
  const meta = response?.meta
  const totalPages = Math.max(1, meta?.totalPages ?? 1)

  const firstIndex = meta ? (meta.page - 1) * meta.limit : 0

  const from = horarios.length === 0 ? 0 : firstIndex + 1

  const to = horarios.length === 0 ? 0 : firstIndex + horarios.length

  function renderBody() {
    if (loading) {
      return (
        <tr>
          <td colSpan={COLUMNS.length} className="table__message">
            <Spinner />
          </td>
        </tr>
      )
    }

    if (horarios.length === 0) {
      return (
        <tr>
          <td colSpan={COLUMNS.length} className="table__message">
            No se encontraron horarios.
          </td>
        </tr>
      )
    }

    return horarios.map((horario) => (
      <tr
        key={horario.id}
        className="horarios-row"
        tabIndex={0}
        onClick={() => navigate(`/horarios/${horario.id}`)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            navigate(`/horarios/${horario.id}`)
          }
        }}
      >
        <td>{horario.id}</td>
        <td>{horario.claseId}</td>
        <td>
          {DIAS.find((dia) => dia.value === horario.diaSemana)?.label ??
            horario.diaSemana}
        </td>
        <td>{horario.horaInicio}</td>
        <td>{horario.horaFin}</td>
      </tr>
    ))
  }

  return (
    <section>
      <h1 className="page-title">Horarios</h1>

      <p className="page-subtitle">
        Buscá por clase, día o profesor y hacé click en un horario para ver su
        detalle.
      </p>

      <div className="horarios-toolbar">
        <SearchInput
          label="Clase"
          value={claseText}
          onChange={setClaseText}
          placeholder="ID de la clase"
        />

        <SelectField
          name="diaSemana"
          label="Día de semana"
          options={DIAS}
          placeholder="Todos los días"
          value={query.diaSemana}
          onChange={(event) =>
            setQuery((current) => ({
              ...current,
              diaSemana: event.target.value as '' | DiaSemana,
              page: 1,
            }))
          }
        />

        <SearchInput
          label="Profesor"
          value={profesorText}
          onChange={setProfesorText}
          placeholder="ID del profesor"
        />
      </div>

      {error ? (
        <Alert type="error">{error}</Alert>
      ) : (
        <div className="data-table">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {COLUMNS.map((column) => (
                    <th key={column} scope="col">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>{renderBody()}</tbody>
            </table>
          </div>

          {!loading && (
            <div className="table-footer">
              <label className="table-footer__size">
                Registros por página
                <select
                  value={query.limit}
                  onChange={(event) =>
                    setQuery((current) => ({
                      ...current,
                      limit: Number(event.target.value),
                      page: 1,
                    }))
                  }
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>

              <span>
                Mostrando {from}–{to} de {meta?.total ?? 0}
              </span>

              <Pagination
                page={query.page}
                totalPages={totalPages}
                onPageChange={(page) =>
                  setQuery((current) => ({
                    ...current,
                    page,
                  }))
                }
              />
            </div>
          )}
        </div>
      )}
    </section>
  )
}

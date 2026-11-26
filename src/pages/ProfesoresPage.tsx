import { useEffect, useState } from 'react'
import { Alert, Pagination, SearchInput, Spinner } from '../components/ui'
import { ApiError } from '../services/api'
import { getProfesores, type ProfesoresQuery } from '../services/profesores'
import type { Profesor } from '../models/profesor'
import type { PaginatedResponse } from '../types/api'

const PAGE_SIZES = [5, 10, 20, 50]
const SEARCH_DELAY_MS = 400

const COLUMNS = [
  'DNI',
  'Apellido',
  'Nombre',
  'Email',
  'Teléfono',
  'Especialidad',
]

type Result =
  | { key: string; response: PaginatedResponse<Profesor> }
  | { key: string; error: string }

function queryKey(query: ProfesoresQuery): string {
  return JSON.stringify(query)
}

export function ProfesoresPage() {
  const [searchText, setSearchText] = useState('')
  const [especialidadText, setEspecialidadText] = useState('')

  const [query, setQuery] = useState<ProfesoresQuery>({
    page: 1,
    limit: PAGE_SIZES[1],
    search: '',
    especialidad: '',
  })

  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const search = searchText.trim()
      const especialidad = especialidadText.trim()

      setQuery((current) =>
        current.search === search && current.especialidad === especialidad
          ? current
          : { ...current, search, especialidad, page: 1 },
      )
    }, SEARCH_DELAY_MS)

    return () => window.clearTimeout(timer)
  }, [searchText, especialidadText])

  useEffect(() => {
    const controller = new AbortController()
    const key = queryKey(query)

    getProfesores(query, controller.signal)
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

  const profesores = response?.data ?? []
  const meta = response?.meta
  const totalPages = Math.max(1, meta?.totalPages ?? 1)

  const firstIndex = meta ? (meta.page - 1) * meta.limit : 0
  const from = profesores.length === 0 ? 0 : firstIndex + 1
  const to = profesores.length === 0 ? 0 : firstIndex + profesores.length

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

    if (profesores.length === 0) {
      return (
        <tr>
          <td colSpan={COLUMNS.length} className="table__message">
            No se encontraron profesores.
          </td>
        </tr>
      )
    }

    return profesores.map((profesor) => (
      <tr key={profesor.id}>
        <td>{profesor.dni}</td>
        <td>{profesor.apellido}</td>
        <td>{profesor.nombre}</td>
        <td>{profesor.email}</td>
        <td>{profesor.telefono}</td>
        <td>{profesor.especialidad}</td>
      </tr>
    ))
  }

  return (
    <section>
      <h1 className="page-title">Profesores</h1>
      <p className="page-subtitle">Listado de profesores registrados.</p>

      <div className="profesores-toolbar">
        <SearchInput
          value={searchText}
          onChange={setSearchText}
          placeholder="Nombre, apellido o DNI"
        />

        <SearchInput
          label="Especialidad"
          value={especialidadText}
          onChange={setEspecialidadText}
          placeholder="Ej. Funcional"
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
                    setQuery({
                      ...query,
                      limit: Number(event.target.value),
                      page: 1,
                    })
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
                onPageChange={(page) => setQuery({ ...query, page })}
              />
            </div>
          )}
        </div>
      )}
    </section>
  )
}

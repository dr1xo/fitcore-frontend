import { useEffect, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Pagination,
  SearchInput,
  SelectField,
  Spinner,
} from '../components/ui'
import { ApiError } from '../services/api'
import { getAlumnos, type AlumnosQuery } from '../services/alumnos'
import type { Alumno, AlumnoEstado } from '../types/alumno'
import type { PaginatedResponse } from '../types/api'
import { formatDate } from '../utils/format'
import './AlumnosPage.css'

const PAGE_SIZES = [5, 10, 20, 50]
const SEARCH_DELAY_MS = 400
const COLUMNS = [
  'DNI',
  'Apellido',
  'Nombre',
  'Email',
  'Fecha de alta',
  'Estado',
]

const ESTADO_OPTIONS = [
  { value: 'activo', label: 'Activo' },
  { value: 'baja', label: 'Baja' },
]

const ESTADO_LABEL: Record<AlumnoEstado, string> = {
  activo: 'Activo',
  baja: 'Baja',
}

// Resultado de la última consulta. La clave identifica a qué consulta corresponde,
// así sabemos que hay una carga en curso cuando no coincide con la consulta actual.
type Result =
  | { key: string; response: PaginatedResponse<Alumno> }
  | { key: string; error: string }

function queryKey(query: AlumnosQuery): string {
  return JSON.stringify(query)
}

export function AlumnosPage() {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const [query, setQuery] = useState<AlumnosQuery>({
    page: 1,
    limit: PAGE_SIZES[1],
    search: '',
    estado: '',
  })
  const [result, setResult] = useState<Result | null>(null)

  // Espera a que el usuario deje de escribir antes de consultar al back.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const search = searchText.trim()
      setQuery((current) =>
        current.search === search ? current : { ...current, search, page: 1 },
      )
    }, SEARCH_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [searchText])

  // Consulta el listado cada vez que cambia la página, el límite o algún filtro.
  useEffect(() => {
    const controller = new AbortController()
    const key = queryKey(query)

    getAlumnos(query, controller.signal)
      .then((response) => setResult({ key, response }))
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
  const response = result && 'response' in result ? result.response : null
  const error = result && 'error' in result ? result.error : null
  const alumnos = response?.data ?? []
  const meta = response?.meta
  const totalPages = Math.max(1, meta?.totalPages ?? 1)

  const firstIndex = meta ? (meta.page - 1) * meta.limit : 0
  const from = alumnos.length === 0 ? 0 : firstIndex + 1
  const to = firstIndex + alumnos.length

  function openDetail(alumno: Alumno) {
    navigate(`/gestion-alumnos/${alumno.id}`)
  }

  function handleRowKeyDown(event: KeyboardEvent, alumno: Alumno) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openDetail(alumno)
    }
  }

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

    if (alumnos.length === 0) {
      return (
        <tr>
          <td colSpan={COLUMNS.length} className="table__message">
            No se encontraron alumnos con esos filtros.
          </td>
        </tr>
      )
    }

    return alumnos.map((alumno) => (
      <tr
        key={alumno.id}
        className="alumnos-row"
        tabIndex={0}
        onClick={() => openDetail(alumno)}
        onKeyDown={(event) => handleRowKeyDown(event, alumno)}
      >
        <td>{alumno.dni}</td>
        <td>{alumno.apellido}</td>
        <td>{alumno.nombre}</td>
        <td>{alumno.email}</td>
        <td>{formatDate(alumno.fechaAlta)}</td>
        <td>
          <span className={`badge badge--${alumno.estado}`}>
            {ESTADO_LABEL[alumno.estado]}
          </span>
        </td>
      </tr>
    ))
  }

  return (
    <section>
      <h1 className="page-title">Alumnos</h1>
      <p className="page-subtitle">
        Buscá por nombre, DNI o email y hacé click en un alumno para ver su
        detalle.
      </p>

      <div className="alumnos-toolbar">
        <SearchInput
          value={searchText}
          onChange={setSearchText}
          placeholder="Nombre, DNI o email"
        />
        <SelectField
          name="estado"
          label="Estado"
          placeholder="Todos"
          options={ESTADO_OPTIONS}
          value={query.estado}
          onChange={(event) =>
            setQuery({
              ...query,
              estado: event.target.value as '' | AlumnoEstado,
              page: 1,
            })
          }
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

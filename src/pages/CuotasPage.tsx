import { useEffect, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  FormField,
  Pagination,
  SelectField,
  Spinner,
  type SelectOption,
} from '../components/ui'
import { ApiError } from '../services/api'
import { getAlumnos } from '../services/alumnos'
import { getCuotas, type CuotasQuery } from '../services/cuotas'
import type { PaginatedResponse } from '../types/api'
import {
  CUOTA_ESTADO_LABEL,
  type Cuota,
  type CuotaEstado,
} from '../types/cuota'
import { formatDate, formatMoney, formatPeriodo } from '../utils/format'
import './AlumnosPage.css'
import './CuotasPage.css'

const PAGE_SIZES = [5, 10, 20, 50]
const COLUMNS = ['Alumno', 'Período', 'Monto', 'Vencimiento', 'Estado']

const ESTADO_OPTIONS = [
  { value: 'pagada', label: 'Pagada' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'vencida', label: 'Vencida' },
]

// Resultado de la última consulta. La clave identifica a qué consulta corresponde,
// así sabemos que hay una carga en curso cuando no coincide con la consulta actual.
type Result =
  | { key: string; response: PaginatedResponse<Cuota> }
  | { key: string; error: string }

function queryKey(query: CuotasQuery): string {
  return JSON.stringify(query)
}

export function CuotasPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState<CuotasQuery>({
    page: 1,
    limit: PAGE_SIZES[1],
    alumnoId: '',
    periodo: '',
    estado: '',
  })
  const [result, setResult] = useState<Result | null>(null)
  const [alumnoOptions, setAlumnoOptions] = useState<SelectOption[]>([])

  // Carga los alumnos para el filtro (el back permite hasta 100 por página).
  useEffect(() => {
    const controller = new AbortController()

    getAlumnos(
      { page: 1, limit: 100, search: '', estado: '' },
      controller.signal,
    )
      .then((response) =>
        setAlumnoOptions(
          response.data.map((alumno) => ({
            value: String(alumno.id),
            label: `${alumno.apellido}, ${alumno.nombre}`,
          })),
        ),
      )
      .catch(() => {
        // Si falla, el filtro queda solo con "Todos"; el listado muestra su propio error.
      })

    return () => controller.abort()
  }, [])

  // Consulta el listado cada vez que cambia la página, el límite o algún filtro.
  useEffect(() => {
    const controller = new AbortController()
    const key = queryKey(query)

    getCuotas(query, controller.signal)
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
  const cuotas = response?.data ?? []
  const meta = response?.meta
  const totalPages = Math.max(1, meta?.totalPages ?? 1)

  const firstIndex = meta ? (meta.page - 1) * meta.limit : 0
  const from = cuotas.length === 0 ? 0 : firstIndex + 1
  const to = firstIndex + cuotas.length

  function openDetail(cuota: Cuota) {
    navigate(`/gestion-cuotas/${cuota.id}`)
  }

  function handleRowKeyDown(event: KeyboardEvent, cuota: Cuota) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openDetail(cuota)
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

    if (cuotas.length === 0) {
      return (
        <tr>
          <td colSpan={COLUMNS.length} className="table__message">
            No se encontraron cuotas con esos filtros.
          </td>
        </tr>
      )
    }

    return cuotas.map((cuota) => (
      <tr
        key={cuota.id}
        className="alumnos-row"
        tabIndex={0}
        onClick={() => openDetail(cuota)}
        onKeyDown={(event) => handleRowKeyDown(event, cuota)}
      >
        <td>
          {cuota.alumno.apellido}, {cuota.alumno.nombre}
        </td>
        <td>{formatPeriodo(cuota.periodo)}</td>
        <td>{formatMoney(cuota.monto)}</td>
        <td>{formatDate(cuota.fechaVencimiento)}</td>
        <td>
          <span className={`badge badge--${cuota.estado}`}>
            {CUOTA_ESTADO_LABEL[cuota.estado]}
          </span>
        </td>
      </tr>
    ))
  }

  return (
    <section>
      <h1 className="page-title">Cuotas</h1>
      <p className="page-subtitle">
        Filtrá por alumno, período o estado y hacé click en una cuota para ver
        su detalle.
      </p>

      <div className="alumnos-toolbar cuotas-toolbar">
        <SelectField
          name="alumnoId"
          label="Alumno"
          placeholder="Todos"
          options={alumnoOptions}
          value={query.alumnoId}
          onChange={(event) =>
            setQuery({ ...query, alumnoId: event.target.value, page: 1 })
          }
        />
        <FormField
          name="periodo"
          label="Período"
          type="month"
          value={query.periodo}
          onChange={(event) =>
            setQuery({ ...query, periodo: event.target.value, page: 1 })
          }
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
              estado: event.target.value as '' | CuotaEstado,
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

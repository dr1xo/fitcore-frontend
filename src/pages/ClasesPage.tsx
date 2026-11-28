import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Alert,
  Pagination,
  SearchInput,
  SelectField,
  Spinner,
} from '../components/ui'
import { ApiError } from '../services/api'
import { getClases, type ClasesQuery } from '../services/clases'
import type { Clase } from '../models/clase'
import type { DiaSemana } from '../models/horario'
import type { PaginatedResponse } from '../types/api'
import './ClasesPage.css'

const PAGE_SIZES = [5, 10, 20, 50]

const DIA_OPTIONS: { value: DiaSemana; label: string }[] = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
]

const SORT_OPTIONS = [
  { value: 'nombre', label: 'Nombre' },
  { value: 'tipo', label: 'Tipo' },
  { value: 'cupoMaximo', label: 'Cupo máximo' },
  { value: 'cuposDisponibles', label: 'Cupos disponibles' },
]

type Result =
  | { key: string; response: PaginatedResponse<Clase> }
  | { key: string; error: string }

export function ClasesPage() {
  const { pathname } = useLocation()

  const basePath = pathname.startsWith('/gestion-clases')
    ? '/gestion-clases'
    : '/clases'

  const [searchText, setSearchText] = useState('')
  const [tipoText, setTipoText] = useState('')

  const [query, setQuery] = useState<ClasesQuery>({
    page: 1,
    limit: 10,
    search: '',
    tipo: '',
    sortBy: 'nombre',
    order: 'asc',
  })

  const [result, setResult] = useState<Result | null>(null)
  const [retry, setRetry] = useState(0)

  const key = JSON.stringify([query, retry])

  // Espera a que el usuario deje de escribir antes de consultar.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const search = searchText.trim()
      const tipo = tipoText.trim()

      setQuery((current) =>
        current.search === search && current.tipo === tipo
          ? current
          : { ...current, search, tipo, page: 1 },
      )
    }, 400)

    return () => window.clearTimeout(timer)
  }, [searchText, tipoText])

  useEffect(() => {
    const controller = new AbortController()

    getClases(query, controller.signal)
      .then((response) => {
        if (controller.signal.aborted) return

        // Si cambió el total, vuelve a la última página válida.
        const lastPage = Math.max(1, response.meta.totalPages)

        if (query.page > lastPage) {
          setQuery((current) => ({
            ...current,
            page: lastPage,
          }))
          return
        }

        setResult({ key, response })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return

        setResult({
          key,
          error:
            error instanceof ApiError
              ? error.message
              : 'No se pudo conectar con el servidor.',
        })
      })

    return () => controller.abort()
  }, [query, key])

  const current = result?.key === key ? result : null
  const loading = current === null

  const response =
    current && 'response' in current ? current.response : null

  const error = current && 'error' in current ? current.error : null

  const clases = response?.data ?? []
  const meta = response?.meta

  const from =
    meta && clases.length > 0
      ? (meta.page - 1) * meta.limit + 1
      : 0

  const to = clases.length > 0 ? from + clases.length - 1 : 0

  function changeQuery(patch: Partial<ClasesQuery>) {
    setQuery((currentQuery) => ({
      ...currentQuery,
      ...patch,
      page: 1,
    }))
  }

  return (
    <section className="clases-page">
      <h1 className="page-title">Clases</h1>

      <p className="page-subtitle">
        Buscá una clase y consultá su profesor, cupos y horarios.
      </p>

      <div className="clases-toolbar">
        <div>
          <span className="clases-field-label">Buscar clase</span>
          <SearchInput
            value={searchText}
            onChange={setSearchText}
            placeholder="Buscar por nombre"
          />
        </div>

        <div>
          <span className="clases-field-label">Tipo de clase</span>
          <SearchInput
            value={tipoText}
            onChange={setTipoText}
            placeholder="Escribí el tipo"
          />
        </div>

        <SelectField
          name="diaSemana"
          label="Día"
          placeholder="Todos los días"
          options={DIA_OPTIONS}
          value={query.diaSemana ?? ''}
          onChange={(event) =>
            changeQuery({
              diaSemana: (event.target.value || undefined) as
                | DiaSemana
                | undefined,
            })
          }
        />

        <SelectField
          name="conCupo"
          label="Disponibilidad"
          placeholder="Todas"
          options={[
            { value: 'true', label: 'Con cupo' },
            { value: 'false', label: 'Sin cupo' },
          ]}
          value={
            query.conCupo === undefined ? '' : String(query.conCupo)
          }
          onChange={(event) =>
            changeQuery({
              conCupo:
                event.target.value === ''
                  ? undefined
                  : event.target.value === 'true',
            })
          }
        />

        <SelectField
          name="sortBy"
          label="Ordenar por"
          options={SORT_OPTIONS}
          value={query.sortBy ?? 'nombre'}
          onChange={(event) =>
            changeQuery({
              sortBy: (event.target.value ||
                'nombre') as ClasesQuery['sortBy'],
            })
          }
        />

        <SelectField
          name="order"
          label="Orden"
          options={[
            { value: 'asc', label: 'Ascendente' },
            { value: 'desc', label: 'Descendente' },
          ]}
          value={query.order ?? 'asc'}
          onChange={(event) =>
            changeQuery({
              order: event.target.value === 'desc' ? 'desc' : 'asc',
            })
          }
        />
      </div>

      {error ? (
        <div role="status">
          <Alert type="error">{error}</Alert>

          <button
            className="clases-action"
            type="button"
            onClick={() => setRetry((value) => value + 1)}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div className="data-table" aria-busy={loading}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {[
                    'Nombre',
                    'Tipo',
                    'Profesor',
                    'Cupo máximo',
                    'Ocupados',
                    'Disponibles',
                  ].map((column) => (
                    <th key={column} scope="col">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="table__message">
                      <Spinner />
                    </td>
                  </tr>
                ) : clases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table__message">
                      No se encontraron clases con esos filtros.
                    </td>
                  </tr>
                ) : (
                  clases.map((clase) => (
                    <tr key={clase.id}>
                      <td>
                        <Link
                          className="clases-detail-link"
                          to={`${basePath}/${clase.id}`}
                        >
                          {clase.nombre}
                        </Link>
                      </td>
                      <td>{clase.tipo}</td>
                      <td>
                        {clase.profesor.apellido},{' '}
                        {clase.profesor.nombre}
                      </td>
                      <td>{clase.cupoMaximo}</td>
                      <td>{clase.cuposOcupados}</td>
                      <td>
                        <span
                          className={`clases-cupo ${
                            clase.cuposDisponibles > 0
                              ? 'clases-cupo--disponible'
                              : 'clases-cupo--completo'
                          }`}
                        >
                          {clase.cuposDisponibles > 0
                            ? clase.cuposDisponibles
                            : 'Sin cupo'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && meta && (
            <div className="table-footer">
              <label className="table-footer__size">
                Registros por página
                <select
                  value={query.limit}
                  onChange={(event) =>
                    changeQuery({
                      limit: Number(event.target.value),
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

              <span aria-live="polite">
                Mostrando {from}–{to} de {meta.total}
              </span>

              <Pagination
                page={meta.page}
                totalPages={Math.max(1, meta.totalPages)}
                onPageChange={(page) =>
                  setQuery((currentQuery) => ({
                    ...currentQuery,
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
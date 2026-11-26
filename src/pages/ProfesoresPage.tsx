import { useEffect, useState } from 'react'
import { Alert, Spinner } from '../components/ui'
import { ApiError } from '../services/api'
import { getProfesores } from '../services/profesores'
import type { Profesor } from '../models/profesor'
import type { PaginatedResponse } from '../types/api'

const COLUMNS = [
  'DNI',
  'Apellido',
  'Nombre',
  'Email',
  'Teléfono',
  'Especialidad',
]

type Result = { response: PaginatedResponse<Profesor> } | { error: string }

export function ProfesoresPage() {
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    getProfesores(
      {
        page: 1,
        limit: 10,
        search: '',
        especialidad: '',
      },
      controller.signal,
    )
      .then((response) => {
        if (!controller.signal.aborted) {
          setResult({ response })
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return

        const message =
          error instanceof ApiError
            ? error.message
            : 'No se pudo conectar con el servidor.'

        setResult({ error: message })
      })

    return () => controller.abort()
  }, [])

  const loading = result === null
  const response = result && 'response' in result ? result.response : null
  const error = result && 'error' in result ? result.error : null
  const profesores = response?.data ?? []

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
        </div>
      )}
    </section>
  )
}

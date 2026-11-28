import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Alert, Spinner } from '../components/ui'
import { ApiError } from '../services/api'
import { getClase } from '../services/clases'
import type { ClaseDetalle } from '../models/clase'
import type { DiaSemana } from '../models/horario'
import './ClasesPage.css'

const DIA_LABEL: Record<DiaSemana, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
}

const DIAS = Object.keys(DIA_LABEL) as DiaSemana[]

type Result =
  | { key: string; clase: ClaseDetalle }
  | { key: string; error: string }

export function ClaseDetallePage() {
  const { id } = useParams()
  const { pathname } = useLocation()

  const basePath = pathname.startsWith('/gestion-clases')
    ? '/gestion-clases'
    : '/clases'

  const validId =
    id !== undefined &&
    /^\d+$/.test(id) &&
    Number.isSafeInteger(Number(id)) &&
    Number(id) > 0

  const [result, setResult] = useState<Result | null>(null)
  const [retry, setRetry] = useState(0)

  const key = JSON.stringify([id, retry])

  useEffect(() => {
    if (!validId || id === undefined) return

    const controller = new AbortController()

    getClase(id, controller.signal)
      .then((clase) => {
        if (controller.signal.aborted) return

        setResult({ key, clase })
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
  }, [id, validId, key])

  const current = result?.key === key ? result : null
  const loading = validId && current === null

  const error = !validId
    ? 'El ID de la clase no es válido.'
    : current && 'error' in current
      ? current.error
      : null

  const clase = current && 'clase' in current ? current.clase : null

  const horarios = clase
    ? [...clase.horarios].sort(
        (a, b) =>
          DIAS.indexOf(a.diaSemana) - DIAS.indexOf(b.diaSemana) ||
          a.horaInicio.localeCompare(b.horaInicio),
      )
    : []

  return (
    <section className="clases-page">
      <h1 className="page-title">Detalle de la clase</h1>

      <p className="page-subtitle">
        Consultá los datos, la disponibilidad y los horarios.
      </p>

      <div className="clases-detail-toolbar">
        <Link className="clases-action" to={basePath}>
          Volver al listado
        </Link>
      </div>

      {error && (
        <div role="status">
          <Alert type="error">{error}</Alert>

          {validId && (
            <button
              className="clases-action"
              type="button"
              onClick={() => setRetry((value) => value + 1)}
            >
              Reintentar
            </button>
          )}
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : (
        clase && (
          <>
            <section
              className="clases-card"
              aria-labelledby="clase-nombre"
            >
              <h2 id="clase-nombre">{clase.nombre}</h2>

              <dl className="clases-detail-grid">
                <div>
                  <dt>Tipo</dt>
                  <dd>{clase.tipo}</dd>
                </div>

                <div>
                  <dt>Profesor</dt>
                  <dd>
                    {clase.profesor.apellido},{' '}
                    {clase.profesor.nombre}
                  </dd>
                </div>

                <div>
                  <dt>Cupo máximo</dt>
                  <dd>{clase.cupoMaximo}</dd>
                </div>

                <div>
                  <dt>Cupos ocupados</dt>
                  <dd>{clase.cuposOcupados}</dd>
                </div>

                <div>
                  <dt>Cupos disponibles</dt>
                  <dd>{clase.cuposDisponibles}</dd>
                </div>
              </dl>
            </section>

            <section
              className="clases-card"
              aria-labelledby="clase-horarios"
            >
              <h2 id="clase-horarios">Horarios</h2>

              {horarios.length === 0 ? (
                <p>La clase todavía no tiene horarios asignados.</p>
              ) : (
                <div className="data-table">
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th scope="col">Día</th>
                          <th scope="col">Inicio</th>
                          <th scope="col">Fin</th>
                        </tr>
                      </thead>

                      <tbody>
                        {horarios.map((horario) => (
                          <tr key={horario.id}>
                            <td>{DIA_LABEL[horario.diaSemana]}</td>
                            <td>{horario.horaInicio.slice(0, 5)}</td>
                            <td>{horario.horaFin.slice(0, 5)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </>
        )
      )}
    </section>
  )
}
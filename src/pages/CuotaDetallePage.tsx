import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, Spinner } from '../components/ui'
import { ApiError } from '../services/api'
import { getCuota } from '../services/cuotas'
import { CUOTA_ESTADO_LABEL, type Cuota } from '../types/cuota'
import { formatDate, formatMoney, formatPeriodo } from '../utils/format'
import './AlumnosPage.css'
import './CuotasPage.css'

type Result = { id: string; cuota: Cuota } | { id: string; error: string }

export function CuotaDetallePage() {
  const { id = '' } = useParams()
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    getCuota(id, controller.signal)
      .then((cuota) => setResult({ id, cuota }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const message =
          error instanceof ApiError
            ? error.message
            : 'No se pudo conectar con el servidor.'
        setResult({ id, error: message })
      })

    return () => controller.abort()
  }, [id])

  const loading = result === null || result.id !== id
  const cuota = result && 'cuota' in result ? result.cuota : null
  const error = result && 'error' in result ? result.error : null

  return (
    <section>
      <Link to="/gestion-cuotas" className="back-link">
        ← Volver al listado
      </Link>

      {loading && <Spinner />}
      {!loading && error && <Alert type="error">{error}</Alert>}

      {cuota && (
        <>
          <h1 className="page-title">Cuota {formatPeriodo(cuota.periodo)}</h1>
          <p className="page-subtitle">
            <span className={`badge badge--${cuota.estado}`}>
              {CUOTA_ESTADO_LABEL[cuota.estado]}
            </span>
          </p>

          <dl className="detail-card">
            <div>
              <dt>Alumno</dt>
              <dd>
                {cuota.alumno.apellido}, {cuota.alumno.nombre}
              </dd>
            </div>
            <div>
              <dt>Período</dt>
              <dd>{formatPeriodo(cuota.periodo)}</dd>
            </div>
            <div>
              <dt>Monto</dt>
              <dd>{formatMoney(cuota.monto)}</dd>
            </div>
            <div>
              <dt>Vencimiento</dt>
              <dd>{formatDate(cuota.fechaVencimiento)}</dd>
            </div>
            <div>
              <dt>Fecha de pago</dt>
              <dd>{cuota.pago ? formatDate(cuota.pago.fechaPago) : '—'}</dd>
            </div>
            <div>
              <dt>Medio de pago</dt>
              <dd>{cuota.pago ? cuota.pago.medioPago : '—'}</dd>
            </div>
          </dl>
        </>
      )}
    </section>
  )
}

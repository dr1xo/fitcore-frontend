import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, Spinner } from '../components/ui'
import { ApiError } from '../services/api'
import { getAlumno } from '../services/alumnos'
import type { Alumno } from '../types/alumno'
import { formatDate } from '../utils/format'
import './AlumnosPage.css'

type Result = { id: string; alumno: Alumno } | { id: string; error: string }

export function AlumnoDetallePage() {
    const { id = '' } = useParams()
    const [result, setResult] = useState<Result | null>(null)

    useEffect(() => {
        const controller = new AbortController()

        getAlumno(id, controller.signal)
            .then((alumno) => setResult({ id, alumno }))
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
    const alumno = result && 'alumno' in result ? result.alumno : null
    const error = result && 'error' in result ? result.error : null

    return (
        <section>
            <Link to="/gestion-alumnos" className="back-link">
                ← Volver al listado
            </Link>

            {loading && <Spinner />}
            {!loading && error && <Alert type="error">{error}</Alert>}

            {alumno && (
                <>
                    <h1 className="page-title">
                        {alumno.apellido}, {alumno.nombre}
                    </h1>
                    <p className="page-subtitle">
                        <span className={`badge badge--${alumno.estado}`}>
                            {alumno.estado === 'activo' ? 'Activo' : 'Baja'}
                        </span>
                    </p>

                    <dl className="detail-card">
                        <div>
                            <dt>DNI</dt>
                            <dd>{alumno.dni}</dd>
                        </div>
                        <div>
                            <dt>Email</dt>
                            <dd>{alumno.email}</dd>
                        </div>
                        <div>
                            <dt>Teléfono</dt>
                            <dd>{alumno.telefono || '—'}</dd>
                        </div>
                        <div>
                            <dt>Fecha de alta</dt>
                            <dd>{formatDate(alumno.fechaAlta)}</dd>
                        </div>
                        <div>
                            <dt>Usuario asociado</dt>
                            <dd>#{alumno.usuarioId}</dd>
                        </div>
                    </dl>
                </>
            )}
        </section>
    )
}
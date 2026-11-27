import { useEffect, useState, type SubmitEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Button,
  FormField,
  SelectField,
  Spinner,
} from '../components/ui'
import { ApiError } from '../services/api'
import {
  getHorarioById,
  updateHorario,
  getClasesParaHorarios,
  type UpdateHorarioDTO,
} from '../services/horarios'
import type { Horario, DiaSemana } from '../models/horario'
import type { Clase } from '../models/clase'
import './HorarioDetallePage.css'

const DIAS = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
]

function obtenerDatos(horario: Horario): UpdateHorarioDTO {
  return {
    diaSemana: horario.diaSemana,
    horaInicio: horario.horaInicio,
    horaFin: horario.horaFin,
  }
}

export function HorarioDetallePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const horarioId = Number(id)

  const [horario, setHorario] = useState<Horario | null>(null)
  const [datos, setDatos] = useState<UpdateHorarioDTO | null>(null)
  const [clases, setClases] = useState<Clase[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingClases, setLoadingClases] = useState(true)
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorClases, setErrorClases] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    getHorarioById(horarioId, controller.signal)
      .then((response) => {
        if (controller.signal.aborted) return

        setHorario(response)
        setDatos(obtenerDatos(response))
        setEditando(false)
        setError(null)
        setLoading(false)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return

        setError(
          error instanceof ApiError
            ? error.message
            : 'No se pudo conectar con el servidor.',
        )

        setHorario(null)
        setDatos(null)
        setLoading(false)
      })

    return () => controller.abort()
  }, [horarioId])

  useEffect(() => {
    const controller = new AbortController()

    getClasesParaHorarios(controller.signal)
      .then((response) => {
        if (controller.signal.aborted) return

        setClases(response)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return

        setErrorClases(
          error instanceof ApiError
            ? error.message
            : 'No se pudieron obtener las clases.',
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingClases(false)
        }
      })

    return () => controller.abort()
  }, [])

  const clase = clases.find((clase) => clase.id === horario?.claseId)

  function cambiarCampo<K extends keyof UpdateHorarioDTO>(
    campo: K,
    valor: UpdateHorarioDTO[K],
  ) {
    setDatos((actual) => (actual ? { ...actual, [campo]: valor } : actual))
  }

  function iniciarEdicion() {
    setError(null)
    setEditando(true)
  }

  function cancelarEdicion() {
    if (!horario) return

    setDatos(obtenerDatos(horario))
    setEditando(false)
    setError(null)
  }

  async function guardar(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!datos || !horario || !editando || guardando) return

    const formatoHora = /^(?:[01]\d|2[0-3]):[0-5]\d$/

    if (
      !formatoHora.test(datos.horaInicio) ||
      !formatoHora.test(datos.horaFin)
    ) {
      setError('Las horas deben tener el formato HH:MM.')
      return
    }

    if (datos.horaFin <= datos.horaInicio) {
      setError('La hora de fin debe ser posterior a la hora de inicio.')
      return
    }

    setGuardando(true)
    setError(null)

    try {
      const actualizado = await updateHorario(horarioId, datos)

      setHorario(actualizado)
      setDatos(obtenerDatos(actualizado))
      setEditando(false)
    } catch (error: unknown) {
      setError(
        error instanceof ApiError
          ? error.message
          : 'No se pudo guardar el horario.',
      )
    } finally {
      setGuardando(false)
    }
  }

  return (
    <section>
      <h1 className="page-title">Detalle del horario</h1>

      <p className="page-subtitle">
        Consultá y editá los datos del horario seleccionado.
      </p>

      <div className="horario-detalle-toolbar">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/horarios')}
          disabled={guardando}
        >
          Volver al listado
        </Button>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {errorClases && <Alert type="error">{errorClases}</Alert>}

      {loading ? (
        <Spinner />
      ) : horario && datos ? (
        <form className="horario-detalle-card" onSubmit={guardar}>
          <fieldset
            className="horario-detalle-fieldset"
            disabled={!editando || guardando}
          >
            <legend>Datos del horario</legend>

            <div className="horario-detalle-grid">
              <FormField
                name="clase"
                label="Clase"
                value={
                  clase?.nombre ??
                  (loadingClases ? 'Cargando...' : 'Clase no disponible')
                }
                disabled
              />

              <FormField
                name="profesor"
                label="Profesor"
                value={
                  clase
                    ? `${clase.profesor.nombre} ${clase.profesor.apellido}`
                    : '—'
                }
                disabled
              />

              <SelectField
                name="diaSemana"
                label="Día de semana"
                options={DIAS}
                value={datos.diaSemana}
                required
                onChange={(event) =>
                  cambiarCampo('diaSemana', event.target.value as DiaSemana)
                }
              />

              <FormField
                name="horaInicio"
                label="Hora de inicio"
                type="time"
                value={datos.horaInicio}
                required
                onChange={(event) =>
                  cambiarCampo('horaInicio', event.target.value)
                }
              />

              <FormField
                name="horaFin"
                label="Hora de fin"
                type="time"
                value={datos.horaFin}
                required
                onChange={(event) =>
                  cambiarCampo('horaFin', event.target.value)
                }
              />
            </div>
          </fieldset>

          <div className="horario-detalle-actions">
            {editando ? (
              <>
                <Button key="guardar" type="submit" loading={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar'}
                </Button>

                <Button
                  key="cancelar"
                  type="button"
                  variant="secondary"
                  disabled={guardando}
                  onClick={cancelarEdicion}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button
                key="editar"
                type="button"
                onClick={(event) => {
                  event.preventDefault()
                  iniciarEdicion()
                }}
              >
                Editar
              </Button>
            )}
          </div>
        </form>
      ) : null}
    </section>
  )
}

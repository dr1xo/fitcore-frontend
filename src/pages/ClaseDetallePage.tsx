import {
  useEffect,
  useRef,
  useState,
  type SubmitEvent,
} from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  Alert,
  Button,
  FormField,
  Spinner,
} from '../components/ui'
import { ApiError } from '../services/api'
import {
  actualizarClase,
  getClase,
  type ActualizarClaseDTO,
} from '../services/clases'
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

interface FormularioClase {
  nombre: string
  tipo: string
  cupoMaximo: string
  profesorId: string
}

interface DetalleProps {
  id: string
  administracion: boolean
}

function obtenerFormulario(clase: ClaseDetalle): FormularioClase {
  return {
    nombre: clase.nombre,
    tipo: clase.tipo,
    cupoMaximo: String(clase.cupoMaximo),
    profesorId: String(clase.profesor.id),
  }
}

function mensajeError(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : 'No se pudo conectar con el servidor.'
}

export function ClaseDetallePage() {
  const { id } = useParams()
  const { pathname } = useLocation()

  const administracion = pathname.startsWith('/gestion-clases')

  const validId =
    id !== undefined &&
    /^[1-9]\d*$/.test(id) &&
    Number.isSafeInteger(Number(id))

  if (!validId || id === undefined) {
    return (
      <section className="clases-page">
        <h1 className="page-title">Detalle de la clase</h1>

        <Alert type="error">
          El ID de la clase no es válido.
        </Alert>

        <Link
          className="clases-action"
          to={administracion ? '/gestion-clases' : '/clases'}
        >
          Volver al listado
        </Link>
      </section>
    )
  }

  // Reinicia el formulario cuando cambia la clase o el acceso.
  return (
    <DetalleClase
      key={`${administracion}:${id}`}
      id={id}
      administracion={administracion}
    />
  )
}

function DetalleClase({ id, administracion }: DetalleProps) {
  const basePath = administracion ? '/gestion-clases' : '/clases'

  const [clase, setClase] = useState<ClaseDetalle | null>(null)
  const [datos, setDatos] = useState<FormularioClase | null>(null)

  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null)
  const [exito, setExito] = useState(false)
  const [retry, setRetry] = useState(0)

  const controllerRef = useRef<AbortController | null>(null)
  const guardandoRef = useRef(false)

  useEffect(() => {
    const controller = new AbortController()
    controllerRef.current = controller

    getClase(id, controller.signal)
      .then((response) => {
        if (controller.signal.aborted) return

        setClase(response)
        setDatos(obtenerFormulario(response))
        setErrorCarga(null)
        setLoading(false)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return

        setErrorCarga(mensajeError(error))
        setLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [id, retry])

  function reintentar() {
    setLoading(true)
    setErrorCarga(null)
    setRetry((value) => value + 1)
  }

  function cambiarCampo(
    campo: keyof FormularioClase,
    valor: string,
  ) {
    setDatos((actual) =>
      actual ? { ...actual, [campo]: valor } : actual,
    )
    setErrorGuardado(null)
    setExito(false)
  }

  function iniciarEdicion() {
    if (!administracion || !clase) return

    setDatos(obtenerFormulario(clase))
    setErrorGuardado(null)
    setExito(false)
    setEditando(true)
  }

  function cancelarEdicion() {
    if (!clase || guardandoRef.current) return

    setDatos(obtenerFormulario(clase))
    setErrorGuardado(null)
    setExito(false)
    setEditando(false)
  }

  async function guardar(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const controller = controllerRef.current

    if (
      !administracion ||
      !editando ||
      !clase ||
      !datos ||
      guardandoRef.current ||
      !controller ||
      controller.signal.aborted
    ) {
      return
    }

    setErrorGuardado(null)
    setExito(false)

    const nombre = datos.nombre.trim()
    const tipo = datos.tipo.trim()
    const cupoMaximo = Number(datos.cupoMaximo)
    const profesorId = Number(datos.profesorId)

    if (!nombre || !tipo) {
      setErrorGuardado('El nombre y el tipo son obligatorios.')
      return
    }

    if (
      !Number.isSafeInteger(cupoMaximo) ||
      cupoMaximo < 1
    ) {
      setErrorGuardado(
        'El cupo máximo debe ser un entero positivo.',
      )
      return
    }

    if (cupoMaximo < clase.cuposOcupados) {
      setErrorGuardado(
        `El cupo máximo no puede ser menor que los ${clase.cuposOcupados} cupos ocupados.`,
      )
      return
    }

    if (
      !Number.isSafeInteger(profesorId) ||
      profesorId < 1
    ) {
      setErrorGuardado(
        'El ID del profesor debe ser un entero positivo.',
      )
      return
    }

    const payload: ActualizarClaseDTO = {
      nombre,
      tipo,
      cupoMaximo,
      profesorId,
    }

    guardandoRef.current = true
    setGuardando(true)

    try {
      const response = await actualizarClase(
        id,
        payload,
        controller.signal,
      )

      if (controller.signal.aborted) return

      // PUT devuelve los datos de la clase sin horarios.
      // Conservamos los horarios obtenidos mediante GET.
      const actualizada: ClaseDetalle = {
        ...clase,
        ...response,
        horarios: clase.horarios,
      }

      setClase(actualizada)
      setDatos(obtenerFormulario(actualizada))
      setEditando(false)
      setExito(true)
    } catch (error: unknown) {
      if (controller.signal.aborted) return

      setErrorGuardado(mensajeError(error))
    } finally {
      guardandoRef.current = false

      if (!controller.signal.aborted) {
        setGuardando(false)
      }
    }
  }

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
        {administracion
          ? 'Consultá y editá los datos de la clase seleccionada.'
          : 'Consultá los datos, la disponibilidad y los horarios.'}
      </p>

      <div className="clases-detail-toolbar">
        {guardando ? (
          <button
            className="clases-action"
            type="button"
            disabled
          >
            Guardando...
          </button>
        ) : (
          <Link className="clases-action" to={basePath}>
            Volver al listado
          </Link>
        )}
      </div>

      {errorCarga && (
        <div role="status">
          <Alert type="error">{errorCarga}</Alert>

          <button
            className="clases-action"
            type="button"
            onClick={reintentar}
          >
            Reintentar
          </button>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : (
        clase &&
        datos && (
          <>
            {exito && (
              <p role="status">
                Clase actualizada correctamente.
              </p>
            )}

            {errorGuardado && (
              <Alert type="error">{errorGuardado}</Alert>
            )}

            <form className="clases-card" onSubmit={guardar}>
              <h2>{clase.nombre}</h2>

              <fieldset
                disabled={!editando || guardando}
                style={{
                  border: 0,
                  padding: 0,
                  margin: 0,
                  minWidth: 0,
                }}
              >
                <legend>Datos de la clase</legend>

                <div className="clases-detail-grid">
                  <FormField
                    name="id"
                    label="ID de clase"
                    type="number"
                    value={clase.id}
                    disabled
                  />

                  <FormField
                    name="nombre"
                    label="Nombre"
                    value={datos.nombre}
                    required
                    onChange={(event) =>
                      cambiarCampo('nombre', event.target.value)
                    }
                  />

                  <FormField
                    name="tipo"
                    label="Tipo de clase"
                    value={datos.tipo}
                    required
                    onChange={(event) =>
                      cambiarCampo('tipo', event.target.value)
                    }
                  />

                  <FormField
                    name="cupoMaximo"
                    label="Cupo máximo"
                    type="number"
                    min={Math.max(1, clase.cuposOcupados)}
                    step={1}
                    value={datos.cupoMaximo}
                    required
                    onChange={(event) =>
                      cambiarCampo('cupoMaximo', event.target.value)
                    }
                  />

                  <FormField
                    name="profesorId"
                    label="ID del profesor"
                    type="number"
                    min={1}
                    step={1}
                    value={datos.profesorId}
                    required
                    onChange={(event) =>
                      cambiarCampo('profesorId', event.target.value)
                    }
                  />
                </div>
              </fieldset>

              <dl
                className="clases-detail-grid"
                style={{ marginTop: '1.5rem' }}
              >
                <div>
                  <dt>Profesor actual</dt>
                  <dd>
                    {clase.profesor.apellido},{' '}
                    {clase.profesor.nombre}
                  </dd>
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

              {editando && (
                <p>
                  El profesor debe existir. El cupo máximo no puede
                  ser menor que los cupos ocupados.
                </p>
              )}

              {administracion && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    marginTop: '1.5rem',
                  }}
                >
                  {editando ? (
                    <>
                      <Button
                        key="guardar"
                        type="submit"
                        loading={guardando}
                        disabled={guardando}
                      >
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
              )}
            </form>

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
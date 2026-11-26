import { useEffect, useState, type SubmitEvent  } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Spinner } from '../components/ui'
import { ApiError } from '../services/api'
import {
  getProfesorPorId,
  actualizarProfesor,
  type ActualizarProfesorDTO,
} from '../services/profesores'
import type { ProfesorDetalle } from '../models/profesor'

function obtenerDatos(profesor: ProfesorDetalle): ActualizarProfesorDTO {
  return {
    usuarioId: profesor.usuarioId,
    dni: profesor.dni,
    nombre: profesor.nombre,
    apellido: profesor.apellido,
    email: profesor.email,
    telefono: profesor.telefono,
    especialidad: profesor.especialidad,
  }
}

export function ProfesorDetallePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const profesorId = Number(id)

  const [profesor, setProfesor] = useState<ProfesorDetalle | null>(null)
  const [datos, setDatos] = useState<ActualizarProfesorDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    getProfesorPorId(profesorId, controller.signal)
      .then((response) => {
        if (controller.signal.aborted) return

        setProfesor(response.data)
        setDatos(obtenerDatos(response.data))
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

        setProfesor(null)
        setDatos(null)
        setLoading(false)
      })

    return () => controller.abort()
  }, [profesorId])

  function cambiarCampo(
    campo: keyof ActualizarProfesorDTO,
    valor: string | number,
  ) {
    setDatos((actual) =>
      actual ? { ...actual, [campo]: valor } : actual,
    )
  }

  function iniciarEdicion() {
    setError(null)
    setEditando(true)
  }

  function cancelarEdicion() {
    if (!profesor) return

    setDatos(obtenerDatos(profesor))
    setEditando(false)
    setError(null)
  }

  async function guardar(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!datos || !profesor || !editando || guardando) return

    setGuardando(true)
    setError(null)

    try {
      const response = await actualizarProfesor(profesorId, datos)

      const actualizado: ProfesorDetalle = {
        ...profesor,
        ...response.data,
      }

      setProfesor(actualizado)
      setDatos(obtenerDatos(actualizado))
      setEditando(false)
    } catch (error: unknown) {
      setError(
        error instanceof ApiError
          ? error.message
          : 'No se pudo guardar el profesor.',
      )
    } finally {
      setGuardando(false)
    }
  }

  return (
    <section>
      <h1 className="page-title">Detalle del profesor</h1>

      <p className="page-subtitle">
        Consultá y editá los datos del profesor seleccionado.
      </p>

      <button
        type="button"
        onClick={() => navigate('/profesores')}
      >
        Volver al listado
      </button>

      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <Spinner />
      ) : profesor && datos ? (
        <>
          <form onSubmit={guardar}>
            <fieldset disabled={!editando || guardando}>
              <legend>Datos del profesor</legend>

              <label>
                ID
                <input
                  type="number"
                  value={profesor.id}
                  disabled
                />
              </label>

              <label>
                ID de usuario
                <input
                  type="number"
                  value={datos.usuarioId}
                  min={1}
                  required
                  onChange={(event) =>
                    cambiarCampo(
                      'usuarioId',
                      Number(event.target.value),
                    )
                  }
                />
              </label>

              <label>
                DNI
                <input
                  type="text"
                  value={datos.dni}
                  required
                  onChange={(event) =>
                    cambiarCampo('dni', event.target.value)
                  }
                />
              </label>

              <label>
                Nombre
                <input
                  type="text"
                  value={datos.nombre}
                  required
                  onChange={(event) =>
                    cambiarCampo('nombre', event.target.value)
                  }
                />
              </label>

              <label>
                Apellido
                <input
                  type="text"
                  value={datos.apellido}
                  required
                  onChange={(event) =>
                    cambiarCampo('apellido', event.target.value)
                  }
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={datos.email}
                  required
                  onChange={(event) =>
                    cambiarCampo('email', event.target.value)
                  }
                />
              </label>

              <label>
                Teléfono
                <input
                  type="tel"
                  value={datos.telefono}
                  onChange={(event) =>
                    cambiarCampo('telefono', event.target.value)
                  }
                />
              </label>

              <label>
                Especialidad
                <input
                  type="text"
                  value={datos.especialidad}
                  required
                  onChange={(event) =>
                    cambiarCampo('especialidad', event.target.value)
                  }
                />
              </label>
            </fieldset>

            {editando ? (
              <div>
                <button type="submit" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>

                <button
                  type="button"
                  disabled={guardando}
                  onClick={cancelarEdicion}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button type="button" onClick={iniciarEdicion}>
                Editar
              </button>
            )}
          </form>

          <h2>Clases asignadas</h2>

          {profesor.clases.length === 0 ? (
            <p>No tiene clases asignadas.</p>
          ) : (
            <ul>
              {profesor.clases.map((clase) => (
                <li key={clase.id}>{clase.nombre}</li>
              ))}
            </ul>
          )}
        </>
      ) : null}
    </section>
  )
}
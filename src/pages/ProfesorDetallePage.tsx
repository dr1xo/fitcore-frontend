import { useEffect, useState, type SubmitEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Button, FormField, Spinner } from '../components/ui'
import { ApiError } from '../services/api'
import {
  getProfesorPorId,
  actualizarProfesor,
  type ActualizarProfesorDTO,
} from '../services/profesores'
import type { ProfesorDetalle } from '../models/profesor'
import './ProfesorDetallePage.css'

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
    setDatos((actual) => (actual ? { ...actual, [campo]: valor } : actual))
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

      <div className="profesor-detalle-toolbar">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/profesores')}
          disabled={guardando}
        >
          Volver al listado
        </Button>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <Spinner />
      ) : profesor && datos ? (
        <>
          <form className="profesor-detalle-card" onSubmit={guardar}>
            <fieldset
              className="profesor-detalle-fieldset"
              disabled={!editando || guardando}
            >
              <legend>Datos del profesor</legend>

              <div className="profesor-detalle-grid">
                <FormField
                  name="id"
                  label="ID"
                  type="number"
                  value={profesor.id}
                  disabled
                />

                <FormField
                  name="usuarioId"
                  label="ID de usuario"
                  type="number"
                  value={datos.usuarioId}
                  min={1}
                  required
                  onChange={(event) =>
                    cambiarCampo('usuarioId', Number(event.target.value))
                  }
                />

                <FormField
                  name="dni"
                  label="DNI"
                  value={datos.dni}
                  required
                  onChange={(event) => cambiarCampo('dni', event.target.value)}
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
                  name="apellido"
                  label="Apellido"
                  value={datos.apellido}
                  required
                  onChange={(event) =>
                    cambiarCampo('apellido', event.target.value)
                  }
                />

                <FormField
                  name="email"
                  label="Email"
                  type="email"
                  value={datos.email}
                  required
                  onChange={(event) =>
                    cambiarCampo('email', event.target.value)
                  }
                />

                <FormField
                  name="telefono"
                  label="Teléfono"
                  type="tel"
                  value={datos.telefono}
                  onChange={(event) =>
                    cambiarCampo('telefono', event.target.value)
                  }
                />

                <FormField
                  name="especialidad"
                  label="Especialidad"
                  value={datos.especialidad}
                  required
                  onChange={(event) =>
                    cambiarCampo('especialidad', event.target.value)
                  }
                />
              </div>
            </fieldset>

            <div className="profesor-detalle-actions">
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

          <section className="profesor-detalle-card">
            <h2>Clases asignadas</h2>

            {profesor.clases.length === 0 ? (
              <p>No tiene clases asignadas.</p>
            ) : (
              <ul className="profesor-detalle-clases">
                {profesor.clases.map((clase) => (
                  <li key={clase.id}>{clase.nombre}</li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </section>
  )
}

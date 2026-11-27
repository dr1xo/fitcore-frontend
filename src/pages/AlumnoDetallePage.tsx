import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Alert,
  Button,
  FormField,
  FormMessage,
  SelectField,
  Spinner,
} from '../components/ui'
import { useForm } from '../hooks/useForm'
import { ApiError } from '../services/api'
import { getAlumno, updateAlumno } from '../services/alumnos'
import type { Alumno, AlumnoEstado } from '../types/alumno'
import { formatDate } from '../utils/format'
import { email, pattern, required } from '../utils/validators'
import './AlumnosPage.css'

type Result = { id: string; alumno: Alumno } | { id: string; error: string }

// Los valores de un formulario son siempre texto.
type AlumnoFormValues = {
  dni: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  estado: string
}

const ESTADO_OPTIONS = [
  { value: 'activo', label: 'Activo' },
  { value: 'baja', label: 'Baja' },
]

const ESTADO_LABEL: Record<AlumnoEstado, string> = {
  activo: 'Activo',
  baja: 'Baja',
}

function toFormValues(alumno: Alumno): AlumnoFormValues {
  return {
    dni: alumno.dni,
    nombre: alumno.nombre,
    apellido: alumno.apellido,
    email: alumno.email,
    telefono: alumno.telefono,
    estado: alumno.estado,
  }
}

interface AlumnoFormProps {
  alumno: Alumno
  onSaved: (alumno: Alumno) => void
}

// Formulario con todos los datos del alumno. Arranca en modo ver (campos
// deshabilitados); "Editar" lo pasa a modo editar y "Guardar" llama al PUT.
function AlumnoForm({ alumno, onSaved }: AlumnoFormProps) {
  const [editando, setEditando] = useState(false)

  const form = useForm<AlumnoFormValues>({
    initialValues: toFormValues(alumno),
    rules: {
      dni: [
        required(),
        pattern(/^\d{7,8}$/, 'El DNI debe tener 7 u 8 números'),
      ],
      nombre: [required()],
      apellido: [required()],
      email: [required(), email()],
      telefono: [
        pattern(
          /^[\d\s()+-]+$/,
          'Solo se permiten números, espacios, +, - y paréntesis',
        ),
      ],
      estado: [required()],
    },
    onSubmit: async (values) => {
      try {
        const actualizado = await updateAlumno(String(alumno.id), {
          usuarioId: alumno.usuarioId,
          dni: values.dni.trim(),
          nombre: values.nombre.trim(),
          apellido: values.apellido.trim(),
          email: values.email.trim(),
          telefono: values.telefono.trim(),
          estado: values.estado as AlumnoEstado,
        })
        onSaved(actualizado)
        setEditando(false)
      } catch (error) {
        // useForm muestra el mensaje del error: el del back, o uno propio si no hubo respuesta.
        throw new Error(
          error instanceof ApiError
            ? error.message
            : 'No se pudo guardar el alumno.',
        )
      }
    },
    successMessage: 'Los datos del alumno se guardaron correctamente',
  })

  function iniciarEdicion() {
    // Limpia el mensaje de un guardado anterior y parte de los datos guardados.
    form.reset(toFormValues(alumno))
    setEditando(true)
  }

  function cancelarEdicion() {
    form.reset(toFormValues(alumno))
    setEditando(false)
  }

  return (
    <form className="alumno-form" onSubmit={form.handleSubmit} noValidate>
      <fieldset
        className="alumno-form__fieldset"
        disabled={!editando || form.submitting}
      >
        <legend>Datos del alumno</legend>

        <div className="alumno-form__grid">
          <FormField
            label="Nombre"
            required
            {...form.getFieldProps('nombre')}
          />
          <FormField
            label="Apellido"
            required
            {...form.getFieldProps('apellido')}
          />
          <FormField label="DNI" required {...form.getFieldProps('dni')} />
          <FormField
            label="Email"
            type="email"
            required
            {...form.getFieldProps('email')}
          />
          <FormField
            label="Teléfono"
            type="tel"
            {...form.getFieldProps('telefono')}
          />
          <SelectField
            label="Estado"
            required
            options={ESTADO_OPTIONS}
            {...form.getFieldProps('estado')}
          />

          {/* Los datos que pone el servidor se muestran, pero no se editan. */}
          <FormField name="id" label="ID" value={alumno.id} disabled />
          <FormField
            name="usuarioId"
            label="Usuario asociado"
            value={alumno.usuarioId}
            disabled
          />
          <FormField
            name="fechaAlta"
            label="Fecha de alta"
            value={formatDate(alumno.fechaAlta)}
            disabled
          />
        </div>
      </fieldset>

      <FormMessage status={form.status} message={form.message} />

      <div className="alumno-form__actions">
        {editando ? (
          <>
            <Button key="guardar" type="submit" loading={form.submitting}>
              {form.submitting ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button
              key="cancelar"
              type="button"
              variant="secondary"
              disabled={form.submitting}
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
  )
}

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

      {!loading && alumno && (
        <>
          <h1 className="page-title">
            {alumno.apellido}, {alumno.nombre}
          </h1>
          <p className="page-subtitle">
            <span className={`badge badge--${alumno.estado}`}>
              {ESTADO_LABEL[alumno.estado]}
            </span>
          </p>

          <AlumnoForm
            key={alumno.id}
            alumno={alumno}
            onSaved={(actualizado) => setResult({ id, alumno: actualizado })}
          />
        </>
      )}
    </section>
  )
}
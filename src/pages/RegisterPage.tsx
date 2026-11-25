import { Link } from 'react-router-dom'
import { Alert, Button, FormField } from '../components/ui'
import { useForm } from '../hooks/useForm'
import { useSession } from '../hooks/useSession'
import { email, minLength, required } from '../utils/validators'
import './AuthPage.css'

export function RegisterPage() {
  const { register } = useSession()
  const form = useForm({
    initialValues: { nombre: '', email: '', password: '' },
    rules: {
      nombre: [required('Ingresá tu nombre')],
      email: [required('Ingresá tu email'), email()],
      password: [
        required('Ingresá una contraseña'),
        minLength(8, 'La contraseña debe tener al menos 8 caracteres'),
      ],
    },
    // Al registrarse queda logueado como Alumno y GuestOnly lo redirige.
    onSubmit: (values) =>
      register(values.nombre.trim(), values.email.trim(), values.password),
  })

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-card__brand">
          Fit<span>Core</span>
        </p>
        <h1 className="page-title">Crear cuenta</h1>
        <p className="page-subtitle">Registrate como alumno del gimnasio.</p>

        <form className="form" onSubmit={form.handleSubmit} noValidate>
          <FormField
            label="Nombre y apellido"
            autoComplete="name"
            required
            {...form.getFieldProps('nombre')}
          />
          <FormField
            label="Email"
            type="email"
            autoComplete="email"
            required
            {...form.getFieldProps('email')}
          />
          <FormField
            label="Contraseña"
            type="password"
            autoComplete="new-password"
            required
            {...form.getFieldProps('password')}
          />
          {form.status === 'error' && (
            <Alert type="error">{form.message}</Alert>
          )}
          <div className="form-actions">
            <Button type="submit" loading={form.submitting}>
              Crear cuenta
            </Button>
          </div>
        </form>

        <p className="auth-card__footer">
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </section>
    </main>
  )
}

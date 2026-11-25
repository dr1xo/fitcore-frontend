import { Link } from 'react-router-dom'
import { Alert, Button, FormField } from '../components/ui'
import { useForm } from '../hooks/useForm'
import { useSession } from '../hooks/useSession'
import { email, required } from '../utils/validators'
import './AuthPage.css'

export function LoginPage() {
  const { login } = useSession()
  const form = useForm({
    initialValues: { email: '', password: '' },
    rules: {
      email: [required('Ingresá tu email'), email()],
      password: [required('Ingresá tu contraseña')],
    },
    // Si el login sale bien, GuestOnly redirige a la página del perfil.
    onSubmit: (values) => login(values.email.trim(), values.password),
  })

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-card__brand">
          Fit<span>Core</span>
        </p>
        <h1 className="page-title">Iniciar sesión</h1>
        <p className="page-subtitle">Ingresá con tu email y contraseña.</p>

        <form className="form" onSubmit={form.handleSubmit} noValidate>
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
            autoComplete="current-password"
            required
            {...form.getFieldProps('password')}
          />
          {form.status === 'error' && (
            <Alert type="error">{form.message}</Alert>
          )}
          <div className="form-actions">
            <Button type="submit" loading={form.submitting}>
              Ingresar
            </Button>
          </div>
        </form>

        <p className="auth-card__footer">
          ¿No tenés cuenta? <Link to="/registro">Registrate</Link>
        </p>
      </section>
    </main>
  )
}

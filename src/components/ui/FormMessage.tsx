import type { FormStatus } from '../../hooks/useForm'
import { Alert } from './Alert'
import { Spinner } from './Spinner'

interface FormMessageProps {
    status: FormStatus
    message: string
}

// Muestra el estado del formulario: cargando, éxito o error.
export function FormMessage({ status, message }: FormMessageProps) {
    if (status === 'submitting') return <Spinner label="Guardando..." />
    if (status === 'success') return <Alert type="success">{message}</Alert>
    if (status === 'error') return <Alert type="error">{message}</Alert>
    return null
}
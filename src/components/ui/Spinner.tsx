import './feedback.css'

interface SpinnerProps {
  label?: string
}

export function Spinner({ label = 'Cargando...' }: SpinnerProps) {
  return (
    <span className="spinner-wrapper" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}

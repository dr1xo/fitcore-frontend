import { useEffect, useState } from 'react'
import { checkHealth } from '../../services/api'
import './ApiStatus.css'

type ApiState = 'checking' | 'online' | 'offline'

const LABELS: Record<ApiState, string> = {
  checking: 'Conectando con el servidor...',
  online: 'Servidor conectado',
  offline: 'Sin conexión con el servidor',
}

// Indica si el front logra comunicarse con el back (URL correcta y CORS habilitado).
export function ApiStatus() {
  const [state, setState] = useState<ApiState>('checking')

  useEffect(() => {
    const controller = new AbortController()

    checkHealth(controller.signal)
      .then((isOk) => setState(isOk ? 'online' : 'offline'))
      .catch(() => {
        if (!controller.signal.aborted) setState('offline')
      })

    return () => controller.abort()
  }, [])

  return (
    <div className={`api-status api-status--${state}`} role="status">
      <span className="api-status__dot" aria-hidden="true" />
      {LABELS[state]}
    </div>
  )
}

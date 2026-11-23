import type { ReactNode } from 'react'
import './feedback.css'

export type AlertType = 'error' | 'success' | 'info'

interface AlertProps {
  type: AlertType
  children: ReactNode
}

export function Alert({ type, children }: AlertProps) {
  return (
    <div
      className={`alert alert--${type}`}
      role={type === 'error' ? 'alert' : 'status'}
    >
      {children}
    </div>
  )
}

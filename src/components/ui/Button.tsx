import type { ButtonHTMLAttributes } from 'react'
import './Button.css'
import './feedback.css'

type ButtonVariant = 'primary' | 'secondary' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    loading?: boolean
}

export function Button({
    variant = 'primary',
    loading = false,
    disabled,
    className,
    type = 'button',
    children,
    ...rest
}: ButtonProps) {
    const classes = ['btn', `btn--${variant}`, className]
        .filter(Boolean)
        .join(' ')

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            aria-busy={loading}
            {...rest}
        >
            {loading && (
                <span className="spinner spinner--small" aria-hidden="true" />
            )}
            {children}
        </button>
    )
}
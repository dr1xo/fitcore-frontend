import { useId, type InputHTMLAttributes } from 'react'
import './form.css'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    name: string
    label: string
    error?: string
}

export function FormField({
    label,
    error,
    id,
    required,
    ...inputProps
}: FormFieldProps) {
    const generatedId = useId()
    const fieldId = id ?? generatedId
    const errorId = `${fieldId}-error`

    return (
        <div className={error ? 'field field--invalid' : 'field'}>
            <label htmlFor={fieldId} className="field__label">
                {label}
                {required && (
                    <span className="field__required" aria-hidden="true">
                        {' '}
                        *
                    </span>
                )}
            </label>
            <input
                id={fieldId}
                className="field__control"
                required={required}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                {...inputProps}
            />
            {error && (
                <p id={errorId} className="field__error" role="alert">
                    {error}
                </p>
            )}
        </div>
    )
}
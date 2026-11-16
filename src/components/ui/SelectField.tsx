import { useId, type SelectHTMLAttributes } from 'react'
import './form.css'

export interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  name: string
  label: string
  options: SelectOption[]
  placeholder?: string
  error?: string
}

export function SelectField({
  label,
  options,
  placeholder,
  error,
  id,
  required,
  ...selectProps
}: SelectFieldProps) {
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
      <select
        id={fieldId}
        className="field__control"
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...selectProps}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

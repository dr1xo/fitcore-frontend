import { useId } from 'react'
import './search.css'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
  label = 'Buscar',
}: SearchInputProps) {
  const id = useId()

  return (
    <div className="search">
      <label htmlFor={id} className="search__label">
        {label}
      </label>
      <input
        id={id}
        type="search"
        className="search__input"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

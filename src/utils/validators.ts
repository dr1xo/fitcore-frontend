// Un validador recibe el valor del campo (y todos los valores del formulario)
// y devuelve el mensaje de error, o undefined si el valor es válido.
export type Validator<V = Record<string, string>> = (
  value: string,
  values: V,
) => string | undefined

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isEmpty = (value: string) => value.trim() === ''

export function required(message = 'Este campo es obligatorio'): Validator {
  return (value) => (isEmpty(value) ? message : undefined)
}

// Los validadores siguientes ignoran los campos vacíos: si el campo es
// obligatorio, combinalos con required().
export function minLength(
  min: number,
  message = `Debe tener al menos ${min} caracteres`,
): Validator {
  return (value) =>
    !isEmpty(value) && value.trim().length < min ? message : undefined
}

export function maxLength(
  max: number,
  message = `Debe tener como máximo ${max} caracteres`,
): Validator {
  return (value) => (value.trim().length > max ? message : undefined)
}

export function email(message = 'Ingresá un email válido'): Validator {
  return (value) =>
    !isEmpty(value) && !EMAIL_REGEX.test(value.trim()) ? message : undefined
}

export function positiveNumber(
  message = 'Ingresá un número mayor a 0',
): Validator {
  return (value) => {
    if (isEmpty(value)) return undefined
    const number = Number(value.replace(',', '.'))
    return Number.isFinite(number) && number > 0 ? undefined : message
  }
}

export function pattern(regex: RegExp, message: string): Validator {
  return (value) =>
    !isEmpty(value) && !regex.test(value) ? message : undefined
}

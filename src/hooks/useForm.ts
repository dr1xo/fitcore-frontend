import { useState, type ChangeEvent, type FormEvent } from 'react'
import type { Validator } from '../utils/validators'

export type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

type Rules<V> = { [K in keyof V]?: Validator<V>[] }
type Errors<V> = { [K in keyof V]?: string }
type Touched<V> = { [K in keyof V]?: boolean }

interface UseFormOptions<V> {
    initialValues: V
    rules?: Rules<V>
    onSubmit: (values: V) => Promise<void> | void
    successMessage?: string
}

function validateField<V extends Record<string, string>>(
    name: keyof V,
    values: V,
    rules: Rules<V>,
): string | undefined {
    for (const rule of rules[name] ?? []) {
        const error = rule(values[name], values)
        if (error) return error
    }
    return undefined
}

export function useForm<V extends Record<string, string>>({
    initialValues,
    rules = {},
    onSubmit,
    successMessage = 'Los datos se guardaron correctamente',
}: UseFormOptions<V>) {
    const [values, setValues] = useState<V>(initialValues)
    const [errors, setErrors] = useState<Errors<V>>({})
    const [touched, setTouched] = useState<Touched<V>>({})
    const [status, setStatus] = useState<FormStatus>('idle')
    const [message, setMessage] = useState('')

    function handleChange(name: keyof V, value: string) {
        const nextValues = { ...values, [name]: value }
        setValues(nextValues)
        if (touched[name]) {
            setErrors((previous) => ({
                ...previous,
                [name]: validateField(name, nextValues, rules),
            }))
        }
        // Al volver a editar, desaparece el mensaje de éxito o de error anterior.
        if (status !== 'idle' && status !== 'submitting') {
            setStatus('idle')
            setMessage('')
        }
    }

    function handleBlur(name: keyof V) {
        setTouched((previous) => ({ ...previous, [name]: true }))
        setErrors((previous) => ({
            ...previous,
            [name]: validateField(name, values, rules),
        }))
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const foundErrors: Errors<V> = {}
        const allTouched: Touched<V> = {}
        for (const name of Object.keys(values) as (keyof V)[]) {
            allTouched[name] = true
            const error = validateField(name, values, rules)
            if (error) foundErrors[name] = error
        }
        setTouched(allTouched)
        setErrors(foundErrors)
        if (Object.keys(foundErrors).length > 0) return

        setStatus('submitting')
        setMessage('')
        try {
            await onSubmit(values)
            setStatus('success')
            setMessage(successMessage)
        } catch (error) {
            setStatus('error')
            setMessage(
                error instanceof Error ? error.message : 'Ocurrió un error inesperado',
            )
        }
    }

    function reset(nextValues: V = initialValues) {
        setValues(nextValues)
        setErrors({})
        setTouched({})
        setStatus('idle')
        setMessage('')
    }

    // Devuelve las props que necesita un FormField o un SelectField.
    function getFieldProps(name: keyof V & string) {
        return {
            name,
            value: values[name],
            error: touched[name] ? errors[name] : undefined,
            onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
                handleChange(name, event.target.value),
            onBlur: () => handleBlur(name),
        }
    }

    return {
        values,
        status,
        message,
        submitting: status === 'submitting',
        handleSubmit,
        getFieldProps,
        reset,
    }
}
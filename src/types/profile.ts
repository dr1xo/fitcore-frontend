export type Profile = 'alumno' | 'profesor' | 'administracion'

export const PROFILES: { value: Profile; label: string }[] = [
    { value: 'alumno', label: 'Alumno' },
    { value: 'profesor', label: 'Profesor' },
    { value: 'administracion', label: 'Administración' },
]
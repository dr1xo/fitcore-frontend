import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ApiError } from '../services/api'
import { getAlumno, updateAlumno } from '../services/alumnos'
import type { Alumno } from '../types/alumno'
import { AlumnoDetallePage } from './AlumnoDetallePage'

vi.mock('../services/alumnos', () => ({
    getAlumno: vi.fn(),
    updateAlumno: vi.fn(),
}))

const alumno: Alumno = {
    id: 1,
    usuarioId: 11,
    dni: '43396013',
    nombre: 'Lucía',
    apellido: 'Gómez',
    email: 'lucia.gomez88@gmail.com',
    telefono: '2916501511',
    fechaAlta: '2024-03-04',
    estado: 'activo',
}

const GUARDADO = 'Los datos del alumno se guardaron correctamente'

function renderPage() {
    return render(
        <MemoryRouter initialEntries={['/gestion-alumnos/1']}>
            <Routes>
                <Route path="/gestion-alumnos/:id" element={<AlumnoDetallePage />} />
            </Routes>
        </MemoryRouter>,
    )
}

describe('AlumnoDetallePage', () => {
    beforeEach(() => {
        vi.resetAllMocks()
        vi.mocked(getAlumno).mockResolvedValue(alumno)
    })

    it('muestra un indicador mientras carga el alumno', () => {
        vi.mocked(getAlumno).mockImplementation(() => new Promise(() => { }))

        renderPage()

        expect(screen.getByRole('status')).toHaveTextContent('Cargando')
    })

    it('carga el alumno con el ID de la URL', async () => {
        renderPage()

        await screen.findByLabelText(/^Nombre/)

        expect(getAlumno).toHaveBeenCalledWith('1', expect.any(AbortSignal))
    })

    it('muestra todos los datos del alumno en modo ver', async () => {
        renderPage()

        expect(await screen.findByLabelText(/^Nombre/)).toHaveValue('Lucía')
        expect(screen.getByLabelText(/^Apellido/)).toHaveValue('Gómez')
        expect(screen.getByLabelText(/^DNI/)).toHaveValue('43396013')
        expect(screen.getByLabelText(/^Email/)).toHaveValue(
            'lucia.gomez88@gmail.com',
        )
        expect(screen.getByLabelText(/^Teléfono/)).toHaveValue('2916501511')
        expect(screen.getByLabelText(/^Estado/)).toHaveValue('activo')
        expect(screen.getByLabelText(/^ID/)).toHaveValue('1')
        expect(screen.getByLabelText(/^Usuario asociado/)).toHaveValue('11')
        expect(screen.getByLabelText(/^Fecha de alta/)).toHaveValue('04/03/2024')

        expect(
            screen.getByRole('heading', { name: 'Gómez, Lucía' }),
        ).toBeVisible()

        expect(screen.getByLabelText(/^Nombre/)).toBeDisabled()
        expect(screen.getByLabelText(/^Estado/)).toBeDisabled()
        expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: 'Guardar' }),
        ).not.toBeInTheDocument()
    })

    it('habilita los campos editables al presionar Editar', async () => {
        const user = userEvent.setup()

        renderPage()

        await user.click(await screen.findByRole('button', { name: 'Editar' }))

        expect(screen.getByLabelText(/^Nombre/)).toBeEnabled()
        expect(screen.getByLabelText(/^Apellido/)).toBeEnabled()
        expect(screen.getByLabelText(/^DNI/)).toBeEnabled()
        expect(screen.getByLabelText(/^Email/)).toBeEnabled()
        expect(screen.getByLabelText(/^Teléfono/)).toBeEnabled()
        expect(screen.getByLabelText(/^Estado/)).toBeEnabled()

        // Los datos que pone el servidor no se editan.
        expect(screen.getByLabelText(/^ID/)).toBeDisabled()
        expect(screen.getByLabelText(/^Usuario asociado/)).toBeDisabled()
        expect(screen.getByLabelText(/^Fecha de alta/)).toBeDisabled()

        expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: 'Editar' }),
        ).not.toBeInTheDocument()
    })

    it('descarta los cambios al cancelar', async () => {
        const user = userEvent.setup()

        renderPage()

        await user.click(await screen.findByRole('button', { name: 'Editar' }))

        const nombre = screen.getByLabelText(/^Nombre/)
        await user.clear(nombre)
        await user.type(nombre, 'Juan')

        await user.click(screen.getByRole('button', { name: 'Cancelar' }))

        expect(screen.getByLabelText(/^Nombre/)).toHaveValue('Lucía')
        expect(screen.getByLabelText(/^Nombre/)).toBeDisabled()
        expect(updateAlumno).not.toHaveBeenCalled()
    })

    it('al guardar llama al PUT con los datos del formulario y vuelve a modo ver', async () => {
        const user = userEvent.setup()

        vi.mocked(updateAlumno).mockResolvedValue({
            ...alumno,
            telefono: '2915551234',
        })

        renderPage()

        await user.click(await screen.findByRole('button', { name: 'Editar' }))

        const telefono = screen.getByLabelText(/^Teléfono/)
        await user.clear(telefono)
        await user.type(telefono, '2915551234')

        await user.click(screen.getByRole('button', { name: 'Guardar' }))

        expect(await screen.findByText(GUARDADO)).toBeInTheDocument()

        expect(updateAlumno).toHaveBeenCalledWith('1', {
            usuarioId: 11,
            dni: '43396013',
            nombre: 'Lucía',
            apellido: 'Gómez',
            email: 'lucia.gomez88@gmail.com',
            telefono: '2915551234',
            estado: 'activo',
        })

        expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
        expect(screen.getByLabelText(/^Teléfono/)).toHaveValue('2915551234')
        expect(screen.getByLabelText(/^Teléfono/)).toBeDisabled()
    })

    it('permite dar de baja a un alumno cambiando el estado', async () => {
        const user = userEvent.setup()

        vi.mocked(updateAlumno).mockResolvedValue({ ...alumno, estado: 'baja' })

        renderPage()

        await user.click(await screen.findByRole('button', { name: 'Editar' }))
        await user.selectOptions(screen.getByLabelText(/^Estado/), 'baja')
        await user.click(screen.getByRole('button', { name: 'Guardar' }))

        expect(await screen.findByText(GUARDADO)).toBeInTheDocument()

        expect(updateAlumno).toHaveBeenCalledWith(
            '1',
            expect.objectContaining({ estado: 'baja' }),
        )
        expect(document.querySelector('.badge')).toHaveTextContent('Baja')
    })

    it('no guarda si falta un campo obligatorio', async () => {
        const user = userEvent.setup()

        renderPage()

        await user.click(await screen.findByRole('button', { name: 'Editar' }))
        await user.clear(screen.getByLabelText(/^Nombre/))
        await user.click(screen.getByRole('button', { name: 'Guardar' }))

        expect(await screen.findByText('Este campo es obligatorio')).toBeVisible()
        expect(screen.getByLabelText(/^Nombre/)).toBeInvalid()
        expect(updateAlumno).not.toHaveBeenCalled()
        expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
    })

    it('no guarda si el email no es válido', async () => {
        const user = userEvent.setup()

        renderPage()

        await user.click(await screen.findByRole('button', { name: 'Editar' }))

        const campoEmail = screen.getByLabelText(/^Email/)
        await user.clear(campoEmail)
        await user.type(campoEmail, 'no-es-un-email')
        await user.click(screen.getByRole('button', { name: 'Guardar' }))

        expect(await screen.findByText('Ingresá un email válido')).toBeVisible()
        expect(updateAlumno).not.toHaveBeenCalled()
    })

    it('no guarda si el DNI no tiene 7 u 8 números', async () => {
        const user = userEvent.setup()

        renderPage()

        await user.click(await screen.findByRole('button', { name: 'Editar' }))

        const dni = screen.getByLabelText(/^DNI/)
        await user.clear(dni)
        await user.type(dni, '123')
        await user.click(screen.getByRole('button', { name: 'Guardar' }))

        expect(
            await screen.findByText('El DNI debe tener 7 u 8 números'),
        ).toBeVisible()
        expect(updateAlumno).not.toHaveBeenCalled()
    })

    it('muestra el error del back al guardar y sigue en modo editar', async () => {
        const user = userEvent.setup()

        vi.mocked(updateAlumno).mockRejectedValue(
            new ApiError('El DNI ya está registrado', 409),
        )

        renderPage()

        await user.click(await screen.findByRole('button', { name: 'Editar' }))
        await user.click(screen.getByRole('button', { name: 'Guardar' }))

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'El DNI ya está registrado',
        )
        expect(screen.getByLabelText(/^Nombre/)).toBeEnabled()
    })

    it('muestra un mensaje propio si no hay conexión al guardar', async () => {
        const user = userEvent.setup()

        vi.mocked(updateAlumno).mockRejectedValue(new Error('Failed to fetch'))

        renderPage()

        await user.click(await screen.findByRole('button', { name: 'Editar' }))
        await user.click(screen.getByRole('button', { name: 'Guardar' }))

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'No se pudo guardar el alumno.',
        )
    })

    it('muestra el mensaje del back si el alumno no existe', async () => {
        vi.mocked(getAlumno).mockRejectedValue(
            new ApiError('Alumno no encontrado', 404),
        )

        renderPage()

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Alumno no encontrado',
        )
        expect(screen.queryByLabelText(/^Nombre/)).not.toBeInTheDocument()
    })

    it('muestra un error si no se puede conectar al cargar', async () => {
        vi.mocked(getAlumno).mockRejectedValue(new Error('Failed to fetch'))

        renderPage()

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'No se pudo conectar con el servidor.',
        )
    })
})
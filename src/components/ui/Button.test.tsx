import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renderiza el texto recibido como children', () => {
    render(<Button>Guardar</Button>)

    expect(
      screen.getByRole('button', { name: 'Guardar' }),
    ).toBeInTheDocument()
  })

  it('ejecuta onClick al hacer clic', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Inscribirse</Button>)
    await user.click(screen.getByRole('button', { name: 'Inscribirse' }))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('deshabilita el botón cuando loading es true', () => {
    render(<Button loading>Guardando</Button>)

    const button = screen.getByRole('button', { name: 'Guardando' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })
})
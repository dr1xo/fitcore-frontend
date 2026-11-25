import { Link } from 'react-router-dom'
import { useSession } from '../../hooks/useSession'

interface HeaderProps {
  menuOpen: boolean
  onToggleMenu: () => void
}

export function Header({ menuOpen, onToggleMenu }: HeaderProps) {
  const { usuario, logout } = useSession()

  return (
    <header className="header">
      <button
        type="button"
        className="header__menu-button"
        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={menuOpen}
        onClick={onToggleMenu}
      >
        ☰
      </button>
      <Link to="/" className="header__brand">
        Fit<span>Core</span>
      </Link>
      <div className="header__session">
        <span className="header__user">{usuario?.nombre}</span>
        <button type="button" className="header__logout" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}

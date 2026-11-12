import { Link } from 'react-router-dom'
import { ProfileSwitcher } from './ProfileSwitcher'

interface HeaderProps {
  menuOpen: boolean
  onToggleMenu: () => void
}

export function Header({ menuOpen, onToggleMenu }: HeaderProps) {
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
      <ProfileSwitcher />
    </header>
  )
}

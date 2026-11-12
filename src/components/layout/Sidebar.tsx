import { NavLink } from 'react-router-dom'
import { getMenuFor } from '../../config/routes'
import { useProfile } from '../../hooks/useProfile'
import { PROFILES } from '../../types/profile'

interface SidebarProps {
  open: boolean
  onNavigate: () => void
}

export function Sidebar({ open, onNavigate }: SidebarProps) {
  const { profile } = useProfile()
  const profileLabel = PROFILES.find((item) => item.value === profile)?.label

  return (
    <aside className={open ? 'sidebar sidebar--open' : 'sidebar'}>
      <p className="sidebar__profile">{profileLabel}</p>
      <nav aria-label="Menú principal">
        <ul className="sidebar__list">
          {getMenuFor(profile).map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  isActive
                    ? 'sidebar__link sidebar__link--active'
                    : 'sidebar__link'
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

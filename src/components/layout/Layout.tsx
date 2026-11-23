import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="layout">
      <Header
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((open) => !open)}
      />
      <div className="layout__body">
        <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
        <main className="layout__content">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}

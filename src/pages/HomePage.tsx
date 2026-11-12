import { Link } from 'react-router-dom'
import { getMenuFor } from '../config/routes'
import { useProfile } from '../hooks/useProfile'
import { PROFILES } from '../types/profile'

export function HomePage() {
    const { profile } = useProfile()
    const profileLabel = PROFILES.find((item) => item.value === profile)?.label
    const sections = getMenuFor(profile).filter((item) => item.path !== '/')

    return (
        <section>
            <h1 className="page-title">Bienvenido a FitCore</h1>
            <p className="page-subtitle">
                Estás navegando como <strong>{profileLabel}</strong>.
            </p>
            <div className="card-grid">
                {sections.map((item) => (
                    <Link key={item.path} to={item.path} className="card">
                        <h2>{item.label}</h2>
                        <p>{item.description}</p>
                    </Link>
                ))}
            </div>
        </section>
    )
}
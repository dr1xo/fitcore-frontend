import { Link } from 'react-router-dom'

export function NotFoundPage() {
    return (
        <section>
            <h1 className="page-title">Página no encontrada</h1>
            <p className="page-subtitle">La sección que buscás no existe.</p>
            <Link to="/" className="button">
                Volver al inicio
            </Link>
        </section>
    )
}
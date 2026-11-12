interface SectionPageProps {
    title: string
    description: string
}

// Pantalla provisoria: cada sección se reemplaza por su página real más adelante.
export function SectionPage({ title, description }: SectionPageProps) {
    return (
        <section>
            <h1 className="page-title">{title}</h1>
            <p className="page-subtitle">{description}</p>
            <div className="placeholder">Sección en construcción</div>
        </section>
    )
}
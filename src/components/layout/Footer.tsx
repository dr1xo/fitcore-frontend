const currentYear = new Date().getFullYear()

export function Footer() {
    return (
        <footer className="footer">
            <p>© {currentYear} FitCore · Gestión de clases de gimnasio</p>
        </footer>
    )
}
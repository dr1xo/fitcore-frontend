// Convierte AAAA-MM-DD en DD/MM/AAAA (sin pasar por Date, para evitar corrimientos de zona horaria).
export function formatDate(isoDate: string): string {
    const [year, month, day] = isoDate.split('-')
    if (!year || !month || !day) return isoDate
    return `${day}/${month}/${year}`
}
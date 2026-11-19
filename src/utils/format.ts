// Convierte AAAA-MM-DD en DD/MM/AAAA (sin pasar por Date, para evitar corrimientos de zona horaria).
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  if (!year || !month || !day) return isoDate
  return `${day}/${month}/${year}`
}

// Convierte AAAA-MM en MM/AAAA.
export function formatPeriodo(periodo: string): string {
  const [year, month] = periodo.split('-')
  if (!year || !month) return periodo
  return `${month}/${year}`
}

// Muestra un monto como pesos argentinos, por ejemplo $ 25.000,00.
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(amount)
}

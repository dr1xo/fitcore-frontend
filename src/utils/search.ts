// Pasa a minúsculas y quita acentos, para que "Perez" encuentre "Pérez".
function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').trim()
}

// Devuelve los elementos en los que alguno de los campos indicados contiene el texto buscado.
export function filterBySearch<T extends object>(
  items: T[],
  term: string,
  keys: (keyof T)[],
): T[] {
  const search = normalize(term)
  if (search === '') return items

  return items.filter((item) =>
    keys.some((key) => normalize(String(item[key] ?? '')).includes(search)),
  )
}

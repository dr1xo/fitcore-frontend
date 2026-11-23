// La URL del back se configura con la variable de entorno VITE_API_URL.
// Vite la incorpora al construir el proyecto, así que al cambiarla hay que volver a desplegar.
export const API_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'
).replace(/\/+$/, '')

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  signal?: AbortSignal
  headers?: Record<string, string>
}

// El contrato dice que el back responde los errores como { "error": "mensaje" },
// pero también se aceptan { "error": { "message": "..." } } y { "message": "..." }.
async function getErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as {
      error?: unknown
      message?: unknown
    }
    const detail = body.error ?? body.message
    if (typeof detail === 'string') return detail
    if (
      detail &&
      typeof detail === 'object' &&
      'message' in detail &&
      typeof detail.message === 'string'
    ) {
      return detail.message
    }
  } catch {
    // La respuesta no es JSON: se usa el mensaje genérico.
  }
  return `Error ${response.status} al consultar el servidor`
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, signal, headers }: RequestOptions = {},
): Promise<T> {
  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  }
  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    signal,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!response.ok) {
    throw new ApiError(await getErrorMessage(response), response.status)
  }
  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}

export function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  return apiRequest<T>(path, { signal })
}

// Consulta /health: si responde bien, el back está disponible y acepta pedidos del front.
// Falla (lanza un error) si no hay conexión, si CORS lo bloquea o si responde con error.
export async function checkHealth(signal?: AbortSignal): Promise<void> {
  await apiGet<unknown>('/health', signal)
}

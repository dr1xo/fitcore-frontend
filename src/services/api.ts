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

// El back responde los errores como { "error": "mensaje" }.
async function getErrorMessage(response: Response): Promise<string> {
    try {
        const body = (await response.json()) as { error?: string }
        if (body.error) return body.error
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

// Consulta /health: sirve para comprobar que el back está disponible y acepta pedidos del front.
export async function checkHealth(signal?: AbortSignal): Promise<boolean> {
    const response = await apiGet<{ status: string }>('/health', signal)
    return response.status === 'ok'
}
import type { ItemResponse } from '../types/api'
import type { Usuario } from '../models/usuario'
import { ApiError, apiRequest } from './api'

// Respuesta de POST /auth/login y POST /auth/register (contrato de la API).
export interface Session {
  token: string
  usuario: Usuario
}

async function postSession(path: string, body: unknown): Promise<Session> {
  try {
    const response = await apiRequest<ItemResponse<Session>>(path, {
      method: 'POST',
      body,
    })
    return response.data
  } catch (error) {
    // Los errores del back (400, 401, 409) ya traen un mensaje para el usuario.
    if (error instanceof ApiError) throw error
    throw new Error('No se pudo conectar con el servidor.')
  }
}

// POST /auth/login
export function loginUser(email: string, password: string): Promise<Session> {
  return postSession('/auth/login', { email, password })
}

// POST /auth/register: crea un usuario con perfil Alumno y devuelve su sesión.
export function registerUser(
  nombre: string,
  email: string,
  password: string,
): Promise<Session> {
  return postSession('/auth/register', { nombre, email, password })
}

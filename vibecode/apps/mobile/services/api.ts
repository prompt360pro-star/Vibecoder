// API Client — HTTP client com autenticação Clerk
// Injeta Bearer token em todos os requests
import type { ApiResponse } from '@vibecode/shared'

// Classe de erro personalizada para erros de API
export class ApiError extends Error {
  code: string
  status: number

  constructor(code: string, message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

// Tipo do token getter — será injectado pelo hook use-api-setup
type TokenGetter = () => Promise<string | null>

let _getToken: TokenGetter | null = null
let _baseUrl = ''

// Configurar o API client com o token getter e base URL
export const configureApi = (getToken: TokenGetter, baseUrl: string) => {
  _getToken = getToken
  _baseUrl = baseUrl
}

// Método interno para fazer requests
const request = async <T>(
  method: string,
  endpoint: string,
  body?: unknown,
): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Injectar token de auth se disponível
  if (_getToken) {
    const token = await _getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  const url = `${_baseUrl}${endpoint}`

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = (await response.json()) as ApiResponse<T>

  if (!response.ok || !data.success) {
    const error = data.error
    throw new ApiError(
      error?.code ?? 'UNKNOWN',
      error?.message ?? 'An unexpected error occurred',
      response.status,
    )
  }

  return data.data as T
}

// Métodos públicos do API client
export const api = {
  get: <T>(endpoint: string) => request<T>('GET', endpoint),
  post: <T>(endpoint: string, body?: unknown) => request<T>('POST', endpoint, body),
  put: <T>(endpoint: string, body?: unknown) => request<T>('PUT', endpoint, body),
  delete: <T>(endpoint: string) => request<T>('DELETE', endpoint),
}

/**
 * api/client.ts
 * -------------
 * Tiny helper for talking to the FastAPI backend.
 *
 * fetch() = browser function that sends HTTP requests.
 * We wrap it so every call:
 *  - points at the right base URL
 *  - sends JSON
 *  - attaches the login token when we have one
 */

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

type RequestOptions = {
  method?: string
  body?: unknown
  token?: string | null
  form?: boolean
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {}

  if (options.token) {
    // Backend expects: Authorization: Bearer <jwt>
    headers.Authorization = `Bearer ${options.token}`
  }

  let body: BodyInit | undefined
  if (options.form && options.body && typeof options.body === 'object') {
    // Login uses form data (OAuth2PasswordRequestForm on the backend)
    const form = new URLSearchParams()
    for (const [key, value] of Object.entries(options.body as Record<string, string>)) {
      form.set(key, value)
    }
    body = form
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
  } else if (options.body !== undefined) {
    body = JSON.stringify(options.body)
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body,
  })

  if (!response.ok) {
    let detail = `Request failed (${response.status})`
    try {
      const data = await response.json()
      if (typeof data?.detail === 'string') detail = data.detail
    } catch {
      // ignore JSON parse errors
    }
    throw new ApiError(response.status, detail)
  }

  // 204 No Content has no body
  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

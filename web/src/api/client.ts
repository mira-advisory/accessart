// The one typed API client for the web surface (house rule 8: components
// never fetch directly). All calls go through request<T> below.
import { fetchAuthSession } from 'aws-amplify/auth'
import { authConfigured } from '../auth'

export type AaUser = {
  user_id: string
  email: string | null
  handle?: string
  name?: string
  roles: string[]
  market_id: string
  created_at: string
}

// Error envelope is { ok:false, error, message } (CLAUDE.md rule 2).
export class ApiError extends Error {
  code: string
  status: number

  constructor(message: string, code: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (!raw) throw new ApiError('backend is not wired up yet.', 'NO_API_BASE', 0)
  const base = raw.replace(/\/+$/, '')

  const headers = new Headers(init?.headers)
  headers.set('content-type', 'application/json')
  if (authConfigured) {
    try {
      const session = await fetchAuthSession()
      const token = session.tokens?.idToken?.toString()
      if (token) headers.set('authorization', `Bearer ${token}`)
    } catch {
      // no session: send the request unauthenticated
    }
  }

  const res = await fetch(`${base}${path}`, { ...init, headers })
  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    // non-json response body: fall through to status handling
  }

  const envelope = (body ?? {}) as {
    ok?: boolean
    data?: T
    error?: string
    message?: string
  }

  if (!res.ok || envelope.ok === false) {
    throw new ApiError(
      typeof envelope.message === 'string' && envelope.message
        ? envelope.message
        : `request failed (${res.status}).`,
      typeof envelope.error === 'string' && envelope.error ? envelope.error : 'UNKNOWN',
      res.status,
    )
  }

  return envelope.data as T
}

export const api = {
  getMe(): Promise<AaUser> {
    return request<AaUser>('/me')
  },
  patchMe(body: { handle?: string; name?: string; roles?: string[] }): Promise<AaUser> {
    return request<AaUser>('/me', { method: 'PATCH', body: JSON.stringify(body) })
  },
}

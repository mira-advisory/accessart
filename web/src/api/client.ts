// The one typed API client for the web surface (house rule 8: components
// never fetch directly). All calls go through request<T> below. The single
// exception lives in uploadImage: the raw PUT to a presigned URL.
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

export type AaMedium = 'painting' | 'print' | 'photography' | 'digital' | 'mixed' | 'other'

export type AaArtwork = {
  artwork_id: string
  artist_id: string
  market_id: string
  title: string
  story: string
  medium: AaMedium
  width_cm: number
  height_cm: number
  value_cents: number
  currency: string
  rent_month_cents: number
  rentable: boolean
  status: string
  image_keys: string[]
  image_urls: string[]
  created_at: string
  // server-derived where present, so a piece can link back to its artist.
  artist_handle?: string
}

export type AaArtistPage = {
  artist: { user_id: string; handle: string; name?: string }
  artworks: AaArtwork[]
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

type Envelope = {
  ok?: boolean
  data?: unknown
  items?: unknown
  error?: string
  message?: string
}

async function requestEnvelope(path: string, init?: RequestInit): Promise<Envelope> {
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

  const envelope = (body ?? {}) as Envelope

  if (!res.ok || envelope.ok === false) {
    throw new ApiError(
      typeof envelope.message === 'string' && envelope.message
        ? envelope.message
        : `request failed (${res.status}).`,
      typeof envelope.error === 'string' && envelope.error ? envelope.error : 'UNKNOWN',
      res.status,
    )
  }

  return envelope
}

// Item envelope: { ok, data }.
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const envelope = await requestEnvelope(path, init)
  return envelope.data as T
}

// List envelope: { ok, items, next_key } (CLAUDE.md rule 2). Tolerates
// { ok, data: { items } } too, so an envelope drift cannot strand the UI.
async function requestItems<T>(path: string, init?: RequestInit): Promise<{ items: T[] }> {
  const envelope = await requestEnvelope(path, init)
  if (Array.isArray(envelope.items)) return { items: envelope.items as T[] }
  const data = envelope.data as { items?: T[] } | undefined
  return { items: data?.items ?? [] }
}

export const api = {
  getMe(): Promise<AaUser> {
    return request<AaUser>('/me')
  },
  patchMe(body: { handle?: string; name?: string; roles?: string[] }): Promise<AaUser> {
    return request<AaUser>('/me', { method: 'PATCH', body: JSON.stringify(body) })
  },
  presignUpload(body: {
    content_type: string
  }): Promise<{ upload_url: string; key: string; public_url: string }> {
    return request<{ upload_url: string; key: string; public_url: string }>('/uploads/presign', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },
  createArtwork(body: {
    title: string
    story: string
    medium: AaMedium
    width_cm: number
    height_cm: number
    value_cents: number
    rentable: boolean
    image_keys: string[]
    status?: string
  }): Promise<AaArtwork> {
    return request<AaArtwork>('/artworks', { method: 'POST', body: JSON.stringify(body) })
  },
  myArtworks(): Promise<{ items: AaArtwork[] }> {
    return requestItems<AaArtwork>('/artworks/mine')
  },
  getArtwork(id: string): Promise<AaArtwork> {
    return request<AaArtwork>(`/artworks/${encodeURIComponent(id)}`)
  },
  getArtistByHandle(handle: string): Promise<AaArtistPage> {
    return request<AaArtistPage>(`/artists/${encodeURIComponent(handle)}`)
  },
  // Presign, then PUT the bytes straight to storage. The raw fetch here is
  // the documented exception to "no direct fetch": presigned URLs speak no
  // envelope, so a non-2xx status is the whole error signal.
  async uploadImage(file: File): Promise<{ key: string; public_url: string }> {
    const { upload_url, key, public_url } = await api.presignUpload({ content_type: file.type })
    const res = await fetch(upload_url, {
      method: 'PUT',
      headers: { 'content-type': file.type },
      body: file,
    })
    if (!res.ok) {
      throw new ApiError(
        `that upload didn’t take (${res.status}). try again.`,
        'UPLOAD_FAILED',
        res.status,
      )
    }
    return { key, public_url }
  },
}

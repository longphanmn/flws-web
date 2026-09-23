/**
 * Global Flatland API and WebSocket configuration.
 *
 * Automatically detects whether the app is running on a static host (e.g. GitHub Pages)
 * or same-origin (production server / localhost).
 */

const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')
const isDemoBuild = typeof __VITE_IS_DEMO__ !== 'undefined' ? Boolean(__VITE_IS_DEMO__) : false
const isDemoEnvironment = isGitHubPages || isDemoBuild

export const ALLOWED_BACKEND_ORIGINS = [
  'https://world.minhnhan.in',
  'wss://world.minhnhan.in',
  'http://localhost:8000',
  'ws://localhost:8000',
  'http://127.0.0.1:8000',
  'ws://127.0.0.1:8000',
] as const

function isAllowedBackendOrigin(origin: string): boolean {
  return ALLOWED_BACKEND_ORIGINS.some((allowed) => allowed === origin)
}

export function sanitizeBackendUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null
  try {
    const parsed = new URL(rawUrl)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    if (isAllowedBackendOrigin(parsed.origin)) {
      return parsed.origin
    }
  } catch {
    return null
  }
  return null
}

export function sanitizeWsUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null
  try {
    const parsed = new URL(rawUrl)
    if (parsed.protocol !== 'ws:' && parsed.protocol !== 'wss:') return null
    if (isAllowedBackendOrigin(parsed.origin)) {
      const path = parsed.pathname === '' || parsed.pathname === '/' ? '/ws' : parsed.pathname
      if (path === '/ws') {
        return `${parsed.origin}/ws`
      }
    }
  } catch {
    return null
  }
  return null
}

const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
const paramBackend = sanitizeBackendUrl(params?.get('backend'))
const paramWs = sanitizeWsUrl(params?.get('ws'))

function decodeEnvUrl(val: unknown): string {
  if (typeof val !== 'string' || !val) return ''
  const str = val.replace(/\\/g, '').trim()
  try {
    if (typeof window !== 'undefined' && window.atob && /^[A-Za-z0-9+/=]+$/.test(str)) {
      const decoded = window.atob(str).replace(/\\/g, '').trim()
      if (decoded.startsWith('http://') || decoded.startsWith('https://') || decoded.startsWith('ws://') || decoded.startsWith('wss://')) {
        return decoded
      }
    }
  } catch {
    // ignore decoding errors
  }
  return str
}

// Configured from .env (API_URL / BACKEND_URL / VITE_WS_URL) via Vite define/import.meta.env
const envApiUrl = decodeEnvUrl(
  (typeof __ENV_API_URL__ !== 'undefined' && __ENV_API_URL__) ||
  ((import.meta as any).env?.API_URL as string) ||
  ((import.meta as any).env?.VITE_DEMO_API_URL as string) ||
  ''
)

const envWsUrl = decodeEnvUrl(
  (typeof __ENV_WS_URL__ !== 'undefined' && __ENV_WS_URL__) ||
  ((import.meta as any).env?.VITE_WS_URL as string) ||
  ((import.meta as any).env?.WS_URL as string) ||
  ((import.meta as any).env?.VITE_DEMO_WS_URL as string) ||
  ''
)

export const DEFAULT_REMOTE_BACKEND = sanitizeBackendUrl(envApiUrl) || 'https://world.minhnhan.in'

export const DEFAULT_REMOTE_WS = sanitizeWsUrl(envWsUrl) || (DEFAULT_REMOTE_BACKEND
  ? DEFAULT_REMOTE_BACKEND.replace(/^http/, 'ws') + '/ws'
  : 'wss://world.minhnhan.in/ws')

export function getBackendBaseUrl(): string {
  if (paramBackend) return paramBackend.replace(/\/+$/, '')
  const metaEnv = (import.meta as any).env
  const envBackend = sanitizeBackendUrl(metaEnv?.VITE_BACKEND_URL)
  if (envBackend) return envBackend
  if (isDemoEnvironment) return DEFAULT_REMOTE_BACKEND
  return ''
}

export function getWebSocketUrl(): string {
  if (paramWs) return paramWs
  const metaEnv = (import.meta as any).env
  const envWs = sanitizeWsUrl(metaEnv?.VITE_WS_URL)
  if (envWs) return envWs
  if (paramBackend) {
    const wsProto = paramBackend.startsWith('https') ? 'wss:' : 'ws:'
    const host = paramBackend.replace(/^https?:\/\//, '').replace(/\/+$/, '')
    return `${wsProto}//${host}/ws`
  }
  if (isDemoEnvironment) return DEFAULT_REMOTE_WS
  const proto = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss' : 'ws'
  const host = typeof window !== 'undefined' ? window.location.host : 'localhost:8000'
  return `${proto}://${host}/ws`
}

const envFrontendUrl = (typeof __ENV_FRONTEND_URL__ !== 'undefined' && __ENV_FRONTEND_URL__) ||
  ((import.meta as any).env?.VITE_FRONTEND_URL as string) ||
  ((import.meta as any).env?.FRONTEND_URL as string) ||
  (typeof __ENV_DEMO_URL__ !== 'undefined' && __ENV_DEMO_URL__) ||
  ((import.meta as any).env?.VITE_DEMO_URL as string) ||
  ((import.meta as any).env?.DEMO_URL as string) ||
  ''

const envLandingUrl = (typeof __ENV_LANDING_URL__ !== 'undefined' && __ENV_LANDING_URL__) ||
  ((import.meta as any).env?.VITE_LANDING_URL as string) ||
  ((import.meta as any).env?.LANDING_URL as string) ||
  ''

export function getFrontendUrl(): string {
  if (envFrontendUrl) return envFrontendUrl.replace(/\/+$/, '') + '/'
  if (typeof window !== 'undefined') {
    const loc = window.location
    if (loc.pathname.includes('/demo')) {
      const demo = loc.pathname.replace(/\/demo(\/.*)?$/, '/demo/')
      return `${loc.origin}${demo}`
    }
    if (loc.hostname.includes('github.io')) {
      return `${loc.origin}/flws-web/`
    }
    return `${loc.origin}/`
  }
  return 'https://longphanmn.github.io/flws-web/'
}

export function getDemoUrl(): string {
  return getFrontendUrl()
}

export function getLandingUrl(): string {
  if (envLandingUrl) return envLandingUrl.replace(/\/+$/, '') + '/'
  if (typeof window !== 'undefined') {
    const loc = window.location
    if (loc.hostname.includes('github.io')) {
      return 'https://longphanmn.github.io/flws-page/'
    }
    if (loc.pathname.includes('/demo')) {
      const parent = loc.pathname.replace(/\/demo(\/.*)?$/, '') || '/'
      return `${loc.origin}${parent.endsWith('/') ? parent : parent + '/'}`
    }
    return `${loc.origin}/`
  }
  return 'https://longphanmn.github.io/flws-page/'
}

/**
 * Resolves user-facing documentation / API / wiki / health links.
 * All resources are hosted on flws-web (https://longphanmn.github.io/flws-web/...).
 * Only the introduce page link (getLandingUrl) points to flws-page.
 */
export function docUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  if (isDemoEnvironment) {
    const frontend = getFrontendUrl().replace(/\/+$/, '')
    if (cleanPath.startsWith('/wiki')) {
      const rest = cleanPath.slice('/wiki'.length).replace(/^\/+/, '')
      return `${frontend}/wiki/${rest}`
    }
    if (cleanPath.startsWith('/docs')) {
      const rest = cleanPath.slice('/docs'.length).replace(/^\/+/, '')
      return `${frontend}/docs/${rest}`
    }
    if (cleanPath.startsWith('/health')) {
      const rest = cleanPath.slice('/health'.length).replace(/^\/+/, '')
      return `${frontend}/health/${rest}`
    }
    if (cleanPath.startsWith('/openapi.json')) {
      return `${frontend}/openapi.json`
    }
    if (cleanPath.startsWith('/api/wiki')) {
      return `${frontend}/wiki/`
    }
    return `${frontend}${cleanPath}`
  }
  return cleanPath
}

export function apiUrl(path: string): string {
  return docUrl(path)
}

/**
 * Automatically transparently rewrite `/api/*` fetch requests to target the
 * remote backend when running on a static host (like GitHub Pages).
 */
export function initApiInterceptor(): void {
  if (typeof window === 'undefined') return
  const base = getBackendBaseUrl()
  if (!base) return

  const originalFetch = window.fetch
  window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    if (typeof input === 'string' && input.startsWith('/api/')) {
      return originalFetch(`${base}${input}`, init)
    }
    if (typeof input === 'string' && input.startsWith('/healthz')) {
      return originalFetch(`${base}${input}`, init)
    }
    if (input instanceof URL && (input.pathname.startsWith('/api/') || input.pathname.startsWith('/healthz'))) {
      return originalFetch(`${base}${input.pathname}${input.search}`, init)
    }
    return originalFetch(input, init)
  }
}

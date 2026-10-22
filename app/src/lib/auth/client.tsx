'use client'
// One auth API for pages and components, in both modes:
//   const { ready, authenticated, username, token, hasRole, refresh, encrypt, decrypt, login, logout } = useAuth()
// live -> backed by @tidecloak/nextjs (useTideCloak); mock -> backed by /api/mock/* routes.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { TideCloakProvider, useTideCloak } from '@tidecloak/nextjs'
import tcConfig from '../../../tidecloak.json'
import { AUTH_MODE, TAG, type AuthMode } from './config'

export type Auth = {
  mode: AuthMode
  ready: boolean
  authenticated: boolean
  username: string
  token: string | null
  roles: string[]
  hasRole: (role: string) => boolean
  refresh: () => Promise<void>           // pick up role changes (call before decrypt)
  encrypt: (plain: string) => Promise<string>
  decrypt: (sealed: string) => Promise<string>
  login: () => void
  logout: () => void
}

const AuthContext = createContext<Auth | null>(null)

export function useAuth(): Auth {
  const a = useContext(AuthContext)
  if (!a) throw new Error('useAuth must be used inside <AuthProvider>')
  return a
}

export function AuthProvider({ children }: { children: ReactNode }) {
  if (AUTH_MODE === 'live') {
    return (
      <TideCloakProvider config={tcConfig}>
        <LiveBridge>{children}</LiveBridge>
      </TideCloakProvider>
    )
  }
  return <MockProvider>{children}</MockProvider>
}

function LiveBridge({ children }: { children: ReactNode }) {
  const tc = useTideCloak()
  const value: Auth = {
    mode: 'live',
    ready: !tc.isInitializing,
    authenticated: tc.authenticated,
    username: tc.authenticated ? String(tc.getValueFromIdToken('preferred_username') ?? '') : '',
    token: tc.token ?? null,
    roles: tc.authenticated ? ((tc.getValueFromToken('realm_access') as { roles?: string[] } | null)?.roles ?? []) : [],
    hasRole: (role) => tc.hasRealmRole(role),
    refresh: async () => { await tc.refreshToken() },
    encrypt: async (plain) => String((await tc.doEncrypt([{ data: plain, tags: [TAG] }]))[0]),
    decrypt: async (sealed) => String((await tc.doDecrypt([{ encrypted: sealed, tags: [TAG] }]))[0]),
    login: () => tc.login(),
    logout: () => tc.logout(),
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

const MOCK_KEY = 'cv-mock-user'

async function mockFetch(path: string, token: string, body?: unknown) {
  const res = await fetch(path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { Authorization: `Bearer ${token}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
  return data
}

// Read the mock user through useSyncExternalStore so hydration always uses the server value ('' / not ready),
// even for Suspense boundaries that hydrate late. Reading it in an effect caused hydration mismatches.
const subscribeStorage = (onChange: () => void) => {
  window.addEventListener('storage', onChange)
  return () => window.removeEventListener('storage', onChange)
}
const readMockUser = () => { try { return localStorage.getItem(MOCK_KEY) ?? '' } catch { return '' } }
const noSubscribe = () => () => {}

function MockProvider({ children }: { children: ReactNode }) {
  const ready = useSyncExternalStore(noSubscribe, () => true, () => false)
  const username = useSyncExternalStore(subscribeStorage, readMockUser, () => '')
  const [roles, setRoles] = useState<string[]>([])
  const token = username ? `mock:${username}` : null

  const refresh = useCallback(async () => {
    if (!token) return
    const me = await mockFetch('/api/mock/governance?me=1', token)
    setRoles(me.roles ?? [])
  }, [token])

  useEffect(() => { refresh().catch(() => setRoles([])) }, [refresh])

  const value = useMemo<Auth>(() => ({
    mode: 'mock',
    ready,
    authenticated: !!username,
    username,
    token,
    roles,
    hasRole: (role) => roles.includes(role),
    refresh,
    encrypt: async (plain) => (await mockFetch('/api/mock/crypto', token ?? '', { op: 'encrypt', data: plain })).result,
    decrypt: async (sealed) => (await mockFetch('/api/mock/crypto', token ?? '', { op: 'decrypt', data: sealed })).result,
    login: () => { window.location.href = '/mock/login' },
    logout: () => {
      try { localStorage.removeItem(MOCK_KEY) } catch { /* storage blocked */ }
      setRoles([])
      window.location.href = '/'
    },
  }), [ready, username, token, roles, refresh])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Mock mode only: sign in as a demo account (used by /mock/login and the header's account switcher).
export function mockSignIn(username: string, redirectTo = '/') {
  try { localStorage.setItem(MOCK_KEY, username) } catch { /* storage blocked */ }
  window.location.href = redirectTo
}

export function SimulationBanner() {
  if (AUTH_MODE !== 'mock') return null
  return (
    <div role="status" style={{ background: '#8E2B22', color: '#FFF6EE', padding: '8px 24px', fontSize: 13.5, lineHeight: 1.45, textAlign: 'center' }}>
      <strong>SIMULATION MODE.</strong> Tide&apos;s licence service was unavailable during the hackathon, so sign-in,
      the 2-of-3 steward approvals and encryption are simulated by this app&apos;s server. In live mode TideCloak
      enforces them and no server can decrypt. <a href="/mock/approvals" style={{ color: '#ffd9c2' }}>Simulated approvals</a>
    </div>
  )
}

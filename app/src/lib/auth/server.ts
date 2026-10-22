// Server-side identity for API routes, same shape in both modes.
// Usage in a route handler:  const user = await getUser(request); if (!user) return 401
import { verifyTideCloakToken } from '@tidecloak/nextjs/server'
import type { TidecloakConfig } from '@tidecloak/nextjs/server'
import rawConfig from '../../../tidecloak.json'
import { AUTH_MODE, CAST } from './config'
import { rolesOf } from './mock-store'

export type AuthUser = { username: string; roles: string[] }

const tcConfig = rawConfig as TidecloakConfig

function bearer(req: Request): string | null {
  const h = req.headers.get('authorization')
  return h?.startsWith('Bearer ') ? h.slice(7) : null
}

export async function getUser(req: Request): Promise<AuthUser | null> {
  const token = bearer(req)
  if (!token) return null

  if (AUTH_MODE === 'mock') {
    const username = token.startsWith('mock:') ? token.slice(5) : ''
    if (!CAST.some((c) => c.username === username)) return null
    return { username, roles: rolesOf(username) }
  }

  try {
    const payload = (await verifyTideCloakToken(tcConfig, token, [])) as Record<string, any> | null
    if (!payload) return null
    return { username: payload.preferred_username, roles: payload.realm_access?.roles ?? [] }
  } catch {
    return null
  }
}

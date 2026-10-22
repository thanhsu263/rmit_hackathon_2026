// Shared auth constants for both modes.
//   live - TideCloak enforces login, roles, 2-of-3 governance and encryption.
//   mock - this app simulates them (Tide's licence service was down during the hackathon).
export type AuthMode = 'live' | 'mock'
export const AUTH_MODE: AuthMode = process.env.NEXT_PUBLIC_AUTH_MODE === 'live' ? 'live' : 'mock'

export const TAG = 'sitecoords'
export const ROLE_ENCRYPT = `_tide_${TAG}.selfencrypt`
export const ROLE_DECRYPT = `_tide_${TAG}.selfdecrypt`
export const ROLE_ADMIN = 'tide-realm-admin'

// Demo cast. The three stewards are realm admins; the researcher starts with no decrypt role.
export const CAST = [
  { username: 'diglead', title: 'Dig lead' },
  { username: 'heritage', title: 'Heritage authority' },
  { username: 'custodian', title: 'Community custodian' },
  { username: 'researcher', title: 'Researcher' },
] as const

// Same rule TideCloak QEA uses: max(1, floor(0.7 x admins)) -> 2 of 3.
export function quorum(adminCount: number): number {
  return Math.max(1, Math.floor(0.7 * adminCount))
}

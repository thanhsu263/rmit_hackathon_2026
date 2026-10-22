// MOCK mode stand-in for TideCloak QEA Approvals. Disabled (404) in live mode.
import { NextResponse } from 'next/server'
import { AUTH_MODE, ROLE_ADMIN, quorum } from '@/lib/auth/config'
import { getUser } from '@/lib/auth/server'
import { GovernanceError, decide, propose, readState, resetState } from '@/lib/auth/mock-store'

const off = () => NextResponse.json({ error: 'not available in live mode' }, { status: 404 })
const err = (status: number, error: string) => NextResponse.json({ error }, { status })

export async function GET(req: Request) {
  if (AUTH_MODE !== 'mock') return off()
  const user = await getUser(req)
  if (!user) return err(401, 'unauthenticated')
  if (new URL(req.url).searchParams.get('me')) return NextResponse.json(user)
  const s = readState()
  const admins = Object.keys(s.roles).filter((u) => s.roles[u].includes(ROLE_ADMIN))
  return NextResponse.json({ ...s, admins, quorum: quorum(admins.length) })
}

export async function POST(req: Request) {
  if (AUTH_MODE !== 'mock') return off()
  const user = await getUser(req)
  if (!user) return err(401, 'unauthenticated')
  const body = await req.json().catch(() => null)
  try {
    if (body?.action === 'propose' && (body.kind === 'GRANT_ROLE' || body.kind === 'REMOVE_ROLE')
        && typeof body.role === 'string' && typeof body.target === 'string') {
      return NextResponse.json(propose(user.username, body.kind, body.role, body.target))
    }
    if (body?.action === 'decide' && typeof body.id === 'string' && typeof body.approve === 'boolean') {
      return NextResponse.json(decide(user.username, body.id, body.approve))
    }
    if (body?.action === 'reset') {
      if (!user.roles.includes(ROLE_ADMIN)) return err(403, 'forbidden')
      return NextResponse.json(resetState())
    }
    return err(400, 'bad request')
  } catch (e) {
    if (e instanceof GovernanceError) return err(e.status, e.message)
    throw e
  }
}

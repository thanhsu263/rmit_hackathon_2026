// MOCK mode stand-in for Tide's doEncrypt/doDecrypt, gated by the same roles. Disabled (404) in live mode.
import { NextResponse } from 'next/server'
import { AUTH_MODE, ROLE_DECRYPT, ROLE_ENCRYPT } from '@/lib/auth/config'
import { getUser } from '@/lib/auth/server'
import { mockDecrypt, mockEncrypt } from '@/lib/auth/mock-store'

const err = (status: number, error: string) => NextResponse.json({ error }, { status })

export async function POST(req: Request) {
  if (AUTH_MODE !== 'mock') return err(404, 'not available in live mode')
  const user = await getUser(req)
  if (!user) return err(401, 'unauthenticated')
  const body = await req.json().catch(() => null)
  if (typeof body?.data !== 'string' || !body.data) return err(400, 'bad request')

  if (body.op === 'encrypt') {
    if (!user.roles.includes(ROLE_ENCRYPT)) return err(403, `missing role ${ROLE_ENCRYPT}`)
    return NextResponse.json({ result: mockEncrypt(body.data) })
  }
  if (body.op === 'decrypt') {
    if (!user.roles.includes(ROLE_DECRYPT)) return err(403, `missing role ${ROLE_DECRYPT}`)
    try {
      return NextResponse.json({ result: mockDecrypt(body.data) })
    } catch {
      return err(400, 'cannot decrypt this value')
    }
  }
  return err(400, 'bad request')
}

// MOCK mode only: reset the demo (data + simulated governance) from the UI. Stewards only. 404 in live mode.
import { NextResponse } from 'next/server'
import { AUTH_MODE, ROLE_ADMIN } from '@/lib/auth/config'
import { getUser } from '@/lib/auth/server'
import { resetDemo } from '@/lib/auth/demo-reset'

const err = (status: number, error: string) => NextResponse.json({ error }, { status })

export async function POST(req: Request) {
  if (AUTH_MODE !== 'mock') return err(404, 'not available in live mode')
  const user = await getUser(req)
  if (!user) return err(401, 'unauthenticated')
  if (!user.roles.includes(ROLE_ADMIN)) return err(403, 'forbidden')
  await resetDemo()
  return NextResponse.json({ ok: true })
}

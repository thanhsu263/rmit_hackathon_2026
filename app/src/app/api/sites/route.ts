import { getUser } from '@/lib/auth/server'
import { unauthenticated } from '@/lib/http'
import { readSites } from '@/lib/store'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const user = await getUser(req)
  if (!user) return unauthenticated()

  return NextResponse.json(await readSites())
}

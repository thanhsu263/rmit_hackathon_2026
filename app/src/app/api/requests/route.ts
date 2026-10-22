import { getUser } from '@/lib/auth/server'
import { err, readJsonObject, unauthenticated } from '@/lib/http'
import { appendAudit, appendRequest, findSite, newId, readRequests } from '@/lib/store'
import type { AccessRequest } from '@/lib/types'
import { NextResponse } from 'next/server'

const MAX_REASON_LENGTH = 500

type RequestBody = {
  siteId?: unknown
  reason?: unknown
}

export async function GET(req: Request) {
  const user = await getUser(req)
  if (!user) return unauthenticated()

  return NextResponse.json(await readRequests())
}

export async function POST(req: Request) {
  const user = await getUser(req)
  if (!user) return unauthenticated()

  const body = (await readJsonObject(req)) as RequestBody | null
  if (!body) return err(400, 'Body must be a JSON object')

  const { siteId, reason } = body

  if (typeof siteId !== 'string' || !siteId.trim()) {
    return err(400, 'siteId must be a non-empty string')
  }
  if (typeof reason !== 'string' || !reason.trim()) {
    return err(400, 'reason must be a non-empty string')
  }
  if (reason.length > MAX_REASON_LENGTH) {
    return err(400, `reason must be ${MAX_REASON_LENGTH} characters or fewer`)
  }

  const site = await findSite(siteId)
  if (!site) return err(404, `Unknown site: ${siteId}`)

  const createdAt = new Date().toISOString()

  const request: AccessRequest = {
    id: newId('req'),
    siteId,
    requester: user.username,
    reason,
    createdAt,
  }

  await appendRequest(request)

  await appendAudit({
    at: createdAt,
    actor: user.username,
    siteId,
    action: 'ACCESS_REQUESTED',
  })

  return NextResponse.json(request)
}

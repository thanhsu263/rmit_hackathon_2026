import { getUser } from '@/lib/auth/server'
import { err, readJsonObject, unauthenticated } from '@/lib/http'
import { appendAudit, findSite, readAudit } from '@/lib/store'
import { CLIENT_AUDIT_ACTIONS } from '@/lib/types'
import type { AuditAction, AuditEvent } from '@/lib/types'
import { NextResponse } from 'next/server'

type AuditBody = {
  siteId?: unknown
  action?: unknown
}

export async function GET(req: Request) {
  const user = await getUser(req)
  if (!user) return unauthenticated()

  return NextResponse.json(await readAudit())
}

export async function POST(req: Request) {
  const user = await getUser(req)
  if (!user) return unauthenticated()

  const body = (await readJsonObject(req)) as AuditBody | null
  if (!body) return err(400, 'Body must be a JSON object')

  const { siteId, action } = body

  if (typeof siteId !== 'string' || !siteId.trim()) {
    return err(400, 'siteId must be a non-empty string')
  }

  // Only the decrypt outcomes may be recorded by a client. SITE_SEALED and
  // ACCESS_REQUESTED are appended by their own routes, so a client cannot forge them.
  if (typeof action !== 'string' || !CLIENT_AUDIT_ACTIONS.includes(action as AuditAction)) {
    return err(400, `action must be one of: ${CLIENT_AUDIT_ACTIONS.join(', ')}`)
  }

  const site = await findSite(siteId)
  if (!site) return err(404, `Unknown site: ${siteId}`)

  const event: AuditEvent = {
    at: new Date().toISOString(),
    actor: user.username,
    siteId,
    action: action as AuditAction,
  }

  await appendAudit(event)

  return NextResponse.json(event)
}

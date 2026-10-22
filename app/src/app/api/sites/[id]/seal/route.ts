import { ROLE_ENCRYPT } from '@/lib/auth/config'
import { getUser } from '@/lib/auth/server'
import { err, forbidden, readJsonObject, unauthenticated } from '@/lib/http'
import { appendAudit, findSite, updateSite } from '@/lib/store'
import type { BlurredLocation, Site } from '@/lib/types'
import { NextResponse } from 'next/server'

type SealBody = {
  sealedExact?: unknown
  blurred?: unknown
}

/** Returns the error message, or null when the value is a valid blurred location. */
function blurredError(value: unknown): string | null {
  if (typeof value !== 'object' || value === null) return 'blurred must be an object'

  const { lat, lng, radiusKm } = value as Record<string, unknown>

  if (typeof lat !== 'number' || Number.isNaN(lat) || lat < -90 || lat > 90) {
    return 'blurred.lat must be a number between -90 and 90'
  }
  if (typeof lng !== 'number' || Number.isNaN(lng) || lng < -180 || lng > 180) {
    return 'blurred.lng must be a number between -180 and 180'
  }
  if (radiusKm !== 50) return 'blurred.radiusKm must be 50'

  return null
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getUser(req)
  if (!user) return unauthenticated()
  if (!user.roles.includes(ROLE_ENCRYPT)) return forbidden()

  const { id } = await ctx.params

  const site = await findSite(id)
  if (!site) return err(404, `Unknown site: ${id}`)

  const body = (await readJsonObject(req)) as SealBody | null
  if (!body) return err(400, 'Body must be a JSON object')

  const { sealedExact, blurred } = body

  if (typeof sealedExact !== 'string' || !sealedExact.trim()) {
    return err(400, 'sealedExact must be a non-empty string')
  }

  const blurredProblem = blurredError(blurred)
  if (blurredProblem) return err(400, blurredProblem)

  // sealedExact arrives already sealed by the client. The server stores it as given and
  // never holds plaintext coordinates.
  const sealed: Site = {
    ...site,
    sealedExact,
    blurred: blurred as BlurredLocation,
    sealedBy: user.username,
    sealedAt: new Date().toISOString(),
  }

  const stored = await updateSite(sealed)

  await appendAudit({
    at: new Date().toISOString(),
    actor: user.username,
    siteId: stored.id,
    action: 'SITE_SEALED',
  })

  return NextResponse.json(stored)
}

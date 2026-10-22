// Shared response and body helpers for the Custodian Vault API routes.
// Identity comes from `@/lib/auth/server`; nothing here touches TideCloak.
import { NextResponse } from 'next/server'

export const err = (status: number, error: string) => NextResponse.json({ error }, { status })

export const unauthenticated = () => err(401, 'unauthenticated')
export const forbidden = () => err(403, 'forbidden')

/**
 * Parses a JSON object body, or returns null for anything that is not one.
 * `req.json()` accepts a bare `null` as valid JSON, and destructuring that throws,
 * so every non-object shape has to come back as a 400 rather than a 500.
 */
export async function readJsonObject(req: Request): Promise<Record<string, unknown> | null> {
  const body = await req.json().catch(() => null)
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return null
  return body as Record<string, unknown>
}

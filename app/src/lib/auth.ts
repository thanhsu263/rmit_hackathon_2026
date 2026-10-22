// Bearer-token checks for the API routes.
//
// verifyTideCloakToken(config, token, allowedRoles?) resolves to the claims, or to null
// when the token is invalid or the role check fails. It does not throw on a failed check,
// so a null result is the only failure signal to test.

import { verifyTideCloakToken } from "@tidecloak/nextjs/server";

import { loadTideCloakConfig } from "./tidecloak-config";

type TideClaims = Record<string, unknown> & {
  preferred_username?: string;
  realm_access?: { roles?: string[] };
};

function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (!token || scheme.toLowerCase() !== "bearer") return null;
  return token.trim() || null;
}

async function verify(req: Request, allowedRoles?: string[]): Promise<TideClaims | null> {
  const token = bearerToken(req);
  if (!token) return null;

  const config = await loadTideCloakConfig();
  // No adapter config means no way to verify anyone. Fail closed.
  if (!config) return null;

  try {
    const claims = await verifyTideCloakToken(config, token, allowedRoles);
    return (claims as TideClaims) ?? null;
  } catch (err) {
    console.warn(`[tidecloak] Token verification threw: ${(err as Error)?.message}`);
    return null;
  }
}

/** Verified claims for any signed-in user, or null. */
export async function requireUser(req: Request): Promise<TideClaims | null> {
  return verify(req);
}

/** Verified claims for a user holding at least one of the roles, or null. */
export async function requireRole(
  req: Request,
  allowedRoles: string[]
): Promise<TideClaims | null> {
  return verify(req, allowedRoles);
}

/**
 * The acting username, taken from the verified token only. The contract forbids reading
 * actor, requester or sealedBy from a request body.
 */
export function usernameOf(claims: TideClaims): string {
  const name = claims.preferred_username;
  return typeof name === "string" && name ? name : "unknown";
}

/**
 * Parses a JSON object body, or returns null for anything that is not one.
 *
 * `req.json()` accepts a bare `null` as valid JSON, and destructuring that throws a
 * TypeError, which Next turns into a 500. A malformed body is a client error, so every
 * non-object shape has to come back as 400 instead.
 */
export async function readJsonObject(
  req: Request
): Promise<Record<string, unknown> | null> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return null;
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) return null;
  return body as Record<string, unknown>;
}

export function unauthorized(): Response {
  return Response.json({ error: "unauthenticated" }, { status: 401 });
}

export function forbidden(): Response {
  return Response.json({ error: "forbidden" }, { status: 403 });
}

export function badRequest(message: string): Response {
  return Response.json({ error: message }, { status: 400 });
}

export function notFound(message: string): Response {
  return Response.json({ error: message }, { status: 404 });
}

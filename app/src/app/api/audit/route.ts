import { badRequest, notFound, requireUser, unauthorized, usernameOf } from "@/lib/auth";
import { appendAudit, findSite, readAudit } from "@/lib/store";
import { CLIENT_AUDIT_ACTIONS } from "@/lib/types";
import type { AuditAction, AuditEvent } from "@/lib/types";

type AuditBody = {
  siteId?: unknown;
  action?: unknown;
};

export async function GET(req: Request) {
  const claims = await requireUser(req);
  if (!claims) return unauthorized();

  return Response.json(await readAudit());
}

export async function POST(req: Request) {
  const claims = await requireUser(req);
  if (!claims) return unauthorized();

  let body: AuditBody;
  try {
    body = (await req.json()) as AuditBody;
  } catch {
    return badRequest("Body must be valid JSON");
  }

  const { siteId, action } = body;

  if (typeof siteId !== "string" || !siteId.trim()) {
    return badRequest("siteId must be a non-empty string");
  }

  // Only the decrypt outcomes may be recorded by a client. SITE_SEALED and
  // ACCESS_REQUESTED are appended by their own routes, so a client cannot forge them.
  if (
    typeof action !== "string" ||
    !CLIENT_AUDIT_ACTIONS.includes(action as AuditAction)
  ) {
    return badRequest(`action must be one of: ${CLIENT_AUDIT_ACTIONS.join(", ")}`);
  }

  const site = await findSite(siteId);
  if (!site) return notFound(`Unknown site: ${siteId}`);

  const event: AuditEvent = {
    at: new Date().toISOString(),
    actor: usernameOf(claims),
    siteId,
    action: action as AuditAction,
  };

  await appendAudit(event);

  return Response.json(event);
}

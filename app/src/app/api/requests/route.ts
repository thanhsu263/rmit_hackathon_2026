import { badRequest, notFound, requireUser, unauthorized, usernameOf } from "@/lib/auth";
import { appendAudit, appendRequest, findSite, newId, readRequests } from "@/lib/store";
import type { AccessRequest } from "@/lib/types";

const MAX_REASON_LENGTH = 500;

type RequestBody = {
  siteId?: unknown;
  reason?: unknown;
};

export async function GET(req: Request) {
  const claims = await requireUser(req);
  if (!claims) return unauthorized();

  return Response.json(await readRequests());
}

export async function POST(req: Request) {
  const claims = await requireUser(req);
  if (!claims) return unauthorized();

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return badRequest("Body must be valid JSON");
  }

  const { siteId, reason } = body;

  if (typeof siteId !== "string" || !siteId.trim()) {
    return badRequest("siteId must be a non-empty string");
  }
  if (typeof reason !== "string" || !reason.trim()) {
    return badRequest("reason must be a non-empty string");
  }
  if (reason.length > MAX_REASON_LENGTH) {
    return badRequest(`reason must be ${MAX_REASON_LENGTH} characters or fewer`);
  }

  const site = await findSite(siteId);
  if (!site) return notFound(`Unknown site: ${siteId}`);

  const requester = usernameOf(claims);
  const createdAt = new Date().toISOString();

  const request: AccessRequest = {
    id: newId("req"),
    siteId,
    requester,
    reason,
    createdAt,
  };

  await appendRequest(request);

  await appendAudit({
    at: createdAt,
    actor: requester,
    siteId,
    action: "ACCESS_REQUESTED",
  });

  return Response.json(request);
}

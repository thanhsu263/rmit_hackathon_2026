import {
  badRequest,
  forbidden,
  notFound,
  readJsonObject,
  requireRole,
  requireUser,
  unauthorized,
  usernameOf,
} from "@/lib/auth";
import { appendAudit, findSite, updateSite } from "@/lib/store";
import type { BlurredLocation, Site } from "@/lib/types";

const ENCRYPT_ROLE = "_tide_sitecoords.selfencrypt";

type SealBody = {
  sealedExact?: unknown;
  blurred?: unknown;
};

/** Returns the error message, or null when the value is a valid blurred location. */
function blurredError(value: unknown): string | null {
  if (typeof value !== "object" || value === null) return "blurred must be an object";

  const { lat, lng, radiusKm } = value as Record<string, unknown>;

  if (typeof lat !== "number" || Number.isNaN(lat) || lat < -90 || lat > 90) {
    return "blurred.lat must be a number between -90 and 90";
  }
  if (typeof lng !== "number" || Number.isNaN(lng) || lng < -180 || lng > 180) {
    return "blurred.lng must be a number between -180 and 180";
  }
  if (radiusKm !== 50) return "blurred.radiusKm must be 50";

  return null;
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  // Sealing needs the encrypt role, so a signed-in researcher gets 403 rather than 401.
  const claims = await requireRole(req, [ENCRYPT_ROLE]);
  if (!claims) {
    // Tell the two cases apart: no usable token at all is 401, a valid token without the
    // role is 403. requireRole returns null for both, so re-check without the role.
    return (await requireUser(req)) ? forbidden() : unauthorized();
  }

  const { id } = await ctx.params;

  const site = await findSite(id);
  if (!site) return notFound(`Unknown site: ${id}`);

  const body = (await readJsonObject(req)) as SealBody | null;
  if (!body) return badRequest("Body must be a JSON object");

  const { sealedExact, blurred } = body;

  if (typeof sealedExact !== "string" || !sealedExact.trim()) {
    return badRequest("sealedExact must be a non-empty string");
  }

  const blurredProblem = blurredError(blurred);
  if (blurredProblem) return badRequest(blurredProblem);

  const actor = usernameOf(claims);

  // sealedExact arrives already encrypted in the browser. The server stores it as given
  // and never holds plaintext coordinates.
  const sealed: Site = {
    ...site,
    sealedExact,
    blurred: blurred as BlurredLocation,
    sealedBy: actor,
    sealedAt: new Date().toISOString(),
  };

  const stored = await updateSite(sealed);

  await appendAudit({
    at: new Date().toISOString(),
    actor,
    siteId: stored.id,
    action: "SITE_SEALED",
  });

  return Response.json(stored);
}

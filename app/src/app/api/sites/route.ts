import { requireUser, unauthorized } from "@/lib/auth";
import { readSites } from "@/lib/store";

export async function GET(req: Request) {
  const claims = await requireUser(req);
  if (!claims) return unauthorized();

  return Response.json(await readSites());
}

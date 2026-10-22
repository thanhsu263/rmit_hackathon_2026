// Loads the TideCloak adapter JSON that verifyTideCloakToken needs.
//
// Member A exports this file from tide-console (Apps -> the app -> Credentials) and drops
// it at app/tidecloak.json. It is not in the repository: .gitignore excludes adapter and
// secret JSON, and the contract forbids committing it.
//
// Until it exists, loadTideCloakConfig() returns null. Callers must treat null as
// "cannot verify anyone" and reject the request, never as "let everyone through".

import { readFile } from "node:fs/promises";
import path from "node:path";

const CONFIG_FILE = path.join(process.cwd(), "tidecloak.json");

let cached: object | null | undefined;
let warned = false;

export async function loadTideCloakConfig(): Promise<object | null> {
  if (cached !== undefined) return cached;

  try {
    const raw = await readFile(CONFIG_FILE, "utf8");
    cached = JSON.parse(raw) as object;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code !== "ENOENT" || !warned) {
      console.warn(
        `[tidecloak] No usable adapter config at ${CONFIG_FILE}. ` +
          "Every API route will answer 401 until member A provides it. " +
          `(${(err as Error)?.message})`
      );
      warned = true;
    }
    cached = null;
  }

  return cached;
}

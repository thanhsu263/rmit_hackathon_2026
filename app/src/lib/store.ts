// JSON file store for the hackathon prototype. Single dev-server process, no database.
//
// Two things make this safe enough to demo on:
//
// 1. Every read-modify-write for a file runs in a per-file queue. Next serves requests
//    concurrently, and without the queue two overlapping appends lose an event. On Windows
//    they also collide on the rename and fail with EPERM, which surfaces as a 500.
// 2. Writes go to a temp file and are then renamed, so a crash cannot leave half-written
//    JSON. The rename is retried briefly because Windows can report EPERM transiently when
//    an indexer or scanner is holding the destination.

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type { AccessRequest, AuditEvent, Site } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

const SITES_FILE = path.join(DATA_DIR, "sites.json");
const REQUESTS_FILE = path.join(DATA_DIR, "requests.json");
const AUDIT_FILE = path.join(DATA_DIR, "audit.json");

/** One promise chain per file, so operations on the same file never interleave. */
const queues = new Map<string, Promise<unknown>>();

function withFileLock<T>(file: string, operation: () => Promise<T>): Promise<T> {
  const previous = queues.get(file) ?? Promise.resolve();
  // Run whether the previous operation resolved or rejected: one failure must not wedge
  // the queue for every later request.
  const result = previous.then(operation, operation);
  queues.set(
    file,
    result.then(
      () => undefined,
      () => undefined
    )
  );
  return result;
}

/**
 * Reads an array of records. A missing, corrupt or wrongly shaped file yields the fallback
 * and a warning rather than a 500: the prototype should keep answering, and the warning
 * tells whoever is running the demo that the file needs attention.
 */
async function readArray<T>(file: string, fallback: T[]): Promise<T[]> {
  let raw: string;
  try {
    raw = await readFile(file, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") return fallback;
    throw err;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn(`[store] ${file} does not contain a JSON array. Treating it as empty.`);
      return fallback;
    }
    return parsed as T[];
  } catch (err) {
    console.warn(`[store] ${file} is not valid JSON: ${(err as Error)?.message}`);
    return fallback;
  }
}

async function renameWithRetry(from: string, to: string): Promise<void> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await rename(from, to);
      return;
    } catch (err) {
      lastError = err;
      if ((err as NodeJS.ErrnoException)?.code !== "EPERM") throw err;
      await new Promise((resolve) => setTimeout(resolve, 20 * (attempt + 1)));
    }
  }
  throw lastError;
}

async function writeJson(file: string, value: unknown): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const temp = path.join(DATA_DIR, `.${path.basename(file)}.${randomUUID()}.tmp`);
  await writeFile(temp, JSON.stringify(value, null, 2) + "\n", "utf8");
  await renameWithRetry(temp, file);
}

export async function readSites(): Promise<Site[]> {
  return readArray<Site>(SITES_FILE, []);
}

export async function findSite(id: string): Promise<Site | undefined> {
  const sites = await readSites();
  return sites.find((site) => site.id === id);
}

/** Replaces the site with the same id and persists. Returns the stored site. */
export async function updateSite(updated: Site): Promise<Site> {
  return withFileLock(SITES_FILE, async () => {
    const sites = await readArray<Site>(SITES_FILE, []);
    const index = sites.findIndex((site) => site.id === updated.id);
    if (index === -1) throw new Error(`Unknown site: ${updated.id}`);
    sites[index] = updated;
    await writeJson(SITES_FILE, sites);
    return updated;
  });
}

/** Newest first, as the contract requires. */
export async function readRequests(): Promise<AccessRequest[]> {
  const requests = await readArray<AccessRequest>(REQUESTS_FILE, []);
  return [...requests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function appendRequest(request: AccessRequest): Promise<AccessRequest> {
  return withFileLock(REQUESTS_FILE, async () => {
    const requests = await readArray<AccessRequest>(REQUESTS_FILE, []);
    requests.push(request);
    await writeJson(REQUESTS_FILE, requests);
    return request;
  });
}

/** Newest first, as the contract requires. */
export async function readAudit(): Promise<AuditEvent[]> {
  const events = await readArray<AuditEvent>(AUDIT_FILE, []);
  return [...events].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export async function appendAudit(event: AuditEvent): Promise<AuditEvent> {
  return withFileLock(AUDIT_FILE, async () => {
    const events = await readArray<AuditEvent>(AUDIT_FILE, []);
    events.push(event);
    await writeJson(AUDIT_FILE, events);
    return event;
  });
}

export function newId(prefix: string): string {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

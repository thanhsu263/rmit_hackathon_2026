// JSON file store for the hackathon prototype. Single dev-server process, no database.
// Writes go to a temp file in the same directory and are then renamed, so a crash cannot
// leave half-written JSON behind.

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type { AccessRequest, AuditEvent, Site } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

const SITES_FILE = path.join(DATA_DIR, "sites.json");
const REQUESTS_FILE = path.join(DATA_DIR, "requests.json");
const AUDIT_FILE = path.join(DATA_DIR, "audit.json");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code === "ENOENT") return fallback;
    throw err;
  }
}

async function writeJson(file: string, value: unknown): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const temp = path.join(DATA_DIR, `.${path.basename(file)}.${randomUUID()}.tmp`);
  await writeFile(temp, JSON.stringify(value, null, 2) + "\n", "utf8");
  await rename(temp, file);
}

export async function readSites(): Promise<Site[]> {
  return readJson<Site[]>(SITES_FILE, []);
}

export async function writeSites(sites: Site[]): Promise<void> {
  await writeJson(SITES_FILE, sites);
}

export async function findSite(id: string): Promise<Site | undefined> {
  const sites = await readSites();
  return sites.find((site) => site.id === id);
}

/** Replaces the site with the same id and persists. Returns the stored site. */
export async function updateSite(updated: Site): Promise<Site> {
  const sites = await readSites();
  const index = sites.findIndex((site) => site.id === updated.id);
  if (index === -1) throw new Error(`Unknown site: ${updated.id}`);
  sites[index] = updated;
  await writeSites(sites);
  return updated;
}

/** Newest first, as the contract requires. */
export async function readRequests(): Promise<AccessRequest[]> {
  const requests = await readJson<AccessRequest[]>(REQUESTS_FILE, []);
  return [...requests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function appendRequest(request: AccessRequest): Promise<AccessRequest> {
  const requests = await readJson<AccessRequest[]>(REQUESTS_FILE, []);
  requests.push(request);
  await writeJson(REQUESTS_FILE, requests);
  return request;
}

/** Newest first, as the contract requires. */
export async function readAudit(): Promise<AuditEvent[]> {
  const events = await readJson<AuditEvent[]>(AUDIT_FILE, []);
  return [...events].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export async function appendAudit(event: AuditEvent): Promise<AuditEvent> {
  const events = await readJson<AuditEvent[]>(AUDIT_FILE, []);
  events.push(event);
  await writeJson(AUDIT_FILE, events);
  return event;
}

export function newId(prefix: string): string {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

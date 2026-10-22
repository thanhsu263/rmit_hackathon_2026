import { USE_MOCK_API, API_BASE_URL } from "./config";
import { Site, AccessRequest, AuditEvent, AuditAction, BlurredLocation } from "./types";
import { INITIAL_SITES, INITIAL_REQUESTS, INITIAL_AUDIT_EVENTS } from "./mockData";

// Local storage keys for persistent mock state during testing
const STORAGE_SITES = "custodian_vault_sites";
const STORAGE_REQUESTS = "custodian_vault_requests";
const STORAGE_AUDIT = "custodian_vault_audit";

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

// In-memory / localStorage mock store
let memorySites: Site[] = getStored<Site[]>(STORAGE_SITES, INITIAL_SITES);
let memoryRequests: AccessRequest[] = getStored<AccessRequest[]>(STORAGE_REQUESTS, INITIAL_REQUESTS);
let memoryAudit: AuditEvent[] = getStored<AuditEvent[]>(STORAGE_AUDIT, INITIAL_AUDIT_EVENTS);

// API Error class
export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

// Real fetch helper adding Authorization header and error parsing
async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {},
  token: string | null
): Promise<T> {
  if (!token) {
    throw new ApiError("Authentication required: No bearer token provided.", 401);
  }

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson?.error) {
          errorMessage = errorJson.error;
        }
      } catch {
        // Fallback to generic message
      }
      throw new ApiError(errorMessage, response.status);
    }

    return (await response.json()) as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err?.message || "Network request failed");
  }
}

// ----------------------------------------------------------------------
// API Functions conforming to contract.md
// ----------------------------------------------------------------------

/**
 * GET /api/sites
 */
export async function getSites(token: string | null): Promise<Site[]> {
  if (USE_MOCK_API) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    memorySites = getStored<Site[]>(STORAGE_SITES, INITIAL_SITES);
    return [...memorySites];
  }
  return fetchWithAuth<Site[]>("/api/sites", { method: "GET" }, token);
}

/**
 * GET /api/sites/:id (helper for detail view)
 */
export async function getSiteById(id: string, token: string | null): Promise<Site | null> {
  if (USE_MOCK_API) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    memorySites = getStored<Site[]>(STORAGE_SITES, INITIAL_SITES);
    const site = memorySites.find((s) => s.id === id);
    return site || null;
  }
  // Try GET /api/sites and filter if specific route not available
  const sites = await getSites(token);
  return sites.find((s) => s.id === id) || null;
}

/**
 * POST /api/sites/:id/seal
 * Body: { sealedExact: string, blurred: {lat, lng, radiusKm} }
 */
export async function sealSite(
  siteId: string,
  payload: { sealedExact: string; blurred: BlurredLocation },
  token: string | null,
  actor: string = "diglead"
): Promise<Site> {
  if (USE_MOCK_API) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    memorySites = getStored<Site[]>(STORAGE_SITES, INITIAL_SITES);
    const siteIndex = memorySites.findIndex((s) => s.id === siteId);
    if (siteIndex === -1) {
      throw new ApiError("Site not found", 404);
    }

    const updatedSite: Site = {
      ...memorySites[siteIndex],
      sealedExact: payload.sealedExact,
      blurred: payload.blurred,
      sealedBy: actor,
      sealedAt: new Date().toISOString(),
    };

    memorySites[siteIndex] = updatedSite;
    setStored(STORAGE_SITES, memorySites);

    // Contract rule: POST /api/sites/:id/seal appends SITE_SEALED to audit log
    await recordAuditEvent(
      {
        siteId,
        siteName: updatedSite.name,
        action: "SITE_SEALED",
      },
      token,
      actor
    );

    return updatedSite;
  }

  return fetchWithAuth<Site>(
    `/api/sites/${siteId}/seal`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token
  );
}

/**
 * GET /api/requests
 */
export async function getAccessRequests(token: string | null): Promise<AccessRequest[]> {
  if (USE_MOCK_API) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    memoryRequests = getStored<AccessRequest[]>(STORAGE_REQUESTS, INITIAL_REQUESTS);
    return [...memoryRequests].reverse();
  }
  return fetchWithAuth<AccessRequest[]>("/api/requests", { method: "GET" }, token);
}

/**
 * POST /api/requests
 * Body: { siteId, reason }
 */
export async function createAccessRequest(
  payload: { siteId: string; reason: string },
  token: string | null,
  requester: string = "researcher"
): Promise<AccessRequest> {
  if (USE_MOCK_API) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    memoryRequests = getStored<AccessRequest[]>(STORAGE_REQUESTS, INITIAL_REQUESTS);
    memorySites = getStored<Site[]>(STORAGE_SITES, INITIAL_SITES);
    const site = memorySites.find((s) => s.id === payload.siteId);

    const newRequest: AccessRequest = {
      id: `req-${Date.now()}`,
      siteId: payload.siteId,
      siteName: site ? site.name : payload.siteId,
      requester,
      reason: payload.reason,
      createdAt: new Date().toISOString(),
    };

    memoryRequests.push(newRequest);
    setStored(STORAGE_REQUESTS, memoryRequests);

    // Contract rule: POST /api/requests appends ACCESS_REQUESTED
    await recordAuditEvent(
      {
        siteId: payload.siteId,
        siteName: site?.name,
        action: "ACCESS_REQUESTED",
      },
      token,
      requester
    );

    return newRequest;
  }

  return fetchWithAuth<AccessRequest>(
    "/api/requests",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token
  );
}

/**
 * GET /api/audit
 */
export async function getAuditEvents(token: string | null): Promise<AuditEvent[]> {
  if (USE_MOCK_API) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    memoryAudit = getStored<AuditEvent[]>(STORAGE_AUDIT, INITIAL_AUDIT_EVENTS);
    // Contract rule: Newest first
    return [...memoryAudit].sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
    );
  }
  return fetchWithAuth<AuditEvent[]>("/api/audit", { method: "GET" }, token);
}

/**
 * POST /api/audit
 * Body: { siteId, action: "DECRYPT_SUCCEEDED" | "DECRYPT_DENIED" }
 */
export async function recordAuditEvent(
  payload: { siteId: string; siteName?: string; action: AuditAction },
  token: string | null,
  actor: string = "researcher"
): Promise<AuditEvent> {
  if (USE_MOCK_API) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    memoryAudit = getStored<AuditEvent[]>(STORAGE_AUDIT, INITIAL_AUDIT_EVENTS);
    memorySites = getStored<Site[]>(STORAGE_SITES, INITIAL_SITES);
    const site = memorySites.find((s) => s.id === payload.siteId);

    const newEvent: AuditEvent = {
      at: new Date().toISOString(),
      actor,
      siteId: payload.siteId,
      siteName: payload.siteName || site?.name || payload.siteId,
      action: payload.action,
    };

    memoryAudit.unshift(newEvent);
    setStored(STORAGE_AUDIT, memoryAudit);
    return newEvent;
  }

  return fetchWithAuth<AuditEvent>(
    "/api/audit",
    {
      method: "POST",
      body: JSON.stringify({
        siteId: payload.siteId,
        action: payload.action,
      }),
    },
    token
  );
}

/**
 * Reset mock storage for fresh demo rehearsal
 */
export function resetMockData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_SITES);
  localStorage.removeItem(STORAGE_REQUESTS);
  localStorage.removeItem(STORAGE_AUDIT);
  memorySites = [...INITIAL_SITES];
  memoryRequests = [...INITIAL_REQUESTS];
  memoryAudit = [...INITIAL_AUDIT_EVENTS];
}

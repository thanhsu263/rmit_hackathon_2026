// Data contract from docs/contract.md. Member B owns this file; member C has its own
// copy of the shapes in components/types.ts for the UI.

export type BlurredLocation = {
  lat: number;
  lng: number;
  radiusKm: 50;
};

export type Site = {
  id: string;
  name: string;
  era: string;
  summary: string;
  /** Exact position rounded to the nearest 0.5 degree. Safe to expose. */
  blurred: BlurredLocation;
  /** doEncrypt output of "lat,lng" with tag sitecoords. Never plaintext. */
  sealedExact: string | null;
  sealedBy: string | null;
  /** ISO time */
  sealedAt: string | null;
};

export type AccessRequest = {
  id: string;
  siteId: string;
  requester: string;
  reason: string;
  createdAt: string;
};

export type AuditAction =
  | "SITE_SEALED"
  | "ACCESS_REQUESTED"
  | "DECRYPT_SUCCEEDED"
  | "DECRYPT_DENIED";

export type AuditEvent = {
  at: string;
  actor: string;
  siteId: string;
  action: AuditAction;
};

export const AUDIT_ACTIONS: readonly AuditAction[] = [
  "SITE_SEALED",
  "ACCESS_REQUESTED",
  "DECRYPT_SUCCEEDED",
  "DECRYPT_DENIED",
];

/** Actions a client may record through POST /api/audit. */
export const CLIENT_AUDIT_ACTIONS: readonly AuditAction[] = [
  "DECRYPT_SUCCEEDED",
  "DECRYPT_DENIED",
];

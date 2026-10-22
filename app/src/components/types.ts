// Data contracts matching contract.md

export type BlurredLocation = {
  lat: number;
  lng: number;
  radiusKm: 50;
};

export type Site = {
  id: string;
  name: string;
  era: string;
  summary: string; // fictional, public
  blurred: BlurredLocation; // exact rounded to nearest 0.5 degree
  sealedExact: string | null; // doEncrypt output of "lat,lng", tag sitecoords
  sealedBy: string | null;
  sealedAt: string | null; // ISO time
};

export type AccessRequest = {
  id: string;
  siteId: string;
  siteName?: string;
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
  siteName?: string;
  action: AuditAction;
};

export type TideCloakUser = {
  username: string;
  name: string;
  roleDescription: string;
  roles: string[];
};

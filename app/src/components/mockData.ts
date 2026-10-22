import { Site, AccessRequest, AuditEvent, TideCloakUser } from "./types";

export const MOCK_USERS: Record<string, TideCloakUser> = {
  researcher: {
    username: "researcher",
    name: "Dr. Evelyn Vance",
    roleDescription: "Academic Field Researcher (Unapproved for decryption)",
    roles: [],
  },
  researcher_approved: {
    username: "researcher",
    name: "Dr. Evelyn Vance (Approved)",
    roleDescription: "Academic Field Researcher (2-of-3 Stewards Authorized)",
    roles: ["_tide_sitecoords.selfdecrypt"],
  },
  diglead: {
    username: "diglead",
    name: "Marcus Thorne",
    roleDescription: "Dig Lead & Chief Archaeologist (Encryption Authorized)",
    roles: ["_tide_sitecoords.selfencrypt"],
  },
  custodian: {
    username: "custodian",
    name: "Elder Kaelen Vane",
    roleDescription: "Community Heritage Custodian (Steward 1 of 3)",
    roles: [],
  },
  heritage: {
    username: "heritage",
    name: "Dr. Alistair Cross",
    roleDescription: "Heritage Authority Inspector (Steward 2 of 3)",
    roles: [],
  },
};

export const INITIAL_SITES: Site[] = [
  {
    id: "kalyx-sunken-sanctuary",
    name: "Kalyx Sunken Sanctuary",
    era: "Bronze Age III (~1450 BCE)",
    summary:
      "A submerged ceremonial complex carved from volcanic basalt, featuring intact votive chambers, Linear A glyph tablets, and delicate obsidian vessels vulnerable to looting.",
    blurred: {
      lat: 36.5,
      lng: 25.5,
      radiusKm: 50,
    },
    sealedExact: "TIDE_ENC:sitecoords:36.4128,25.4317",
    sealedBy: "diglead",
    sealedAt: "2026-10-21T09:30:00Z",
  },
  {
    id: "aethelgard-barrow-mound",
    name: "Aethelgard Barrow Mound",
    era: "Early Anglo-Saxon (~610 CE)",
    summary:
      "Unexcavated high-status ship burial mound detected via multi-spectral LiDAR, potentially containing undisturbed garnet cloisonné regalia and ceremonial weaponry.",
    blurred: {
      lat: 52.0,
      lng: 1.5,
      radiusKm: 50,
    },
    sealedExact: null,
    sealedBy: null,
    sealedAt: null,
  },
  {
    id: "oasis-zephyra-necropolis",
    name: "Oasis of Zephyra Necropolis",
    era: "Ptolemaic Dynasty (~240 BCE)",
    summary:
      "Subterranean labyrinth with gilded cartonnage coffins and astronomically aligned ventilation shafts preserved beneath shifting western desert dunes.",
    blurred: {
      lat: 29.0,
      lng: 30.5,
      radiusKm: 50,
    },
    sealedExact: "TIDE_ENC:sitecoords:29.2140,30.7812",
    sealedBy: "diglead",
    sealedAt: "2026-10-20T14:15:00Z",
  },
  {
    id: "obsidian-ridge-megaliths",
    name: "Obsidian Ridge Megaliths",
    era: "Neolithic (~3200 BCE)",
    summary:
      "Curvilinear basalt stone circle array with intact ceremonial hearth deposits, oriented precisely toward the winter solstice mountain notch.",
    blurred: {
      lat: -13.5,
      lng: -72.0,
      radiusKm: 50,
    },
    sealedExact: null,
    sealedBy: null,
    sealedAt: null,
  },
];

export const INITIAL_REQUESTS: AccessRequest[] = [
  {
    id: "req-101",
    siteId: "kalyx-sunken-sanctuary",
    siteName: "Kalyx Sunken Sanctuary",
    requester: "researcher",
    reason:
      "Conducting non-invasive acoustic sonar tomography on subterranean basalt chambers to verify structural stability before autumn tidal swells.",
    createdAt: "2026-10-21T11:00:00Z",
  },
];

export const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    at: "2026-10-21T11:45:10Z",
    actor: "researcher",
    siteId: "kalyx-sunken-sanctuary",
    siteName: "Kalyx Sunken Sanctuary",
    action: "DECRYPT_DENIED",
  },
  {
    at: "2026-10-21T11:00:00Z",
    actor: "researcher",
    siteId: "kalyx-sunken-sanctuary",
    siteName: "Kalyx Sunken Sanctuary",
    action: "ACCESS_REQUESTED",
  },
  {
    at: "2026-10-21T09:30:00Z",
    actor: "diglead",
    siteId: "kalyx-sunken-sanctuary",
    siteName: "Kalyx Sunken Sanctuary",
    action: "SITE_SEALED",
  },
  {
    at: "2026-10-20T14:15:00Z",
    actor: "diglead",
    siteId: "oasis-zephyra-necropolis",
    siteName: "Oasis of Zephyra Necropolis",
    action: "SITE_SEALED",
  },
];

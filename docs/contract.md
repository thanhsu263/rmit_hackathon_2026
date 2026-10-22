# Custodian Vault - team contract

Single source of truth for members A, B and C. If anything here changes, member A updates this file and tells the
team chat. Deadline: submit by **17:00** Thu 22 Oct 2026 (hard limit 18:00 Vietnam time).

## What we are building

A Next.js app integrated with TideCloak. The exact location of a fictional archaeological site is sealed in the
browser with Tide end-to-end encryption (tag `sitecoords`). Researchers only see a blurred location. Reading the
exact location needs the realm role `_tide_sitecoords.selfdecrypt`; granting or removing that role is a governed
TideCloak change that needs **2 of 3** stewards (community custodian, heritage authority, dig lead). A lone admin
is blocked.

Demo moment: one steward grants access alone -> request stays PENDING and "Reveal" is denied -> a second steward
authorizes -> "Reveal" shows the exact location -> a 2-of-3 revocation -> "Reveal" is denied again.

Out of scope: maps/GIS, custodian-mandatory policy, automatic expiry timers, approving inside our app (approvals
happen in tide-console -> QEA Approvals), real community or site names, deployment.

## Team

| Member | Owns | Files |
|---|---|---|
| A (host) | TideCloak server, realm, users, roles, enrolments, README, demo script, video | `docs/runbook.md`, `docs/demo-script.md`, `README.md`, `demo/` |
| B | Data store, API routes, token checks, seed data, shared config | `app/src/lib/**` (except UI helpers), `app/src/app/api/**`, `app/data/**`, `app/package.json`, root layout/provider files |
| C | Pages, components, English UI copy | `app/src/app/**` pages except `api/`, `app/src/components/**` |

Paths assume the scaffold uses `app/src/app` (App Router). After A creates the app, check the real layout and keep
the same split. Do not edit another member's files; ask in the team chat.

Demo cast: A = dig lead (`diglead`) + researcher (`researcher`, second browser profile); B = heritage authority
(`heritage`); C = community custodian (`custodian`). **All sign-ins and Tide enrolments happen on A's laptop**,
because TideCloak runs on its `localhost:8080`.

## TideCloak facts (docs.tide.org, read 22 Oct 12:00)

- `@tidecloak/nextjs` exports `<TideCloakProvider>`, `useTideCloak()`, `verifyTideCloakToken()`,
  `<Authenticated>` / `<Unauthenticated>`, `createTideCloakMiddleware()`.
- `useTideCloak()` gives `authenticated`, `login()`, `logout()`, `token`, `refreshToken()`, `hasRealmRole(role)`,
  `getValueFromToken(key)`, `doEncrypt(items)`, `doDecrypt(items)`.
- `doEncrypt([{ data: string, tags: ['sitecoords'] }])` returns `string[]`;
  `doDecrypt([{ encrypted, tags: ['sitecoords'] }])` returns the plaintext array in the same order.
  Encrypt needs `_tide_sitecoords.selfencrypt`, decrypt needs `_tide_sitecoords.selfdecrypt`.
- Role changes reach the user's token only after a token refresh: call `refreshToken()` before `doDecrypt`.
- Reference pages: `docs.tide.org/Languages/NextJS/tidecloak-nextjs-reference`,
  `docs.tide.org/Languages/NextJS/VerifyJWT`, `docs.tide.org/Admin/e2ee`.

## Data contract (B implements, C consumes)

```ts
type Site = {
  id: string; name: string; era: string; summary: string;        // fictional, public
  blurred: { lat: number; lng: number; radiusKm: 50 };            // exact rounded to the nearest 0.5 degree
  sealedExact: string | null;                                     // doEncrypt output of "lat,lng", tag sitecoords
  sealedBy: string | null; sealedAt: string | null;               // ISO time
};
type AccessRequest = { id: string; siteId: string; requester: string; reason: string; createdAt: string };
type AuditEvent = { at: string; actor: string; siteId: string;
  action: "SITE_SEALED" | "ACCESS_REQUESTED" | "DECRYPT_SUCCEEDED" | "DECRYPT_DENIED" };
```

| Route | Body | Response | Rule |
|---|---|---|---|
| `GET /api/sites` | - | `Site[]` | signed in |
| `POST /api/sites/:id/seal` | `{ sealedExact: string, blurred: {lat,lng,radiusKm} }` | `Site` | token holds `_tide_sitecoords.selfencrypt`; appends SITE_SEALED |
| `GET /api/requests` | - | `AccessRequest[]` newest first | signed in |
| `POST /api/requests` | `{ siteId, reason }` | `AccessRequest` | signed in; appends ACCESS_REQUESTED |
| `GET /api/audit` | - | `AuditEvent[]` newest first | signed in |
| `POST /api/audit` | `{ siteId, action: "DECRYPT_SUCCEEDED" \| "DECRYPT_DENIED" }` | `AuditEvent` | signed in |

- Every route reads `Authorization: Bearer <token>` (the client sends `token` from `useTideCloak()`) and verifies
  it with `verifyTideCloakToken()`. No/invalid token -> `401 {"error":"unauthenticated"}`; missing role ->
  `403 {"error":"forbidden"}`; bad body or unknown site -> `400`/`404` with `{"error": "..."}`.
- `actor`, `requester` and `sealedBy` come from the verified token (`preferred_username`), never from the body.
- The server never receives or stores exact coordinates in plaintext.

## Timeline

| Time | A | B | C |
|---|---|---|---|
| 12:15-12:45 | Task 1: TideCloak + scaffold `app/` | read this file, prepare store code | sketch UI against this contract |
| 12:45-13:15 | Task 2 gate with B | Task 2 gate with A | build pages with mock data |
| ~13:30 | send enrolment links | enrol `heritage` on A's laptop | enrol `custodian` on A's laptop |
| 13:15-15:15 | users/roles, runbook, README draft | Task 4 API | Task 5 UI |
| 15:15-15:45 | Task 6 rehearsal | Task 6 | Task 6 |
| 15:45-16:45 | README final, video | review README, act in video | review README, act in video |

**13:15 gate:** if a user holding `selfdecrypt` cannot decrypt ciphertext sealed by another user, everyone stops and
A re-plans. Do not invent another encryption scheme.

## Rules

- Branch per member (`b/api`, `c/ui`), small commits, pull often; A merges into `main`.
- Never commit `.env*`, adapter/secret JSON files, `node_modules/`, `.next/`. Check `git status` before every push.
- English for UI copy, code and commit messages. Fictional names only.

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

Out of scope: maps/GIS, custodian-mandatory policy, automatic expiry timers, approving inside our app in live mode
(approvals happen in tide-console -> QEA Approvals), real community or site names, deployment.

## Auth modes: live and mock (added 13:50)

Tide's licence service (`Midgard.FinalizeWallet`) failed with HTTP 500 / timeouts from 06:22 UTC, so no Tide realm
could be provisioned. The app therefore runs in two modes, chosen by `NEXT_PUBLIC_AUTH_MODE`:

| | `live` | `mock` (default) |
|---|---|---|
| Sign-in | Tide (TideCloak at `localhost:8080`) | `/mock/login`: pick `diglead`, `heritage`, `custodian` or `researcher` |
| Roles | realm roles in the TideCloak token | simulated store in `app/.mock-data/` (gitignored) |
| 2-of-3 role changes | tide-console -> QEA Approvals | `/mock/approvals` (same rule: `max(1, floor(0.7 x admins))`) |
| Encrypt / decrypt | Tide E2EE in the browser | `/api/mock/crypto`, gated by the same roles; **the server holds the key** |

A red "SIMULATION MODE" banner is shown on every page in mock mode. Never hide it, and never describe mock mode as
TideCloak in the README or video. **Everyone codes against the same API, so nothing changes when we switch to live.**

Client (pages, components):
```ts
import { useAuth } from '@/lib/auth/client'
const { mode, ready, authenticated, username, token, hasRole, refresh, encrypt, decrypt, login, logout } = useAuth()
// encrypt(plain) -> sealed string; decrypt(sealed) -> plain, throws when the user lacks the decrypt role
// call `await refresh()` before decrypt so a just-approved role is picked up
```
Server (API routes):
```ts
import { getUser } from '@/lib/auth/server'          // -> { username, roles } | null
import { TAG, ROLE_ENCRYPT, ROLE_DECRYPT, ROLE_ADMIN } from '@/lib/auth/config'
```
Do not import `@tidecloak/nextjs` directly anywhere else; go through `src/lib/auth`. Do not commit a filled-in
`app/tidecloak.json` (it stays `{}` in git).

Run locally: `cd app && npm install && npm run dev` -> http://localhost:3000 (mock mode by default).

## Team

| Member | Owns | Files (relative to `app/`) |
|---|---|---|
| A (host) | Auth layer (live/mock), mock governance pages, TideCloak server and realm, README, demo script, video | `src/lib/auth/**`, `src/components/tidecloak.tsx` (adapter), `src/app/api/mock/**`, `src/app/mock/**`, `src/app/auth/**`, `src/app/tide_dpop/**`, `tidecloak.json`, `init/**`, `../docs/**`, `../README.md`, `../demo/` |
| B | Data store, Custodian Vault API routes, seed data, dependencies | `src/lib/*.ts` outside `src/lib/auth`, `src/app/api/**` except `api/mock`, `data/**`, `package.json` |
| C | Pages, components, layout, English UI copy | `src/app/**` pages and styles except `mock/`, `auth/`, `api/`; `src/components/**` except `tidecloak.tsx` |

The app is C's Next.js 16 project with `src/app` (App Router); the `@/` alias points at `src/`. C's components keep
calling `useTideCloak()` from `src/components/tidecloak.tsx`, which is now an adapter over `useAuth()` - roles come
from the auth layer, never from a profile picker. `USE_MOCK_AUTH` in `src/components/config.ts` is no longer used;
`USE_MOCK_API` switches C's localStorage data to B's API once B's routes land. Sites pre-sealed in C's mock data use
a fake ciphertext and will not reveal; seal sites through the app (as `diglead`) for the demo.
Do not edit another member's files; ask in the team chat.

Demo cast: A = dig lead (`diglead`) + researcher (`researcher`, second browser profile); B = heritage authority
(`heritage`); C = community custodian (`custodian`). **All sign-ins happen on A's laptop**, because the demo server
(and TideCloak, if it comes back) runs on A's `localhost`.

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
  sealedExact: string | null;                                     // useAuth().encrypt("lat,lng") output
  sealedBy: string | null; sealedAt: string | null;               // ISO time
};
type AccessRequest = { id: string; siteId: string; requester: string; reason: string; createdAt: string };
type AuditEvent = { at: string; actor: string; siteId: string;
  action: "SITE_SEALED" | "ACCESS_REQUESTED" | "DECRYPT_SUCCEEDED" | "DECRYPT_DENIED" };
```

| Route | Body | Response | Rule |
|---|---|---|---|
| `GET /api/sites` | - | `Site[]` | signed in |
| `POST /api/sites/:id/seal` | `{ sealedExact: string, blurred: {lat,lng,radiusKm} }` | `Site` | user holds `ROLE_ENCRYPT`; appends SITE_SEALED |
| `GET /api/requests` | - | `AccessRequest[]` newest first | signed in |
| `POST /api/requests` | `{ siteId, reason }` | `AccessRequest` | signed in; appends ACCESS_REQUESTED |
| `GET /api/audit` | - | `AuditEvent[]` newest first | signed in |
| `POST /api/audit` | `{ siteId, action: "DECRYPT_SUCCEEDED" \| "DECRYPT_DENIED" }` | `AuditEvent` | signed in |

- Every route calls `getUser(request)` from `@/lib/auth/server` (the client sends `Authorization: Bearer ${token}`
  with `token` from `useAuth()`). No/invalid token -> `401 {"error":"unauthenticated"}`; missing role ->
  `403 {"error":"forbidden"}`; bad body or unknown site -> `400`/`404` with `{"error": "..."}`.
- `actor`, `requester` and `sealedBy` come from the verified token (`preferred_username`), never from the body.
- The server never receives or stores exact coordinates in plaintext.

## Timeline

Revised at 13:50 after the Tide licence outage.

| Time | A | B | C |
|---|---|---|---|
| 14:00-15:30 | retry realm every 20-30 min, report outage to organisers, README draft | Task 4 API in mock mode | Task 5 UI in mock mode |
| 15:30-16:00 | Task 6 rehearsal (live if Tide is back, otherwise mock) | Task 6 | Task 6 |
| 16:00-16:45 | README final, video | review README, act in video | review README, act in video |

**16:00 decision:** if Tide is back and the realm works, the demo runs in `live`; otherwise we submit in `mock` with the
banner and an honest README section on the outage.

## Rules

- Branch per member (`b/api`, `c/ui`), small commits, pull often; A merges into `main`.
- Never commit `.env*`, adapter/secret JSON files, `node_modules/`, `.next/`. Check `git status` before every push.
- English for UI copy, code and commit messages. Fictional names only.

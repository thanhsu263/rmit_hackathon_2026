[![Built with TideCloak](https://tide.org/badges/built-with-tidecloak.svg)](https://tide.org/tidecloak?utm_source=github&utm_medium=readme&utm_campaign=unlocked)

## Project overview

**Custodian Vault lets a community share a heritage site's exact location with the right researcher, without giving any one administrator the power to open it.**

Built with [TideCloak](https://tide.org/tidecloak?utm_source=github&utm_medium=readme&utm_campaign=unlocked).

### 1. Vision & originality

Heritage registers force a choice: publish coordinates and invite looters, or lock them away and block research. Custodian Vault removes it. Sites show a blurred location; exact coordinates stay sealed until a quorum of stewards opens them for a researcher. Access becomes a community decision, not an administrator's.

### 2. Trust constraint insight

The blocker is custody, not encryption. Someone always holds the master key: an administrator, a vendor, a backup. So communities withhold locations. Remove that single point of override and sharing becomes safe to offer and to revoke.

### 3. Value & impact

Communities keep authority over their places; researchers get real coordinates. A pressured or mistaken steward cannot act alone, and every reveal and refusal is recorded. Example: a survey team's request stays sealed until two stewards agree.

### 4. Why TideCloak matters

With Tide's Emergent Authority (live mode), coordinates are sealed in the browser (`sitecoords` tag), reading them needs the `_tide_sitecoords.selfdecrypt` role, and granting or revoking it takes 2 of 3 admins (Quorum Enforced Authorization), so the server never sees plaintext. Ordinary login cannot promise this: whoever grants a permission can take it back alone.

**Plan C:** Tide's network was overloaded, so no realm could be licensed (`Midgard.FinalizeWallet` HTTP 500). As the organisers' Plan C allows, this demo simulates TideCloak, under a labelled SIMULATION MODE banner. The simulating server could read the data; the live path is written but untested. See "Where TideCloak fits" below.

### 5. Prototype & storytelling

The dig lead seals a site; a researcher is denied; one steward approves, still denied; the second approves and the coordinates appear; a 2-of-3 revocation closes access again. Every step is audited.

## Where TideCloak fits (Plan C)

Plan C asks teams that cannot license TideCloak to simulate it and show where it fits. The app has one auth interface (`useAuth()` for pages, `getUser()` for API routes) with two implementations, chosen by `NEXT_PUBLIC_AUTH_MODE`. Everything in the middle column runs today; the right column is the TideCloak code path already written behind the same interface.

| Piece | Simulated today (`mock`) | TideCloak (`live`) |
|---|---|---|
| Sign-in | `/mock/login`, pick a demo account | `TideCloakProvider`, sign-in through the Tide enclave (`LiveBridge` in `app/src/lib/auth/client.tsx`) |
| Roles | simulated store in `app/.mock-data/` | realm roles `_tide_sitecoords.selfencrypt`, `_tide_sitecoords.selfdecrypt`, `tide-realm-admin` |
| 2-of-3 approval | `/mock/approvals`, same rule `max(1, floor(0.7 x admins))` | Quorum Enforced Authorization: role changes are change requests in tide-console, approved by 2 of 3 admins |
| Sealing and reveal | `/api/mock/crypto`, the app's server holds the key | `doEncrypt` / `doDecrypt` in the browser with tag `sitecoords`; no server holds a key |
| API identity | mock bearer tokens, `getUser()` | `verifyTideCloakToken()` (`app/src/lib/auth.ts`, `app/src/lib/auth/server.ts`) |
| Realm setup | not needed | `app/init/tcinit.sh` creates the realm and admin |

**What TideCloak makes possible here:** a sealed location that nobody can open alone. Nobody, including the operator, holds a master key, and granting or revoking access is itself a 2-of-3 decision. In `mock` the same flow is visible, but the app's own server could still read the data; that is the gap TideCloak closes. Where it fits was planned with Tide's MCP (Raziel), whose closest reference scenarios are *IGA Admin Governance* (multi-admin approval of role changes) and *Forseti E2EE* (browser-side encryption with `selfencrypt`/`selfdecrypt` roles).

## Demo video

[`demo/demo.mp4`](demo/demo.mp4) (two minutes).

## Setup

Requires Node.js 20+.

```bash
cd app
npm install
npm run dev
```

Open http://localhost:3000. The app starts in **mock (simulation) mode**: sign in as `diglead`, `heritage`, `custodian` or `researcher` at `/mock/login`, and approve role changes at `/mock/approvals`. A red banner marks the simulation on every page. Use a separate browser profile for each person. Data is shared through the server (`app/data/*.json`). `npm run demo:reset` restores the starting state; `npm run test:flow` runs the whole 2-of-3 demo flow against the running app and reports PASS/FAIL.

**Live mode (TideCloak).** Start TideCloak (`tideorg/tidecloak-dev`), run `app/init/tcinit.sh` to create the realm and export `app/tidecloak.json`, create the `_tide_sitecoords.selfencrypt` and `_tide_sitecoords.selfdecrypt` roles, then set `NEXT_PUBLIC_AUTH_MODE=live`. Full details: [`docs/contract.md`](docs/contract.md).

## What was verified

`npm run test:flow` drives the whole demo through the API (30 checks, all passing in mock mode). Sealing stores only ciphertext, and searching `app/data/` for the real coordinates finds nothing. The quorum reads 3 admins, 2 approvals needed. Nothing was verified in live mode: no Tide realm could be provisioned.

## Repository layout

| Path | Contents |
|---|---|
| `app/` | Next.js prototype: UI, API routes, live/mock auth layer (`app/src/lib/auth`) |
| `docs/contract.md` | Team contract: scope, data contract, auth modes |
| `demo/` | Two-minute demo video (`demo.mp4`) |

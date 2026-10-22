[![Built with TideCloak](https://tide.org/badges/built-with-tidecloak.svg)](https://tide.org/tidecloak?utm_source=github&utm_medium=readme&utm_campaign=unlocked)

## Project overview

**Custodian Vault lets a community share a heritage site's exact location with the right researcher, without giving any one administrator the power to open it.**

Built with [TideCloak](https://tide.org/tidecloak?utm_source=github&utm_medium=readme&utm_campaign=unlocked).

### 1. Vision & originality

Heritage registers force a choice: publish coordinates and invite looters, or lock them away and block research. Custodian Vault removes it. Sites show a blurred location; exact coordinates stay sealed until a quorum of stewards opens them for a researcher. Access becomes a community decision, not an administrator's.

### 2. Trust constraint insight

The blocker is custody, not encryption. Someone always holds the master key: an administrator, a vendor, a backup. So communities withhold locations. Remove that single point of override and sharing becomes safe to offer and to revoke.

### 3. Value & impact

Communities keep authority over their places; researchers get real coordinates. A pressured or mistaken steward cannot act alone, and every reveal and refusal is recorded. Example: a survey team's request for a burial mound stays sealed until two stewards agree.

### 4. Why TideCloak matters

With Tide's Emergent Authority (live mode), coordinates are sealed in the browser (`sitecoords` tag), reading them needs the `_tide_sitecoords.selfdecrypt` role, and granting or revoking it takes 2 of 3 admins (Quorum Enforced Authorization), so the server never sees plaintext. Ordinary login cannot promise this: whoever grants a permission can take it back alone.

**Honest status:** Tide's licence service failed during the hackathon (`Midgard.FinalizeWallet` HTTP 500), so no realm could be provisioned. This demo runs in `mock`: a labelled SIMULATION MODE where the app's own server simulates roles, quorum and sealing, and could read the data. Mock mode is not TideCloak; the live path is untested.

### 5. Prototype & storytelling

The dig lead seals a site; a researcher is denied; one steward approves, still denied; the second approves and the coordinates appear; a 2-of-3 revocation closes access again. Every step is audited.

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

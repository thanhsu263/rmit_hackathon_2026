[![Built with TideCloak](https://tide.org/badges/built-with-tidecloak.svg)](https://tide.org/tidecloak?utm_source=github&utm_medium=readme&utm_campaign=unlocked)

## Project overview

**Custodian Vault keeps an archaeological site's exact location sealed so no single administrator, or thief with their password, can read it: revealing it takes two of three stewards.**

Built with [TideCloak](https://tide.org/tidecloak?utm_source=github&utm_medium=readme&utm_campaign=unlocked).

### 1. Vision & originality

A heritage registry where exact coordinates are encrypted in the browser. Researchers see only a 50 km blur. Revealing the real position, and revoking it, needs two of three stewards: community custodian, heritage authority, dig lead. The operator holds no master key.

### 2. Trust constraint insight

Today an administrator can read the database, so one leak or stolen credential exposes every site to looters. A community's say is policy, not something the system enforces. Registries therefore hide data, slowing science, or trust one admin. Remove that single authority and sensitive sites can be shared on a decision, not on trust.

### 3. Value & impact

Researchers get answers from those in authority; communities get a real veto; authorities get an audit trail. Example: a team planning a radar survey of a burial mound requests access, and the site stays hidden until two stewards agree.

### 4. Why TideCloak matters

With ordinary login the operator can still read everything. This uses TideCloak's browser-side encryption (`doEncrypt`/`doDecrypt`) and Quorum Enforced Authorization: granting or removing the decrypt role needs 2 of 3 admins.

**Honest status:** Tide's licence service failed during the hackathon (`Midgard.FinalizeWallet` HTTP 500, reported on Tide's Discord), so no realm could be provisioned. The demo runs in a clearly labelled **simulation mode**; the `live` TideCloak code path is in the repo but untested on a live realm.

### 5. Prototype & storytelling

The dig lead seals a site; a researcher is denied; one steward approves and the researcher is still denied; the second approves and the exact coordinates appear; a 2-of-3 revocation closes access again. Every step is audited.

## Demo video

[`demo/demo.mp4`](demo/demo.mp4) (two minutes).

## Setup

Requires Node.js 20+.

```bash
cd app
npm install
npm run dev
```

Open http://localhost:3000. The app starts in **mock (simulation) mode**: sign in as `diglead`, `heritage`, `custodian` or `researcher` at `/mock/login`, and approve role changes at `/mock/approvals`. A red banner marks the simulation on every page. Use a separate browser profile for each person. Data is shared through the server (`app/data/*.json`; `git checkout -- app/data` resets it).

**Live mode (TideCloak).** Start TideCloak (`tideorg/tidecloak-dev`), run `app/init/tcinit.sh` to create the realm and export `app/tidecloak.json`, create the `_tide_sitecoords.selfencrypt` and `_tide_sitecoords.selfdecrypt` roles, then set `NEXT_PUBLIC_AUTH_MODE=live`. Full details: [`docs/contract.md`](docs/contract.md).

## Repository layout

| Path | Contents |
|---|---|
| `app/` | Next.js prototype: UI, API routes, live/mock auth layer (`app/src/lib/auth`) |
| `docs/contract.md` | Team contract: scope, data contract, auth modes |
| `demo/` | Two-minute demo video (`demo.mp4`) |

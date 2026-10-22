---
name: custodian-vault-api
description: Member B's work on Custodian Vault (UNLOCKED Challenge 2) - the JSON data store, Next.js API routes, TideCloak token verification, seed data and shared app config. Use when member B asks to build, fix, test or explain the backend/API, the Task 2 encryption gate with member A, or anything under app/src/app/api, app/src/lib or app/data.
---

# Custodian Vault - member B (data and API)

You are helping member B of a 3-person hackathon team. Read `docs/contract.md` first: it is the single source of
truth for the product, the data contract, file ownership and the timeline. This skill only adds how B works.

## B's scope

Owns: `app/src/app/api/**`, `app/src/lib/**` (data/auth helpers, not UI helpers), `app/data/**`,
`app/package.json`, and root layout/provider files. Do not edit pages or components (member C) or `README.md`,
`docs/runbook.md`, `docs/demo-script.md` (member A). If a change is needed there, write the request for the team
chat instead.

## Before writing code

1. `git pull` and confirm `app/` exists (member A scaffolds it with `npm init @tidecloak/nextjs@latest app`).
   If it does not exist yet, stop and say so.
2. Inspect the scaffold: router type, `src/` layout, how `<TideCloakProvider>` and the adapter config are wired,
   any example API route or middleware, and how the template verifies tokens. Follow its conventions; if the real
   layout differs from the paths in the contract, keep the same ownership split and tell the team.
3. Work on branch `b/api`.

## Task 2 - encryption gate (with member A, target 13:15)

Build a temporary scratch page (for example `app/src/app/scratch-e2ee/page.tsx`, delete it after the gate) where a
signed-in user can encrypt a string with `doEncrypt([{ data, tags: ['sitecoords'] }])`, copy the ciphertext, and a
*different* signed-in user (separate browser profile on A's laptop) decrypts it with `doDecrypt`. Report exactly
one of:
- PASS: user Y (holds `_tide_sitecoords.selfdecrypt`) decrypts X's ciphertext; a user without the role gets an error.
- FAIL: with the exact error text. On FAIL, stop: the team re-plans. Do not try another crypto scheme.

## Task 4 - store and API

- Store: one small module (e.g. `app/src/lib/store.ts`) reading/writing JSON files under `app/data/`
  (`sites.json`, `requests.json`, `audit.json`). Write via a temp file then rename so a crash cannot leave
  half-written JSON. Single-process dev server only; no database.
- Seed: 3 fictional sites with `id`, `name`, `era`, `summary`, `blurred`, and `sealedExact: null`. Invent clearly
  fictional names (no real communities, peoples or places). Commit the seed file; runtime data that contains
  ciphertext may be committed too, never plaintext coordinates.
- Routes exactly as in `docs/contract.md` (paths, bodies, status codes, error shape `{ "error": "..." }`).
- Auth helper: read `Authorization: Bearer <token>`, verify with `verifyTideCloakToken()` from `@tidecloak/nextjs`
  (check its real signature in the scaffold or `docs.tide.org/Languages/NextJS/VerifyJWT`), take the username
  from the verified payload (`preferred_username`), and check realm roles from the payload for the seal route.
- `actor`, `requester`, `sealedBy` always come from the verified token, never from the request body.
- Validate bodies: `siteId` must exist; `reason` non-empty string up to 500 chars; `sealedExact` non-empty string;
  `blurred.lat` in [-90, 90], `blurred.lng` in [-180, 180]; `action` only `DECRYPT_SUCCEEDED` / `DECRYPT_DENIED`.

## Verify before saying "done"

Run from `app/`:
- `npm run build` (and `npm run lint` if the scaffold has it) passes.
- Without a token: every route returns 401. With a researcher token: `POST /api/sites/:id/seal` returns 403.
- After a seal from the dig lead, `app/data/sites.json` contains ciphertext and no plaintext coordinates.
- `GET /api/audit` lists SITE_SEALED / ACCESS_REQUESTED / DECRYPT_* events newest first.
Report what you ran and the real output. If something could not be checked (for example it needs a Tide sign-in
on A's laptop), say so.

## Rules

- Small commits on `b/api` with English messages; pull often; tell member A when a slice is ready to merge.
- Never commit `.env*`, adapter or secret JSON, `node_modules/`, `.next/`. Check `git status` before pushing.
- Ask before `git push`, and never push to `main` directly.
- Contract changes go through member A and `docs/contract.md` first, then code.

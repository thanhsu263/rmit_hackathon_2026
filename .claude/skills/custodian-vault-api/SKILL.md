---
name: custodian-vault-api
description: Member B's work on Custodian Vault (UNLOCKED Challenge 2) - the JSON data store, Next.js API routes, seed data and dependencies (auth comes from lib/auth). Use when member B asks to build, fix, test or explain the backend/API, or anything under app/src/app/api (except api/mock), app/src/lib (except lib/auth) or app/data.
---

# Custodian Vault - member B (data and API)

You are helping member B of a 3-person hackathon team. Read `docs/contract.md` first: it is the single source of
truth for the product, the data contract, file ownership and the timeline. This skill only adds how B works.

## B's scope

Owns (paths relative to `app/`): `src/app/api/**` except `src/app/api/mock/**`, `src/lib/*.ts` outside
`src/lib/auth/`, `data/**`, `package.json`. Member A owns `src/lib/auth/**`, `src/components/tidecloak.tsx`,
`src/app/api/mock/**`, `src/app/mock/**`, `tidecloak.json` and the docs; member C owns pages, layout and the rest of
`src/components/**`. C's `src/components/api.ts` already calls the contract routes when `USE_MOCK_API = false`. If a change is needed there, write the
request for the team chat instead.

Auth: TideCloak's licence service was down, so the app has `live` and `mock` modes (see `docs/contract.md`). In every
route use `getUser(request)` from `@/lib/auth/server` and role names from `@/lib/auth/config`. Never import
`@tidecloak/nextjs` directly and never branch on the mode in your code - the auth layer hides it.

## Before writing code

1. `git pull` and confirm `app/` exists (member A scaffolds it with `npm init @tidecloak/nextjs@latest app`).
   If it does not exist yet, stop and say so.
2. Inspect the app: App Router under `src/app`, the `@/` alias (-> `src/`), `src/lib/auth/server.ts`, the mock routes,
   any example API route or middleware, and how the template verifies tokens. Follow its conventions; if the real
   layout differs from the paths in the contract, keep the same ownership split and tell the team.
3. Work on branch `b/api`.

## Task 4 - store and API

- Store: one small module (`src/lib/store.ts`) reading/writing JSON files under `data/` (resolve from `process.cwd()`)
  (`sites.json`, `requests.json`, `audit.json`). Write via a temp file then rename so a crash cannot leave
  half-written JSON. Single-process dev server only; no database.
- Seed: 3 fictional sites with `id`, `name`, `era`, `summary`, `blurred`, and `sealedExact: null`. Invent clearly
  fictional names (no real communities, peoples or places). Commit the seed file; runtime data that contains
  ciphertext may be committed too, never plaintext coordinates.
- Routes exactly as in `docs/contract.md` (paths, bodies, status codes, error shape `{ "error": "..." }`).
- Auth: `const user = await getUser(request)` -> `{ username, roles }` or `null` (401). The seal route requires
  `user.roles.includes(ROLE_ENCRYPT)` (403 otherwise).
- `actor`, `requester`, `sealedBy` always come from `user.username`, never from the request body.
- Validate bodies: `siteId` must exist; `reason` non-empty string up to 500 chars; `sealedExact` non-empty string;
  `blurred.lat` in [-90, 90], `blurred.lng` in [-180, 180]; `action` only `DECRYPT_SUCCEEDED` / `DECRYPT_DENIED`.

## Verify before saying "done"

Run from `app/`:
- `npm run build` (and `npm run lint` if the scaffold has it) passes.
- Without a token: every route returns 401. In mock mode `Authorization: Bearer mock:researcher` on
  `POST /api/sites/:id/seal` returns 403; `Bearer mock:diglead` succeeds.
- After a seal from the dig lead, `data/sites.json` contains ciphertext and no plaintext coordinates.
- `GET /api/audit` lists SITE_SEALED / ACCESS_REQUESTED / DECRYPT_* events newest first.
Report what you ran and the real output. If something could not be checked (for example it needs live mode on A's laptop), say so.

## Rules

- Small commits on `b/api` with English messages; pull often; tell member A when a slice is ready to merge.
- Never commit `.env*`, adapter or secret JSON, `node_modules/`, `.next/`. Check `git status` before pushing.
- Ask before `git push`, and never push to `main` directly.
- Contract changes go through member A and `docs/contract.md` first, then code.

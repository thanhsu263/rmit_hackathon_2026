---
name: custodian-vault-ui
description: Member C's work on Custodian Vault (UNLOCKED Challenge 2) - the Next.js pages and components, browser-side encrypt/decrypt with TideCloak, and English UI copy. Use when member C asks to build, fix, style, test or explain the site list, site detail (request / reveal exact location), the seal form, the audit page, or anything under app/src/components or the non-API pages in app/src/app.
---

# Custodian Vault - member C (UI)

You are helping member C of a 3-person hackathon team. Read `docs/contract.md` first: it is the single source of
truth for the product, the data contract, file ownership and the timeline. This skill only adds how C works.

## C's scope

Owns: pages under `app/src/app/**` except `api/`, and everything in `app/src/components/**` (including the
browser-side API client and mock data). Do not edit `app/src/app/api/**`, `app/src/lib/**`, `app/data/**`,
`app/package.json` or root layout/provider files (member B), or `README.md` / `docs/*` (member A). If you need a
dependency or a provider change, write the request for B in the team chat.

## Before writing code

1. `git pull` and confirm `app/` exists (member A scaffolds it). If not, sketch components against the contract
   and wait.
2. Inspect the scaffold: router type, existing pages, how `useTideCloak()` and `<Authenticated>` are used, existing
   styling approach (CSS modules, Tailwind or plain CSS). Reuse what is there; add no UI library.
3. Work on branch `c/ui`. Until B's API lands, read from a mock module in `app/src/components/` that returns data in
   the exact contract shapes, behind one switch, so swapping to the real API is a one-line change.

## Screens

All copy in English, short and plain. Fictional names only.

1. **Header** (every page): app name "Custodian Vault", signed-in username, login/logout.
2. **Sites** (`/`): one card per site - name, era, summary, "Approximate location: {lat}, {lng} (within 50 km)",
   and a "Sealed" / "Not sealed yet" badge. Never show exact coordinates here.
3. **Site detail** (`/sites/[id]`):
   - Request access: a reason textarea and "Request exact location" -> `POST /api/requests`; then a confirmation
     that says approvals happen with the stewards (2 of 3) in TideCloak, not in this app.
   - "Reveal exact location": call `refreshToken()` first, then `doDecrypt([{ encrypted: site.sealedExact,
     tags: ['sitecoords'] }])` inside try/catch. Success -> show the exact `lat, lng` with the note "Decrypted in
     your browser. The server only stores ciphertext." and `POST /api/audit` `DECRYPT_SUCCEEDED`. Failure -> a clear
     denied state ("You do not hold the decrypt role yet. Two of three stewards must approve.") and
     `POST /api/audit` `DECRYPT_DENIED`. Always attempt `doDecrypt` (do not skip it based on a role check) so the
     denial comes from TideCloak. Keep plaintext only in component state; never send it anywhere or store it.
   - Hidden when `sealedExact` is null: show "Not sealed yet".
4. **Seal** (visible only if `hasRealmRole('_tide_sitecoords.selfencrypt')`): inputs for exact latitude and
   longitude, validated to [-90, 90] / [-180, 180]; compute `blurred` by rounding each to the nearest 0.5 with
   `radiusKm: 50`; `doEncrypt([{ data: \`${lat},${lng}\`, tags: ['sitecoords'] }])`; `POST /api/sites/:id/seal`
   with `{ sealedExact, blurred }`. Clear the inputs after success.
5. **Audit** (`/audit`): table of events newest first - time, actor, site, action - with human-readable action
   labels.

API client: one helper in `app/src/components/` that adds `Authorization: Bearer ${token}` from `useTideCloak()`
and turns `{ "error": ... }` responses into a visible message.

## States and accessibility

Every data view has loading, error (with retry), empty, and success states; reveal also has denied and revealed.
Buttons are real `<button>`s, keyboard reachable, with visible focus and disabled + "Working..." text while a call
runs. Labels on every input. Text contrast readable; layout works at 1280px wide (the demo screen) and does not break
at 375px.

## Verify before saying "done"

- `npm run build` (and `npm run lint` if present) passes from `app/`.
- Walk through on A's laptop (or with mocks if Tide sign-in is not available, and say so): researcher sees blurred
  only; request shows confirmation; reveal without the role shows the denied state; dig lead sees the seal form and
  sealing updates the badge; audit page lists the events.
- Report what you ran, what you saw, and what you could not check.

## Rules

- Small commits on `c/ui` with English messages; pull often; tell member A when a slice is ready to merge.
- Never commit `.env*`, adapter or secret JSON, `node_modules/`, `.next/`. Check `git status` before pushing.
- Ask before `git push`, and never push to `main` directly.
- If the contract seems wrong or missing something, ask member A to update `docs/contract.md` before coding around it.

# Demo script - Custodian Vault (2 minutes)

Target length **1:50 to 2:00**. Video: `.mp4`, under 100 MB, saved as `demo/demo.mp4`.
Structure required by the brief: **possibility -> constraint -> prototype -> what changes.**

> **Say it plainly:** the app is running in **simulation mode** because Tide's licence service failed during the
> hackathon. Do **not** say "TideCloak is enforcing this" at any point. Say "in simulation", and "with TideCloak
> live, no server could decrypt".

## Cast (all on A's laptop, one browser profile each)

| Person | Account | Role in the story |
|---|---|---|
| A | `diglead` | Dig lead - seals the site |
| A (second profile) | `researcher` | Researcher - asks for the exact location |
| C | `custodian` | Community custodian - steward 1 |
| B | `heritage` | Heritage authority - steward 2 |

If only one person films: use **one window** and switch accounts with the profile menu at the top of the page.
Every approval below is a button click on `/mock/approvals`.

## Before you hit record

1. Reset everything: `cd app && npm run demo:reset` (works while the app is running). Optional check: `npm run test:flow`
   runs the whole flow and ends with the demo reset again.
2. `cd app && npm run dev`, open http://localhost:3000. Check the red **SIMULATION MODE** banner is visible.
3. Use the site **Thornwick Hollow** (it starts unsealed). Fictional coordinates to type: **-31.4321, 141.9876**.
4. Close notifications; browser zoom 110%; hide bookmarks. Rehearse once, with a timer.
5. Do not record the Next.js "Issues" badge in the corner (dev-mode only): crop it out or use `npm run build && npm start`.

## Shot list and narration

| Time | On screen | Narration (read at a calm pace) |
|---|---|---|
| **0:00-0:15**<br>*possibility + constraint* | Home page, red banner visible, site cards | "Archaeological sites are easy to loot once someone knows where they are. So the exact location is the most valuable data, and the most dangerous to share. Today one administrator can read it, so one leak or one stolen password exposes every site." |
| **0:15-0:30**<br>*prototype: seal* | Sign in as **diglead**. Open Thornwick Hollow. Type -31.4321, 141.9876. Click **Encrypt and seal coordinates**. | "Custodian Vault removes that single point of authority. The dig lead enters the true coordinates, and they are encrypted in the browser. The server only ever stores ciphertext and a blurred position." |
| **0:30-0:50**<br>*denied* | Switch to **researcher**. Show "Approximate location ... within 50 km". Click **Reveal**: denied message. Type a reason, click **Request exact location**. | "A researcher sees only a fifty kilometre blur. Asking for the real position is denied, because that needs the decrypt role. So the researcher files a request with a reason." |
| **0:50-1:10**<br>*one steward is not enough* | Switch to **custodian**, open Simulated approvals. File: Grant `_tide_sitecoords.selfdecrypt` to `researcher`. Show **approvals 1/2**. Switch back to researcher, click **Reveal**: still denied. | "The community custodian agrees, but one steward is not enough. The change waits at one of two approvals, and the researcher is still locked out. No single administrator can open this alone." |
| **1:10-1:30**<br>*what changes* | Switch to **heritage**, click **Authorize**: status **COMMITTED**. Switch to researcher, click **Reveal**: **-31.4321, 141.9876** appears. | "When a second, independent steward, the heritage authority, approves, the role is granted. Now the researcher can decrypt, in their own browser. A decision by two of three parties, not trust in one." |
| **1:30-1:45**<br>*revoke* | Heritage files **Remove role**; **diglead** authorizes. Researcher clicks **Reveal**: denied again. | "Taking access back needs the same two of three. Once it is revoked, the researcher is locked out again." |
| **1:45-2:00**<br>*audit + honest close* | Open **Audit Log**: sealed, denied, requested, succeeded, denied. Scroll to the red banner. | "Every step is in the audit trail. To be open about it: Tide's licence service was down during the hackathon, so this demo runs in simulation. With TideCloak live, these approvals are enforced by Tide's quorum, and no server could decrypt at all." |

## Narration only (for a quick read-through, about 230 words, roughly 100 seconds of speech)

Archaeological sites are easy to loot once someone knows where they are. So the exact location is the most valuable
data, and the most dangerous to share. Today one administrator can read it, so one leak or one stolen password exposes
every site.

Custodian Vault removes that single point of authority. The dig lead enters the true coordinates, and they are
encrypted in the browser. The server only ever stores ciphertext and a blurred position.

A researcher sees only a fifty kilometre blur. Asking for the real position is denied, because that needs the decrypt
role. So the researcher files a request with a reason.

The community custodian agrees, but one steward is not enough. The change waits at one of two approvals, and the
researcher is still locked out. No single administrator can open this alone.

When a second, independent steward, the heritage authority, approves, the role is granted. Now the researcher can
decrypt, in their own browser. A decision by two of three parties, not trust in one.

Taking access back needs the same two of three. Once it is revoked, the researcher is locked out again.

Every step is in the audit trail. To be open about it: Tide's licence service was down during the hackathon, so this
demo runs in simulation. With TideCloak live, these approvals are enforced by Tide's quorum, and no server could
decrypt at all.

## If Tide's realm comes back before recording (live mode)

Keep the same story and shots. Change only: remove the "runs in simulation" sentence, say "approved in TideCloak's
QEA Approvals", and show tide-console -> QEA Approvals instead of `/mock/approvals`. Re-rehearse once: live approvals
go through the Tide enclave and take longer.

## Checklist before submitting

- [ ] Video is under 2:00 and under 100 MB, saved as `demo/demo.mp4`.
- [ ] The red SIMULATION banner is visible in at least the first and last shot.
- [ ] Nobody says "TideCloak enforces" while in simulation mode.
- [ ] README overview still matches what the video shows.
- [ ] Repository is public; Google Form submitted with the repository link.

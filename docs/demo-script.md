# Demo script - Custodian Vault (2 minutes)

**The team will not speak:** record the screen silently and add English subtitles afterwards. The short on-screen
captions are in `docs/subtitles/subtitles.draft.srt`; `docs/subtitles/antigravity-subtitle-instructions.md` tells an AI
agent how to time them to the recording and burn them in. The narration below is the long form of the same text.

Target length **1:50 to 2:00**. Video: `.mp4`, under 100 MB, saved as `demo/demo.mp4`.
Structure required by the brief: **possibility -> constraint -> prototype -> what changes.**

> **Say it plainly (Plan C):** Tide's network was overloaded, so no realm could be licensed. The organisers' Plan C
> says teams may simulate TideCloak and are judged exactly the same, as long as they **show where TideCloak fits and
> what it makes possible**. So: do **not** say "TideCloak is enforcing this". Say "in simulation", and close with the
> "Where TideCloak fits" table from the README.

## Cast (all on A's laptop, one browser profile each)

| Person | Account | Role in the story |
|---|---|---|
| A | `diglead` | Dig lead - seals the site |
| A (second profile) | `researcher` | Researcher - asks for the exact location |
| C | `custodian` | Community custodian - a steward |
| B | `heritage` | Heritage authority - a steward |

Record in **one browser window** and switch accounts with the **ACTING AS** menu in the top bar (Researcher, Dig lead,
Community custodian, Heritage authority). Every approval below happens on the **Simulated approvals** page (top nav).

## Before you hit record

1. Stop any dev server. Run the **production** build so no Next.js dev badge shows:
   `cd app && npm run build && npm start`, then open http://localhost:3000 (it is already running if you used the team's
   terminal tab "app production server").
2. Reset everything: `cd app && npm run demo:reset` (safe while the app runs). Optional: `npm run test:flow` runs the whole
   flow and ends with the demo reset. **Do not use the header's "Reset demo" button**: it only clears this browser's
   local storage, not the server data or the simulated approvals.
3. Sign out (or open the app in a fresh window) so you start on the sign-in screen "Who is at the desk?".
4. Use the site **Thornwick Hollow** (starts unsealed). Fictional coordinates to type: **-31.4321** and **141.9876**.
5. Browser zoom 110%, window about 1366x768 or 1920x1080, bookmarks hidden, notifications off. The red SIMULATION MODE
   banner must stay visible at the top of every shot. Rehearse once with a timer; the script fits in about 1:45.
6. Recording: Windows `Win+Alt+R` (Xbox Game Bar) or OBS. Record the **browser window only**, silent, 30 fps.

## Shot list and narration

| Time | On screen (exact clicks) | Narration (read at a calm pace) |
|---|---|---|
| **0:00-0:15**<br>*possibility + constraint* | Home page "Some places should stay lost." with the red banner and the three site cards. Slowly scroll once. | "Archaeological sites are easy to loot once someone knows where they are. So the exact location is the most valuable data, and the most dangerous to share. Today one administrator can read it, so one leak or one stolen password exposes every site." |
| **0:15-0:30**<br>*prototype: seal* | Click **Sign in**, then **Dig lead**. Open **Thornwick Hollow**. Under **Seal the true point** enter **Latitude** -31.4321 and **Longitude** 141.9876, click **Encrypt and seal coordinates**. The badge turns to sealed. | "Custodian Vault removes that single point of authority. The dig lead enters the true coordinates, and they are sealed: only ciphertext is stored, next to a blurred position." |
| **0:30-0:48**<br>*denied* | In **ACTING AS** pick **Researcher**. Show the map: "blurred to 50 km". Click **Reveal exact location**: **Still locked.** and "missing role _tide_sitecoords.selfdecrypt". Under **Ask the stewards** click an example reason (or type one) and **Request exact location**. | "A researcher sees only a fifty kilometre blur. Asking for the real position is denied, because that needs the decrypt role. So the researcher files a request with a reason." |
| **0:48-1:05**<br>*one steward is not enough* | **ACTING AS -> Community custodian**, top nav **Simulated approvals**. Leave Action *Grant role*, Role `_tide_sitecoords.selfdecrypt`, Person `researcher`, click **File change request**. Show **Waiting for seals (1)** and "**1 of 2 seals**. 1 more needed. No steward can act alone." Switch to **Researcher**, open the site, **Reveal exact location**: still locked. | "The community custodian agrees, but one steward is not enough. The change waits at one of two approvals, and the researcher is still locked out. No single administrator can open this alone." |
| **1:05-1:22**<br>*what changes* | **ACTING AS -> Heritage authority**, **Simulated approvals**, click **Authorize**. It moves to **Decided** as **COMMITTED**. Switch to **Researcher**, **Reveal exact location**: **Revealed.** **-31.4321, 141.9876**. | "When a second, independent steward, the heritage authority, approves, the role is granted. Now the researcher can decrypt. A decision by two of three parties, not trust in one." |
| **1:22-1:35**<br>*revoke* | As **Heritage authority** on **Simulated approvals**: set Action *Remove role* (Role `_tide_sitecoords.selfdecrypt`, Person `researcher`), **File change request**. **ACTING AS -> Dig lead**, **Authorize**. Switch to **Researcher**, **Reveal exact location**: locked again. | "Taking access back needs the same two of three. Once it is revoked, the researcher is locked out again." |
| **1:35-1:42**<br>*audit* | Top nav **Audit Log**: sealed, denied, requested, revealed, denied, newest first. | "Every step is in the audit trail." |
| **1:42-2:00**<br>*Plan C: where TideCloak fits* | Cut to the README (VS Code preview: `Ctrl+Shift+V` on `README.md`), section **Where TideCloak fits (Plan C)**. Slowly scroll the table: sign-in, roles, 2-of-3 approval, sealing, API identity. | "Tide's network was overloaded, so, as the organisers' Plan C allows, this runs in simulation. Here is where TideCloak plugs in: sign-in, roles, two-of-three approvals and encryption in the browser. With it live, nobody, not even the operator, holds a key." |

## Narration only (for a quick read-through, about 215 words, roughly 95 seconds of speech)

Archaeological sites are easy to loot once someone knows where they are. So the exact location is the most valuable
data, and the most dangerous to share. Today one administrator can read it, so one leak or one stolen password exposes
every site.

Custodian Vault removes that single point of authority. The dig lead enters the true coordinates, and they are
sealed: only ciphertext is stored, next to a blurred position.

A researcher sees only a fifty kilometre blur. Asking for the real position is denied, because that needs the decrypt
role. So the researcher files a request with a reason.

The community custodian agrees, but one steward is not enough. The change waits at one of two approvals, and the
researcher is still locked out.

When a second, independent steward, the heritage authority, approves, the role is granted and the researcher can
decrypt. A decision by two of three parties, not trust in one.

Taking access back needs the same two of three.

Every step is in the audit trail.

Tide's network was overloaded, so, as the organisers' Plan C allows, this runs in simulation. Here is where TideCloak
plugs in: sign-in, roles, two-of-three approvals and encryption in the browser. With it live, nobody, not even the
operator, holds a key.

## If Tide's realm comes back before recording (live mode)

Keep the same story and shots. Change only: replace the Plan C sentence with "approved in TideCloak's QEA Approvals",
and show tide-console -> QEA Approvals instead of `/mock/approvals`. Re-rehearse once: live approvals
go through the Tide enclave and take longer.

## Checklist before submitting

- [ ] Video is under 2:00 and under 100 MB, saved as `demo/demo.mp4`.
- [ ] The red SIMULATION MODE banner is visible in every app shot.
- [ ] The final shot shows the README table "Where TideCloak fits (Plan C)" for about 10 seconds.
- [ ] Nobody says "TideCloak enforces" while in simulation mode.
- [ ] README overview still matches what the video shows.
- [ ] Repository is public; Google Form submitted with the repository link.

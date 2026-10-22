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

If only one person films: use **one window** and switch accounts with the **Demo Profile (Mock)** menu in the bar at the
top of the page. Every approval below happens on the **Simulated Approvals** page (nav link at the top).

## Before you hit record

1. Reset everything: `cd app && npm run demo:reset` (works while the app is running). Optional check: `npm run test:flow`
   runs the whole flow and ends with the demo reset again. **Do not use the header's "Reset Demo Data" button**: it only
   clears this browser's local storage, not the server data or the simulated approvals.
2. `cd app && npm run dev`, open http://localhost:3000. Check the red **SIMULATION MODE** banner is visible.
3. Use the site **Thornwick Hollow** (it starts unsealed). Fictional coordinates to type: **-31.4321, 141.9876**.
4. Close notifications; browser zoom 110%; hide bookmarks. Rehearse once, with a timer.
5. Do not record the Next.js "Issues" badge in the corner (dev-mode only): crop it out or use `npm run build && npm start`.

## Shot list and narration

| Time | On screen | Narration (read at a calm pace) |
|---|---|---|
| **0:00-0:15**<br>*possibility + constraint* | Home page, red banner visible, site cards | "Archaeological sites are easy to loot once someone knows where they are. So the exact location is the most valuable data, and the most dangerous to share. Today one administrator can read it, so one leak or one stolen password exposes every site." |
| **0:15-0:30**<br>*prototype: seal* | On the sign-in screen (**Sign In (Mock)**) click the **Marcus Thorne • Dig Lead** card. Open **Thornwick Hollow**. Enter **Exact Latitude** -31.4321 and **Exact Longitude** 141.9876. Click **Encrypt & Seal Coordinates**: **Vault Sealed Successfully**. | "Custodian Vault removes that single point of authority. The dig lead enters the true coordinates, and they are sealed: only ciphertext is stored, next to a blurred position." |
| **0:30-0:48**<br>*denied* | In the **Demo Profile (Mock)** menu pick **researcher**. Show "Approximate location ... (within 50 km)". Click **Reveal Exact Location**: **Decryption Denied (TideCloak Simulation)**, "missing role _tide_sitecoords.selfdecrypt". Type a reason (or pick a *Quick Sample Justification*) and click **Request Exact Location**: **Access Request Registered**. | "A researcher sees only a fifty kilometre blur. Asking for the real position is denied, because that needs the decrypt role. So the researcher files a request with a reason." |
| **0:48-1:05**<br>*one steward is not enough* | Pick **custodian** in the menu, open **Simulated Approvals**. Under **File a Change Request** choose Action *Grant role*, Role `_tide_sitecoords.selfdecrypt`, Target User `researcher`, click **File Change Request**. **Pending Requests (1)** shows **Approvals 1/2**. Switch back to **researcher**, click **Reveal Exact Location**: still denied. | "The community custodian agrees, but one steward is not enough. The change waits at one of two approvals, and the researcher is still locked out. No single administrator can open this alone." |
| **1:05-1:22**<br>*what changes* | Pick **heritage**, open **Simulated Approvals**, click **Authorize** on the pending request: it moves to **Approval History** as **COMMITTED**. Switch to **researcher**, click **Reveal Exact Location**: the exact coordinates (-31.4321, 141.9876) appear under *High-Precision Archaeological GPS (WGS84)*. | "When a second, independent steward, the heritage authority, approves, the role is granted. Now the researcher can decrypt. A decision by two of three parties, not trust in one." |
| **1:22-1:35**<br>*revoke* | As **heritage** on **Simulated Approvals**: Action *Remove role*, Role `_tide_sitecoords.selfdecrypt`, Target User `researcher`, **File Change Request**. Switch to **diglead** and click **Authorize**. As **researcher**, **Reveal Exact Location**: denied again. | "Taking access back needs the same two of three. Once it is revoked, the researcher is locked out again." |
| **1:35-1:42**<br>*audit* | Open **Audit Trail** (top nav): sealed, denied, requested, succeeded, denied. | "Every step is in the audit trail." |
| **1:42-2:00**<br>*Plan C: where TideCloak fits* | Cut to the README, section **Where TideCloak fits (Plan C)**. Slowly scroll the table: sign-in, roles, 2-of-3 approval, sealing, API identity. Show the red banner once more. | "Tide's network was overloaded, so, as the organisers' Plan C allows, this runs in simulation. Here is where TideCloak plugs in: sign-in, roles, two-of-three approvals and encryption in the browser. With it live, nobody, not even the operator, holds a key." |

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
- [ ] The red SIMULATION banner is visible in at least the first and last shot.
- [ ] The final shot shows the README table "Where TideCloak fits (Plan C)" for about 10 seconds.
- [ ] Nobody says "TideCloak enforces" while in simulation mode.
- [ ] README overview still matches what the video shows.
- [ ] Repository is public; Google Form submitted with the repository link.

# Instructions for Antigravity: subtitles for the Custodian Vault demo video

You are helping a hackathon team finish a **silent** two-minute screen recording. Nobody speaks in the video, so
the subtitles **are** the narration. Your job: turn the draft cues into a correctly timed `.srt`, burn it into the
video, and check the result. Do **not** change any app code, do **not** run `git push` or `git commit`, and do not
contact any external service.

## Files

| File | What it is |
|---|---|
| `demo/raw.mp4` | The silent screen recording from the team (input). If it has another name, use that file. |
| `docs/subtitles/subtitles.draft.srt` | Draft cues: the right words, **approximate** timings. |
| `docs/subtitles/scene-times.txt` | Real start/end time of each scene in the recording. **The team fills this in** (template below). |
| `docs/subtitles/check_srt.py` | Checker for the subtitle rules. Run it on every `.srt` you produce. |
| `docs/demo-script.md` | The storyline and what each scene shows. Read it first. |
| **Outputs** | `demo/demo.srt` (final cues) and `demo/demo.mp4` (video with subtitles burned in). |

## Hard requirements (the competition brief)

- Final video: **`.mp4`, at most 2:00, under 100 MB** (GitHub's file limit), saved as `demo/demo.mp4`.
- English subtitles. They must be readable on a laptop screen and on a phone.
- The video must keep showing the red **SIMULATION MODE** banner. Never crop or cover it.

## Honesty rules for the text (important for the judges)

- The app runs in **simulation**, because Tide's licence service failed and the organisers' **Plan C** allows
  simulating TideCloak. Never write that "TideCloak enforces", "TideCloak encrypts" or "powered by TideCloak" for
  anything shown on screen. TideCloak may only appear as **"where TideCloak fits"** or **"with TideCloak live"**.
- Do not add claims that are not in the draft cues or in `docs/demo-script.md`. If a cue needs rewording to fit the
  time, keep its meaning.
- Keep the last three cues (Plan C, where TideCloak fits, "nobody holds a key") in the final video.

## Subtitle style

- Bottom centre, white text, semi-transparent black box behind it, sans-serif, about 5% of the video height.
- Keep a margin of at least 4% from the bottom edge. If a scene has buttons at the bottom (for example Authorize),
  raise the captions for that time range (`Alignment=2` with a larger `MarginV`, or `Alignment=8` for the top) so a
  caption never covers the control being clicked.
- At most **2 lines**, at most **44 characters per line**, at most **17 characters per second**, each cue on screen
  at least **1.2 s**, and no overlaps. `check_srt.py` enforces this.

## Steps

1. **Read** `docs/demo-script.md` and `docs/subtitles/subtitles.draft.srt`.
2. **Get the tools.** Check `ffmpeg -version`. If missing, install a full build (it must include libass and the
   `subtitles` filter): `winget install Gyan.FFmpeg`, then open a new terminal.
3. **Probe the video:** `ffprobe -v error -show_entries format=duration -of csv=p=0 demo/raw.mp4` and the size/fps/
   resolution. If it is longer than 2:00, **stop and tell the team**: they must cut the recording, because
   subtitles cannot fix a video that is too long.
4. **Read `docs/subtitles/scene-times.txt`.** If it still contains the template values (or is missing), **stop and
   ask the team** for the real scene times. Do not guess them.
5. **Retime the cues.** Each cue group belongs to a scene (table below). Inside a scene, place its cues evenly
   between the scene's real start and end, starting about 0.4 s after the scene starts and ending about 0.3 s before
   the scene ends. If a scene is too short for its cues at 17 characters per second, shorten the wording and tell the
   team what you changed.
6. **Write `demo/demo.srt`** and run `python docs/subtitles/check_srt.py demo/demo.srt <video_seconds>`. Fix
   every PROBLEM it prints. Repeat until it prints `OK`.
7. **Burn the subtitles in.** From the `demo/` folder (this avoids Windows drive-letter problems in the filter):

   ```powershell
   cd demo
   ffmpeg -y -i raw.mp4 -vf "subtitles=demo.srt:force_style='FontName=Arial,FontSize=22,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BackColour=&H80000000,BorderStyle=4,Outline=1,Shadow=0,Alignment=2,MarginV=36'" -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -movflags +faststart -an demo.mp4
   ```

   `FontSize` is relative to a 288-pixel-high reference in libass, so for 1080p video 22 is about 5% of the height;
   adjust if the text looks too big or small. Use `-an` only if the recording has no audio; otherwise keep the audio
   (`-c:a aac -b:a 128k`).
8. **Check the size.** If `demo.mp4` is 100 MB or more, raise `-crf` (24, 26) or scale down (`-vf "scale=-2:1080,subtitles=..."`)
   and redo. Aim for under 80 MB to leave margin.
9. **Verify visually.** Extract a frame at the middle of each scene
   (`ffmpeg -ss 00:00:20 -i demo.mp4 -frames:v 1 frame_20s.png`) and look at them: text readable, not cut off, not
   covering the red banner or the button being clicked, and the words match what the screen shows at that moment.
10. **Report** to the team: final duration, file size, the scene times you used, any cue you reworded, and anything
    they should re-record. Delete temporary frames. Leave `demo/demo.srt` and `demo/demo.mp4` in place.

## Scene-to-cue map (draft cue numbers)

| Scene | What the screen shows | Draft cues |
|---|---|---|
| 1. Problem | Home page, red banner, site cards | 1, 2, 3 |
| 2. Seal | `diglead` seals Thornwick Hollow | 4, 5 |
| 3. Denied | `researcher` sees the blur, Reveal denied, request filed | 6, 7 |
| 4. One steward | `custodian` files the grant, approvals 1/2, still denied | 8, 9 |
| 5. Second steward | `heritage` authorizes, coordinates appear | 10, 11 |
| 6. Revoke | 2-of-3 revocation, denied again | 12 |
| 7. Audit | Audit log | 13 |
| 8. Plan C | README table "Where TideCloak fits" | 14, 15, 16 |

## Template for `docs/subtitles/scene-times.txt` (the team fills this in)

Times are `mm:ss.s` in `raw.mp4`. Open the recording and write down where each scene really starts and ends.

```
1 problem          00:00.0  00:15.0
2 seal             00:15.0  00:30.0
3 denied           00:30.0  00:48.0
4 one-steward      00:48.0  01:05.0
5 second-steward   01:05.0  01:22.0
6 revoke           01:22.0  01:35.0
7 audit            01:35.0  01:42.0
8 plan-c           01:42.0  02:00.0
```

(These numbers are only the target plan from `docs/demo-script.md`; replace them with the real ones.)

## If something fails

- **`subtitles` filter not found / libass missing:** reinstall a *full* ffmpeg build, not an "essentials" build
  without libass. Do not switch to soft subtitles: GitHub's video preview does not show them, so judges would see
  none. Hard-burned subtitles are required.
- **Subtitles show boxes instead of letters:** set `FontName=Arial` (or another installed font) in `force_style`.
- **Output over 100 MB:** raise CRF, lower resolution, or ask the team to shorten the recording.
- **Anything unclear about a scene:** ask; do not invent.

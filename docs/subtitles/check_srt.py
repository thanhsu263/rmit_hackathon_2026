"""Checks an .srt file against the subtitle rules in antigravity-subtitle-instructions.md.
Usage:  python docs/subtitles/check_srt.py demo/demo.srt [video_duration_seconds]
Exit code 0 = no problems, 1 = at least one problem.
"""
import re
import sys

MAX_CHARS_PER_LINE = 44
MAX_LINES = 2
MAX_CPS = 17.0          # characters per second (reading speed, spaces included)
MIN_DURATION = 1.2      # seconds
MIN_GAP = 0.08          # seconds between cues
MAX_END = 120.0         # the brief: two-minute video


def to_sec(t: str) -> float:
    h, m, rest = t.split(":")
    s, ms = rest.split(",")
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000


def main() -> int:
    path = sys.argv[1]
    duration = float(sys.argv[2]) if len(sys.argv) > 2 else MAX_END
    raw = open(path, encoding="utf-8-sig").read().replace("\r\n", "\n").strip()
    problems, prev_end, n = [], 0.0, 0
    for block in re.split(r"\n\s*\n", raw):
        lines = block.split("\n")
        m = re.match(r"(\d+:\d\d:\d\d,\d{3}) --> (\d+:\d\d:\d\d,\d{3})", lines[1] if len(lines) > 1 else "")
        if not m:
            problems.append(f"cue {lines[0]!r}: bad timing line")
            continue
        n += 1
        start, end = to_sec(m.group(1)), to_sec(m.group(2))
        text = lines[2:]
        chars = len(" ".join(text))
        dur = end - start
        tag = f"cue {lines[0]} ({m.group(1)})"
        if end <= start:
            problems.append(f"{tag}: end is not after start")
        if dur < MIN_DURATION:
            problems.append(f"{tag}: only {dur:.1f}s on screen (min {MIN_DURATION}s)")
        if start - prev_end < MIN_GAP and prev_end:
            problems.append(f"{tag}: starts {start - prev_end:.2f}s after the previous cue (min gap {MIN_GAP}s, no overlap)")
        if len(text) > MAX_LINES:
            problems.append(f"{tag}: {len(text)} lines (max {MAX_LINES})")
        for t in text:
            if len(t) > MAX_CHARS_PER_LINE:
                problems.append(f"{tag}: line of {len(t)} chars (max {MAX_CHARS_PER_LINE}): {t!r}")
        if dur > 0 and chars / dur > MAX_CPS:
            problems.append(f"{tag}: {chars / dur:.1f} chars/s (max {MAX_CPS}), show it longer or shorten it")
        if end > duration + 0.01:
            problems.append(f"{tag}: ends at {end:.1f}s, after the video ({duration:.1f}s)")
        prev_end = end
    print(f"{n} cues checked, last cue ends at {prev_end:.1f}s")
    for p in problems:
        print("PROBLEM:", p)
    print("OK" if not problems else f"{len(problems)} problem(s)")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())

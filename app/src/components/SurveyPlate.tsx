import React from "react";

type SurveyPlateProps = {
  siteId: string;
  blurred?: { lat: number; lng: number } | null;
  /** "lat,lng" once decrypted; the exact point is drawn only when this is set. */
  exact?: string | null;
  compact?: boolean;
  caption?: string;
  /** Draw contours, circle and label in sequence on mount. */
  drawIn?: boolean;
  /** One-shot story beats, triggered by the parent on a state change. */
  beat?: "sealed" | "denied" | null;
  /** Changes on every beat so the same beat can replay. */
  beatKey?: number;
};

// Small deterministic PRNG so server and client draw the same contours.
function seeded(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

const W = 400;
const H = 300;
const CX = 200;
const CY = 150;
const R = 92; // the 50 km blur radius on the plate

function contours(siteId: string) {
  const rand = seeded(siteId);
  const hills = [0, 1].map(() => ({
    x: 70 + rand() * 260,
    y: 60 + rand() * 180,
    phase: [rand() * 6.28, rand() * 6.28, rand() * 6.28],
    amp: [0.1 + rand() * 0.08, 0.06 + rand() * 0.06, 0.03 + rand() * 0.04],
  }));
  const paths: { d: string; major: boolean }[] = [];
  hills.forEach((hill, hi) => {
    const rings = hi === 0 ? 9 : 6;
    for (let k = 1; k <= rings; k++) {
      const base = k * (hi === 0 ? 22 : 18);
      let d = "";
      for (let s = 0; s <= 72; s++) {
        const t = (s / 72) * Math.PI * 2;
        const wobble =
          1 +
          hill.amp[0] * Math.sin(2 * t + hill.phase[0]) +
          hill.amp[1] * Math.sin(3 * t + hill.phase[1] + k * 0.2) +
          hill.amp[2] * Math.sin(5 * t + hill.phase[2]);
        const x = hill.x + Math.cos(t) * base * wobble * 1.25;
        const y = hill.y + Math.sin(t) * base * wobble * 0.85;
        d += `${s === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      paths.push({ d: d + "Z", major: k % 4 === 0 });
    }
  });
  return paths;
}

function exactOffset(exact: string, blurred?: { lat: number; lng: number } | null) {
  const [lat, lng] = exact.split(",").map((v) => parseFloat(v.trim()));
  if (!blurred || Number.isNaN(lat) || Number.isNaN(lng)) return { x: CX + 18, y: CY - 12 };
  // 50 km is roughly 0.45 degrees; map the true offset from the blurred centre onto the plate.
  const dx = Math.max(-0.42, Math.min(0.42, lng - blurred.lng)) / 0.45;
  const dy = Math.max(-0.42, Math.min(0.42, lat - blurred.lat)) / 0.45;
  return { x: CX + dx * R, y: CY - dy * R };
}

export function SurveyPlate({ siteId, blurred, exact, compact, caption, drawIn, beat, beatKey = 0 }: SurveyPlateProps) {
  const paths = contours(siteId);
  const point = exact ? exactOffset(exact, blurred) : null;
  const label = exact
    ? `Survey plate: exact location marked at ${exact}`
    : "Survey plate: exact location hidden somewhere inside a 50 kilometre circle";

  return (
    <figure style={{ margin: 0 }}>
      <div key={beat === "denied" ? `shake-${beatKey}` : "plate"} className={beat === "denied" ? "plate-shake" : undefined}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={label}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          background: "#F7F2E7",
          borderRadius: compact ? "6px" : "8px",
          border: "1px solid var(--line)",
        }}
      >
        <defs>
          <pattern id={`grid-${siteId}`} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="#7A6C59" strokeOpacity="0.09" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill={`url(#grid-${siteId})`} />
        <g fill="none" stroke="#8A6E4B">
          {paths.map((p, i) => (
            <path
              key={i}
              d={p.d}
              pathLength={drawIn ? 1 : undefined}
              className={drawIn ? "plate-draw" : undefined}
              style={drawIn ? { animationDelay: `${(i % 9) * 45}ms` } : undefined}
              strokeOpacity={p.major ? 0.42 : 0.2}
              strokeWidth={p.major ? 1.1 : 0.8}
            />
          ))}
        </g>

        {/* The 50 km blur */}
        <g className={drawIn ? "plate-circle-in" : undefined}>
          <circle
            key={`blur-${beat ?? "none"}-${beatKey}`}
            className={[point ? "plate-blur-fade" : "", beat === "denied" ? "plate-flash-no" : "", beat === "sealed" ? "plate-pulse" : ""].join(" ").trim() || undefined}
            cx={CX}
            cy={CY}
            r={R}
            fill="#B4532A"
            fillOpacity={0.09}
            stroke="#B4532A"
            strokeWidth="1.3"
            strokeDasharray="5 5"
          />
        </g>
        {beat === "sealed" && !point && (
          <circle key={`seal-${beatKey}`} className="plate-dissolve" cx={CX + 14} cy={CY - 10} r="6" fill="#B4532A" />
        )}
        {!point && (
          <g className={drawIn ? "plate-label-in" : undefined}>
            <text x={CX} y={CY - 4} textAnchor="middle" fontFamily="var(--font-serif)" fontStyle="italic" fontSize={compact ? 20 : 17} fill="#7A3A1E">
              somewhere in here
            </text>
            {!compact && (
              <text x={CX} y={CY + 18} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10.5" fill="#7A6C59">
                ± 50 km
              </text>
            )}
          </g>
        )}

        {point && (
          <g>
            <circle
              className="plate-contract"
              cx={point.x}
              cy={point.y}
              r={R}
              fill="none"
              stroke="#B4532A"
              strokeWidth="1.6"
              strokeDasharray="5 5"
              style={{ "--dx": `${CX - point.x}px`, "--dy": `${CY - point.y}px` } as React.CSSProperties}
            />
            <circle className="plate-ripple plate-ripple-late" cx={point.x} cy={point.y} r="3" fill="none" stroke="#B4532A" strokeWidth="1.5" style={{ opacity: 0 }} />
            <line className="plate-cross" pathLength={1} x1={point.x - 14} y1={point.y} x2={point.x + 14} y2={point.y} stroke="#1F1B16" strokeWidth="1" />
            <line className="plate-cross" pathLength={1} x1={point.x} y1={point.y - 14} x2={point.x} y2={point.y + 14} stroke="#1F1B16" strokeWidth="1" />
            <circle className="plate-dot plate-dot-late" cx={point.x} cy={point.y} r="6" fill="#B4532A" stroke="#FBF8F1" strokeWidth="2" />
          </g>
        )}

        {/* North arrow and scale bar */}
        <g transform="translate(366 30)" fill="#5C5245">
          <path d="M0 -14 L5 4 L0 0 L-5 4Z" />
          <text y="18" textAnchor="middle" fontSize="10" fontFamily="var(--font-sans)">N</text>
        </g>
        {!compact && (
          <g transform="translate(22 276)" fontFamily="var(--font-mono)" fontSize="9.5" fill="#5C5245">
            <rect width="46" height="4" fill="#1F1B16" />
            <rect x="46" width="46" height="4" fill="none" stroke="#1F1B16" strokeWidth="0.8" />
            <text x="0" y="-5">0</text>
            <text x="92" y="-5" textAnchor="end">25 km</text>
          </g>
        )}
      </svg>
      </div>
      {caption && (
        <figcaption style={{ marginTop: "10px", fontSize: "0.8rem", color: "var(--ink-3)" }}>{caption}</figcaption>
      )}
    </figure>
  );
}

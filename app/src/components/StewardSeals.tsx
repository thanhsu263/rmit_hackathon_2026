import React from "react";

const STEWARDS: Record<string, { title: string; mark: string }> = {
  diglead: { title: "Dig lead", mark: "DL" },
  heritage: { title: "Heritage authority", mark: "HA" },
  custodian: { title: "Community custodian", mark: "CC" },
};

type StewardSealsProps = {
  admins: string[];
  approvals: string[];
  denials?: string[];
  quorum: number;
};

/** One wax-style seal per steward: filled when they approved, dashed while waiting. */
export function StewardSeals({ admins, approvals, denials = [], quorum }: StewardSealsProps) {
  const count = approvals.length;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: "14px" }}>
        {admins.map((name) => {
          const s = STEWARDS[name] ?? { title: name, mark: name.slice(0, 2).toUpperCase() };
          const approved = approvals.includes(name);
          const denied = denials.includes(name);
          const color = denied ? "var(--no)" : "var(--accent)";
          return (
            <div key={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", width: "84px" }}>
              <svg
                width="64"
                height="64"
                overflow="visible"
                viewBox="0 0 54 54"
                className={approved || denied ? "seal-stamped" : undefined}
                style={{ transform: approved || denied ? "rotate(-6deg)" : undefined }}
                role="img"
                aria-label={`${s.title}: ${approved ? "approved" : denied ? "denied" : "not yet signed"}`}
              >
                {approved || denied ? (
                  <>
                    <circle className="seal-ink" cx="27" cy="27" r="24" fill="none" stroke={color} strokeWidth="3" />
                    <path
                      d="M27 2 C33 4 37 2 41 6 C46 9 49 12 50 18 C53 23 52 29 51 34 C50 40 46 44 41 48 C36 51 31 52 25 52 C19 51 13 49 9 44 C4 40 2 34 2 28 C2 21 4 15 9 10 C14 5 20 2 27 2Z"
                      fill={color}
                    />
                    <circle cx="27" cy="27" r="18" fill="none" stroke="#FBF8F1" strokeOpacity="0.55" strokeWidth="1" />
                    <text x="27" y="31.5" textAnchor="middle" fontFamily="var(--font-serif)" fontSize="13" fontWeight="600" fill="#FFF6EE">
                      {denied ? "✕" : s.mark}
                    </text>
                  </>
                ) : (
                  <>
                    <circle cx="27" cy="27" r="24" fill="none" stroke="var(--ink-3)" strokeWidth="1.2" strokeDasharray="3 3" />
                    <text x="27" y="31.5" textAnchor="middle" fontFamily="var(--font-serif)" fontSize="13" fill="var(--ink-3)">
                      {s.mark}
                    </text>
                  </>
                )}
              </svg>
              <span style={{ fontSize: "0.72rem", color: approved ? "var(--ink)" : "var(--ink-3)", textAlign: "center", lineHeight: 1.25 }}>
                {s.title}
              </span>
            </div>
          );
        })}
      </div>
      <div>
        <div className="state-word" style={{ fontSize: "1.7rem" }}>
          <span key={count} className="count-roll">{count}</span> of {quorum} seals
        </div>
        <div style={{ fontSize: "0.82rem", color: "var(--ink-3)" }}>
          {count >= quorum ? "Quorum reached." : `${quorum - count} more needed. No steward can act alone.`}
        </div>
      </div>
    </div>
  );
}

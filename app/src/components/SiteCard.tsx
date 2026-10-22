"use client";

import React from "react";
import Link from "next/link";
import { Site } from "./types";
import { StatusBadge } from "./StatusBadge";

interface SiteCardProps {
  site: Site;
}

export function SiteCard({ site }: SiteCardProps) {
  const isSealed = Boolean(site.sealedExact);

  return (
    <article
      className="vault-card site-card"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "26px",
      }}
    >
      {/* Top Era & Sealed Status Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <span
          style={{
            fontSize: "0.74rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontWeight: 500,
            color: "var(--ink-3)",
          }}
        >
          {site.era}
        </span>
        <StatusBadge status={isSealed ? "sealed" : "unsealed"} />
      </div>

      {/* Site Name - Inter font, weight 600 */}
      <h3
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "1.25rem",
          fontWeight: 600,
          color: "var(--ink)",
          marginBottom: "10px",
          lineHeight: 1.25,
          letterSpacing: "-0.015em",
        }}
      >
        {site.name}
      </h3>

      {/* Summary */}
      <p
        style={{
          color: "var(--ink-2)",
          fontSize: "0.92rem",
          fontWeight: 400,
          lineHeight: 1.55,
          marginBottom: "24px",
          flexGrow: 1,
        }}
      >
        {site.summary}
      </p>

      {/* Approximate Location Notice with 50km Blur Radar Signature */}
      <div
        style={{
          borderTop: "1px solid var(--line)",
          paddingTop: "16px",
          marginTop: "auto",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <span
            style={{
              fontSize: "0.72rem",
              color: "var(--ink-3)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            50 km Blur Zone
          </span>

          <span
            style={{
              fontSize: "0.72rem",
              fontFamily: "var(--font-mono)",
              color: isSealed ? "var(--ok)" : "var(--ink-3)",
            }}
          >
            {isSealed ? "E2EE Sealed" : "Unsealed Draft"}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {/* Nét ký riêng: Vòng tròn mờ 50 km SVG nét đứt */}
          <div
            style={{
              width: "42px",
              height: "42px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
              <circle
                cx="21"
                cy="21"
                r="18"
                stroke="var(--ink-3)"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity="0.8"
              />
              <circle
                cx="21"
                cy="21"
                r="9"
                stroke="var(--ink-3)"
                strokeWidth="0.8"
                opacity="0.3"
              />
              {/* Toạ độ thật chưa mở khoá: điểm tâm mờ */}
              <circle
                cx="21"
                cy="21"
                r="2"
                fill="var(--ink-3)"
                opacity="0.5"
              />
            </svg>
          </div>

          {/* Mandatory contract copy: Approximate location: {lat}, {lng} (within 50 km) */}
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.82rem",
              color: "var(--ink)",
              lineHeight: 1.45,
            }}
          >
            Approximate location: {site.blurred.lat.toFixed(1)}, {site.blurred.lng.toFixed(1)} (within {site.blurred.radiusKm} km)
          </div>
        </div>
      </div>

      {/* Card Action Link */}
      <Link
        href={`/sites/${site.id}`}
        className="btn btn-secondary"
        style={{
          width: "100%",
          justifyContent: "space-between",
          padding: "9px 14px",
        }}
      >
        <span>Inspect Site Vault</span>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </Link>
    </article>
  );
}

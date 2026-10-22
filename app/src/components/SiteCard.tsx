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
      className="vault-card"
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
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            fontWeight: 700,
            color: "var(--gold-primary)",
            background: "var(--gold-bg)",
            border: "1px solid var(--gold-border)",
            padding: "3px 10px",
            borderRadius: "var(--radius-xs)",
          }}
        >
          {site.era}
        </span>
        <StatusBadge status={isSealed ? "sealed" : "unsealed"} />
      </div>

      {/* Site Name */}
      <h3
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.35rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: "10px",
          lineHeight: 1.3,
          letterSpacing: "0.01em",
        }}
      >
        {site.name}
      </h3>

      {/* Summary */}
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.92rem",
          lineHeight: 1.6,
          marginBottom: "20px",
          flexGrow: 1,
        }}
      >
        {site.summary}
      </p>

      {/* Approximate Location Notice with 50km Blur Radar Simulation */}
      <div
        style={{
          background: "#080B12",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "var(--radius-md)",
          padding: "14px 16px",
          marginBottom: "20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.74rem",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 700,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
            Location Protection (50 km Blur Zone)
          </div>

          <span
            style={{
              fontSize: "0.7rem",
              fontFamily: "var(--font-mono)",
              color: isSealed ? "var(--emerald-light)" : "var(--gold-primary)",
              fontWeight: 600,
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
          {/* Visual Mini Radar Graphic */}
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: "rgba(245, 158, 11, 0.05)",
              border: "1px solid var(--gold-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            {/* Concentric circle */}
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                border: "1px dashed rgba(245, 158, 11, 0.4)",
              }}
            />
            {/* Center dot */}
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--gold-primary)",
                position: "absolute",
              }}
            />
          </div>

          {/* Mandatory contract copy: Approximate location: {lat}, {lng} (within 50 km) */}
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              color: "var(--text-primary)",
              fontWeight: 600,
              lineHeight: 1.4,
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
          padding: "11px 16px",
        }}
      >
        <span style={{ fontWeight: 600 }}>Inspect Site Vault</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{ transition: "transform 0.15s ease" }}
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </Link>
    </article>
  );
}

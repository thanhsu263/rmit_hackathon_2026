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
    <article className="vault-card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header with Era and Sealed status badge */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "14px",
        }}
      >
        <span
          style={{
            fontSize: "0.78rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontWeight: 700,
            color: "var(--amber-primary)",
            background: "var(--amber-bg)",
            border: "1px solid var(--amber-border)",
            padding: "3px 8px",
            borderRadius: "4px",
          }}
        >
          {site.era}
        </span>
        <StatusBadge status={isSealed ? "sealed" : "unsealed"} />
      </div>

      {/* Site Name & Summary */}
      <h3
        style={{
          fontSize: "1.25rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: "10px",
          lineHeight: 1.3,
        }}
      >
        {site.name}
      </h3>

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

      {/* Approximate Location Notice (Never show exact here!) */}
      <div
        style={{
          background: "#06090F",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "12px 14px",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.76rem",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "4px",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
          </svg>
          Location Protection (E2EE Blur)
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.88rem",
            color: "var(--text-primary)",
            fontWeight: 500,
          }}
        >
          Approximate location: {site.blurred.lat.toFixed(1)}, {site.blurred.lng.toFixed(1)} (within {site.blurred.radiusKm} km)
        </div>
      </div>

      {/* Card Action Link */}
      <Link
        href={`/sites/${site.id}`}
        className="btn btn-secondary"
        style={{ width: "100%", justifyContent: "space-between" }}
      >
        <span>Inspect Site Vault</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </Link>
    </article>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { Site } from "./types";
import { StatusBadge } from "./StatusBadge";
import { SurveyPlate } from "./SurveyPlate";
import { SITE_PHOTOS } from "./siteImages";

interface SiteCardProps {
  site: Site;
  index?: number;
}

export function SiteCard({ site, index = 0 }: SiteCardProps) {
  const isSealed = Boolean(site.sealedExact);
  const photo = SITE_PHOTOS[site.id];

  return (
    <Link href={`/sites/${site.id}`} style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }} aria-label={`Open ${site.name}`}>
      <article
        className="vault-card site-plate rise-in"
        style={{ display: "flex", flexDirection: "column", height: "100%", padding: "14px", animationDelay: `${index * 80}ms` }}
      >
        <div style={{ position: "relative", borderRadius: "6px", overflow: "hidden" }}>
          {photo ? (
            <div style={{ position: "relative", aspectRatio: "4 / 3" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.src} alt="" className="paper-photo" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <svg viewBox="0 0 400 300" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                <circle cx="200" cy="150" r="92" fill="#F2ECE0" fillOpacity="0.16" stroke="#FBF8F1" strokeWidth="1.6" strokeDasharray="6 6" />
              </svg>
            </div>
          ) : (
            <SurveyPlate siteId={site.id} blurred={site.blurred} compact />
          )}
          <div style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(251, 248, 241, 0.92)", borderRadius: "4px", padding: "2px 2px" }}>
            <StatusBadge status={isSealed ? "sealed" : "unsealed"} />
          </div>
        </div>

        <div style={{ padding: "18px 10px 8px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <span className="eyebrow">{site.era}</span>
          <h3 style={{ fontSize: "1.55rem", margin: "6px 0 8px" }}>{site.name}</h3>
          <p
            style={{
              color: "var(--ink-2)",
              fontSize: "0.92rem",
              lineHeight: 1.55,
              marginBottom: "18px",
              flexGrow: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {site.summary}
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", borderTop: "1px solid var(--line)", paddingTop: "12px" }}>
            <span className="mono" style={{ fontSize: "0.8rem", color: "var(--ink-2)" }}>
              Approximate location: {site.blurred.lat.toFixed(1)}, {site.blurred.lng.toFixed(1)} (within {site.blurred.radiusKm} km)
            </span>
            <span aria-hidden="true" style={{ color: "var(--accent-ink)", fontSize: "1.1rem" }}>→</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

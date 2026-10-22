"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Site, AuditEvent } from "../../../components/types";
import { getSiteById, getAuditEvents } from "../../../components/api";
import { useTideCloak } from "../../../components/tidecloak";
import { StatusBadge } from "../../../components/StatusBadge";
import { LoadingSpinner, ErrorRetryView } from "../../../components/StateViews";
import { RevealCoordinates } from "../../../components/RevealCoordinates";
import { RequestAccessSection } from "../../../components/RequestAccessSection";
import { SealSiteSection } from "../../../components/SealSiteSection";
import { AUTH_MODE } from "../../../lib/auth/config";
import { SITE_PHOTOS } from "../../../components/siteImages";

function formatDateTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      timeZone: "UTC",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }) + " UTC";
  } catch {
    return iso;
  }
}

function SiteDetailContent() {
  const params = useParams();
  const siteId = params?.id as string;

  const { token, authenticated, login } = useTideCloak();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [site, setSite] = useState<Site | null>(null);
  const [siteAuditEvents, setSiteAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadSiteData = useCallback(async () => {
    if (!siteId || !authenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [siteData, allAudit] = await Promise.all([
        getSiteById(siteId, token),
        getAuditEvents(token),
      ]);

      if (!siteData) {
        setError(`Archaeological site "${siteId}" not found in vault registry.`);
      } else {
        setSite(siteData);
        setSiteAuditEvents(allAudit.filter((ev) => ev.siteId === siteId));
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load site details.");
    } finally {
      setLoading(false);
    }
  }, [siteId, authenticated, token]);

  useEffect(() => {
    loadSiteData();
  }, [loadSiteData]);

  const handleAuditLogged = async () => {
    try {
      const allAudit = await getAuditEvents(token);
      setSiteAuditEvents(allAudit.filter((ev) => ev.siteId === siteId));
    } catch {
      // Ignore background refresh errors
    }
  };

  const handleSiteSealed = (updatedSite: Site) => {
    setSite(updatedSite);
    handleAuditLogged();
  };

  if (!mounted) {
    return (
      <div className="container" style={{ padding: "60px 0" }}>
        <LoadingSpinner message={`Unfolding the survey plate…`} />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="container" style={{ padding: "60px 0" }}>
        <div className="vault-card" style={{ textAlign: "center", padding: "50px 24px" }}>
          <h2 style={{ marginBottom: "10px" }}>Sign in to open this plate</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
            Every view of a site is recorded, so the archive needs to know who is looking.
          </p>
          <button type="button" onClick={login} className="btn btn-primary">
            {AUTH_MODE === "mock" ? "Sign in (simulated)" : "Sign in with TideCloak"}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: "60px 0" }}>
        <LoadingSpinner message={`Unfolding the survey plate…`} />
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="container">
        <Link href="/" className="btn btn-secondary btn-sm" style={{ marginBottom: "20px" }}>
          ← All sites
        </Link>
        <ErrorRetryView message={error || "Site not found."} onRetry={loadSiteData} />
      </div>
    );
  }

  const isSealed = Boolean(site.sealedExact);
  const photo = SITE_PHOTOS[site.id];

  return (
    <div className="container rise-in">
      <nav aria-label="Breadcrumb" style={{ marginBottom: "28px" }}>
        <Link href="/" style={{ color: "var(--ink-2)", textDecoration: "none", fontSize: "0.9rem" }}>
          ← All sites
        </Link>
      </nav>

      <header style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "24px", flexWrap: "wrap", marginBottom: "32px" }}>
        <div style={{ maxWidth: "720px" }}>
          <span className="eyebrow">{site.era}</span>
          <h1 style={{ margin: "10px 0 14px" }}>{site.name}</h1>
          <p style={{ color: "var(--ink-2)", fontSize: "1.05rem", lineHeight: 1.6 }}>{site.summary}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
          {photo && (
            <figure
              style={{
                margin: 0,
                width: "260px",
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: "4px",
                padding: "8px 8px 10px",
                transform: "rotate(2deg)",
                boxShadow: "0 22px 36px -22px rgba(60,40,20,0.4)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.src} alt="" className="paper-photo" style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", display: "block", borderRadius: "2px" }} />
              <figcaption style={{ fontSize: "0.7rem", color: "var(--ink-3)", marginTop: "6px" }}>
                Illustrative photo · <a href={photo.href} target="_blank" rel="noreferrer" style={{ color: "var(--ink-3)" }}>{photo.credit}</a>
              </figcaption>
            </figure>
          )}
          <StatusBadge status={isSealed ? "sealed" : "unsealed"} />
          {isSealed && (
            <span style={{ fontSize: "0.8rem", color: "var(--ink-3)" }} suppressHydrationWarning>
              by {site.sealedBy} · {site.sealedAt ? formatDateTime(site.sealedAt) : ""}
            </span>
          )}
        </div>
      </header>

      <RevealCoordinates site={site} onAuditLogged={handleAuditLogged} />

      <SealSiteSection site={site} onSiteSealed={handleSiteSealed} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px", marginTop: "24px" }}>
        <RequestAccessSection site={site} onRequestCreated={handleAuditLogged} />

        <section className="vault-card">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "14px", gap: "12px" }}>
            <h3>What happened here</h3>
            <span style={{ fontSize: "0.8rem", color: "var(--ink-3)" }}>{siteAuditEvents.length} entries</span>
          </div>

          {siteAuditEvents.length === 0 ? (
            <p style={{ color: "var(--ink-3)", fontSize: "0.9rem" }}>Nothing recorded yet.</p>
          ) : (
            <ol style={{ listStyle: "none", display: "flex", flexDirection: "column" }}>
              {siteAuditEvents.map((ev, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderTop: i > 0 ? "1px solid var(--line)" : "none",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <StatusBadge status={ev.action} size="sm" />
                    <span style={{ color: "var(--ink)", fontSize: "0.88rem" }}>{ev.actor}</span>
                  </div>
                  <span className="mono" style={{ fontSize: "0.76rem", color: "var(--ink-3)" }} suppressHydrationWarning>
                    {formatDateTime(ev.at)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}

export default function SiteDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ padding: "60px 0" }}>
          <LoadingSpinner message="Unfolding the survey plate…" />
        </div>
      }
    >
      <SiteDetailContent />
    </Suspense>
  );
}

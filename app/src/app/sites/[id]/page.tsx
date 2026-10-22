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

function SiteDetailContent() {
  const params = useParams();
  const siteId = params?.id as string;

  const { token, authenticated, login } = useTideCloak();

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

  if (!authenticated) {
    return (
      <div className="container" style={{ padding: "60px 0" }}>
        <div className="vault-card" style={{ textAlign: "center", padding: "50px 24px" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", marginBottom: "10px" }}>Authentication Required</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
            You must be signed into Custodian Vault to inspect classified archaeological dossiers.
          </p>
          <button type="button" onClick={login} className="btn btn-primary">
            Sign In with TideCloak
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: "60px 0" }}>
        <LoadingSpinner message={`Opening encrypted vault dossier for ${siteId}...`} />
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="container">
        <Link href="/" className="btn btn-secondary btn-sm" style={{ marginBottom: "20px" }}>
          ← Back to Sites
        </Link>
        <ErrorRetryView message={error || "Site not found."} onRetry={loadSiteData} />
      </div>
    );
  }

  const isSealed = Boolean(site.sealedExact);

  return (
    <div className="container">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link
          href="/"
          className="btn btn-secondary btn-sm"
          style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Vault Registry
        </Link>

        <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          CLASSIFIED // HERITAGE PROTECTION PROTOCOL
        </span>
      </nav>

      {/* Main Dossier Header Card */}
      <div className="vault-card" style={{ marginBottom: "24px", padding: "30px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "18px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: "0.76rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 700,
                  color: "var(--gold-primary)",
                  background: "var(--gold-bg)",
                  border: "1px solid var(--gold-border)",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-xs)",
                }}
              >
                {site.era}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                VAULT ID: {site.id}
              </span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "2.4rem",
                fontWeight: 700,
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
                color: "var(--text-primary)",
              }}
            >
              {site.name}
            </h1>
          </div>

          <StatusBadge status={isSealed ? "sealed" : "unsealed"} />
        </div>

        <p style={{ color: "var(--text-secondary)", fontSize: "1.02rem", lineHeight: 1.7, marginBottom: "26px", maxWidth: "880px" }}>
          {site.summary}
        </p>

        {/* Generalized Location & Seal Metadata Box */}
        <div
          style={{
            background: "#080B13",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "var(--radius-md)",
            padding: "20px 24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
              <span style={{ fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", fontWeight: 700 }}>
                Generalized Public Coordinates (50 km Blur Radius)
              </span>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.05rem", color: "var(--text-primary)", fontWeight: 600 }}>
              Approximate location: {site.blurred.lat.toFixed(1)}, {site.blurred.lng.toFixed(1)} (within {site.blurred.radiusKm} km)
            </div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-primary)" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span style={{ fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", fontWeight: 700 }}>
                Cryptographic Seal State
              </span>
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              {isSealed ? (
                <>
                  Sealed by <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{site.sealedBy}</strong> on{" "}
                  {site.sealedAt ? new Date(site.sealedAt).toLocaleString() : "Confirmed"}
                </>
              ) : (
                <span style={{ color: "var(--gold-primary)", fontWeight: 600 }}>
                  Awaiting field sealing by Dig Lead
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Reveal and Request Access */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
        {/* Section 1: Reveal exact location (browser decrypt) */}
        <RevealCoordinates site={site} onAuditLogged={handleAuditLogged} />

        {/* Section 2: Request access */}
        <RequestAccessSection site={site} onRequestCreated={handleAuditLogged} />
      </div>

      {/* Section 3: Dig Lead Seal Control (Visible ONLY if hasRealmRole '_tide_sitecoords.selfencrypt') */}
      <SealSiteSection site={site} onSiteSealed={handleSiteSealed} />

      {/* Section 4: Site-Specific Immutable Audit Trail */}
      <section className="vault-card" style={{ marginTop: "24px", padding: "26px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "var(--radius-sm)",
                background: "var(--gold-bg)",
                color: "var(--gold-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Cryptographic Governance &amp; Security Trail
              </h3>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                Immutable event stream for {site.name}
              </span>
            </div>
          </div>

          <span className="badge" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
            {siteAuditEvents.length} events logged
          </span>
        </div>

        {siteAuditEvents.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontStyle: "italic", padding: "16px 0" }}>
            No cryptographic events recorded yet for this site.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {siteAuditEvents.map((ev, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "rgba(255, 255, 255, 0.02)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "0.88rem",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <StatusBadge status={ev.action} size="sm" />
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)", fontSize: "0.84rem" }}>
                    actor: <strong style={{ color: "var(--text-primary)" }}>{ev.actor}</strong>
                  </span>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  {new Date(ev.at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function SiteDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ padding: "60px 0" }}>
          <LoadingSpinner message="Opening archaeological vault dossier..." />
        </div>
      }
    >
      <SiteDetailContent />
    </Suspense>
  );
}

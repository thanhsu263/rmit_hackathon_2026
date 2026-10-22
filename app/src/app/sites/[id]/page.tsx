"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Site, AuditEvent } from "../../../components/types";
import { getSiteById, getAuditEvents } from "../../../components/api";
import { useTideCloak } from "../../../components/tidecloak";
import { StatusBadge } from "../../../components/StatusBadge";
import { LoadingSpinner, ErrorRetryView, EmptyStateView } from "../../../components/StateViews";
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
      <div className="container">
        <EmptyStateView
          title="Authentication Required"
          description="You must be signed in with a TideCloak account to inspect archaeological site vaults."
          action={
            <button type="button" onClick={login} className="btn btn-primary">
              Sign In to Custodian Vault
            </button>
          }
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <LoadingSpinner message={`Loading vault dossier for ${siteId}...`} />
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
      <nav aria-label="Breadcrumb" style={{ marginBottom: "24px" }}>
        <Link
          href="/"
          className="btn btn-secondary btn-sm"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Sites
        </Link>
      </nav>

      {/* Main Dossier Header */}
      <div className="vault-card" style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
            marginBottom: "16px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span
                style={{
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 700,
                  color: "var(--amber-primary)",
                  background: "var(--amber-bg)",
                  border: "1px solid var(--amber-border)",
                  padding: "3px 10px",
                  borderRadius: "4px",
                }}
              >
                {site.era}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                ID: {site.id}
              </span>
            </div>
            <h1 style={{ fontSize: "2.1rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              {site.name}
            </h1>
          </div>

          <StatusBadge status={isSealed ? "sealed" : "unsealed"} />
        </div>

        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.7, marginBottom: "24px" }}>
          {site.summary}
        </p>

        {/* Public Approximate Coordinates Card */}
        <div
          style={{
            background: "#060910",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "16px 20px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          <div>
            <span style={{ fontSize: "0.76rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
              Public Generalized Location (50 km Blur Radius)
            </span>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", color: "var(--text-primary)", fontWeight: 600 }}>
              Approximate location: {site.blurred.lat.toFixed(1)}, {site.blurred.lng.toFixed(1)} (within {site.blurred.radiusKm} km)
            </div>
          </div>

          <div>
            <span style={{ fontSize: "0.76rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
              Cryptographic Seal Metadata
            </span>
            <div style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
              {isSealed ? (
                <>
                  Sealed by <strong style={{ color: "var(--text-primary)" }}>{site.sealedBy}</strong> on{" "}
                  {site.sealedAt ? new Date(site.sealedAt).toLocaleString() : "Confirmed"}
                </>
              ) : (
                <span style={{ color: "var(--amber-primary)" }}>
                  Awaiting initial field sealing by dig lead
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Reveal and Request Access */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
        {/* Section 1: Reveal exact location (browser decrypt) */}
        <div>
          <RevealCoordinates site={site} onAuditLogged={handleAuditLogged} />
        </div>

        {/* Section 2: Request access */}
        <div>
          <RequestAccessSection site={site} onRequestCreated={handleAuditLogged} />
        </div>
      </div>

      {/* Section 3: Dig Lead Seal Control (Visible ONLY if hasRealmRole '_tide_sitecoords.selfencrypt') */}
      <SealSiteSection site={site} onSiteSealed={handleSiteSealed} />

      {/* Section 4: Site-Specific Immutable Audit Trail */}
      <section className="vault-card" style={{ marginTop: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--amber-primary)" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Vault Access & Security Trail
            </h3>
          </div>
          <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
            {siteAuditEvents.length} events logged
          </span>
        </div>

        {siteAuditEvents.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", fontStyle: "italic" }}>
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
                  padding: "10px 14px",
                  background: "rgba(255, 255, 255, 0.02)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "0.85rem",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <StatusBadge status={ev.action} />
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
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
        <div className="container" style={{ padding: "40px 0" }}>
          <LoadingSpinner message="Loading site vault dossier..." />
        </div>
      }
    >
      <SiteDetailContent />
    </Suspense>
  );
}

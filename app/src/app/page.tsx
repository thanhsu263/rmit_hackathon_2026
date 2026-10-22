"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Site } from "../components/types";
import { getSites } from "../components/api";
import { useTideCloak } from "../components/tidecloak";
import { SiteCard } from "../components/SiteCard";
import { LoadingSpinner, ErrorRetryView, EmptyStateView } from "../components/StateViews";
import { AUTH_MODE } from "../lib/auth/config";

export default function SitesPage() {
  const { token, authenticated, login } = useTideCloak();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sealFilter, setSealFilter] = useState<"ALL" | "SEALED" | "UNSEALED">("ALL");

  const loadSites = useCallback(async () => {
    if (!authenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getSites(token);
      setSites(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load archaeological sites.");
    } finally {
      setLoading(false);
    }
  }, [authenticated, token]);

  useEffect(() => {
    loadSites();
  }, [loadSites]);

  // Filter sites
  const filteredSites = sites.filter((site) => {
    const isSealed = Boolean(site.sealedExact);
    if (sealFilter === "SEALED" && !isSealed) return false;
    if (sealFilter === "UNSEALED" && isSealed) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = site.name.toLowerCase().includes(q);
      const matchEra = site.era.toLowerCase().includes(q);
      const matchSummary = site.summary.toLowerCase().includes(q);
      return matchName || matchEra || matchSummary;
    }
    return true;
  });

  const totalSites = sites.length;
  const sealedCount = sites.filter((s) => Boolean(s.sealedExact)).length;

  return (
    <div className="container">
      {/* Hero / Context Banner */}
      <section style={{ marginBottom: "36px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "24px",
            marginBottom: "28px",
          }}
        >
          <div style={{ maxWidth: "720px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.76rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--gold-primary)",
                background: "var(--gold-bg)",
                border: "1px solid var(--gold-border)",
                padding: "4px 12px",
                borderRadius: "9999px",
                fontWeight: 700,
                marginBottom: "14px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Zero-Knowledge Archaeological Heritage Vault
            </div>

            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "2.6rem",
                fontWeight: 700,
                letterSpacing: "-0.01em",
                lineHeight: 1.15,
                marginBottom: "14px",
                background: "linear-gradient(135deg, #FFFFFF 40%, #CBD5E1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Archaeological Heritage Sites
            </h1>

            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "1.05rem",
                lineHeight: 1.65,
              }}
            >
              Exact excavation coordinates are sealed in the browser with {AUTH_MODE === "mock" ? "simulated end-to-end encryption (mock mode)" : "Tide end-to-end encryption"} under tag <code style={{ color: "var(--gold-light)", fontFamily: "var(--font-mono)", background: "rgba(245,158,11,0.08)", padding: "2px 6px", borderRadius: "4px" }}>sitecoords</code>. Public researchers view generalized 50 km boundary circles. Decrypting unblurred locations requires consensus from 2 of 3 multi-party stewards.
            </p>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <div
              className="vault-card"
              style={{ padding: "18px 24px", minWidth: "140px", textAlign: "center" }}
            >
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", fontWeight: 700 }}>
                Total Vaults
              </span>
              <strong
                style={{ fontSize: "2rem", color: "var(--text-primary)", fontWeight: 700, fontFamily: "var(--font-mono)" }}
                suppressHydrationWarning
              >
                {mounted ? totalSites : 0}
              </strong>
            </div>

            <div
              className="vault-card"
              style={{
                padding: "18px 24px",
                minWidth: "140px",
                textAlign: "center",
                borderColor: "var(--emerald-border)",
                background: "rgba(16, 185, 129, 0.04)",
              }}
            >
              <span style={{ fontSize: "0.72rem", color: "var(--emerald-light)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", fontWeight: 700 }}>
                Sealed Vaults
              </span>
              <strong
                style={{ fontSize: "2rem", color: "#6EE7B7", fontWeight: 700, fontFamily: "var(--font-mono)" }}
                suppressHydrationWarning
              >
                {mounted ? sealedCount : 0}
              </strong>
            </div>
          </div>
        </div>

        {/* 4-Step Architectural Security Flow Banner */}
        <div
          style={{
            background: "rgba(17, 22, 36, 0.5)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            padding: "16px 20px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--gold-bg)", color: "var(--gold-primary)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>1</span>
            <div>
              <strong style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block" }}>Field Sealing</strong>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Dig lead encrypts raw coordinates in-browser</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--cyan-bg)", color: "var(--cyan-primary)", border: "1px solid var(--cyan-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>2</span>
            <div>
              <strong style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block" }}>50 km Blur Derivation</strong>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Rounded to 0.5° to protect from illicit looting</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(244, 63, 94, 0.1)", color: "var(--rose-primary)", border: "1px solid var(--rose-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>3</span>
            <div>
              <strong style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block" }}>2-of-3 Steward Quorum</strong>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Lone admin is blocked; requires multi-party vote</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--emerald-bg)", color: "var(--emerald-primary)", border: "1px solid var(--emerald-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>4</span>
            <div>
              <strong style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block" }}>In-Browser Decrypt</strong>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Plaintext never touches server or databases</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div
          className="vault-card"
          style={{
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ position: "relative", flex: "1 1 320px" }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search archaeological sites by era, name, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: "38px" }}
              aria-label="Search sites"
            />
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="2"
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>
              Status:
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                onClick={() => setSealFilter("ALL")}
                className={`btn btn-sm ${sealFilter === "ALL" ? "btn-primary" : "btn-secondary"}`}
                suppressHydrationWarning
              >
                All Sites ({mounted ? totalSites : 0})
              </button>
              <button
                type="button"
                onClick={() => setSealFilter("SEALED")}
                className={`btn btn-sm ${sealFilter === "SEALED" ? "btn-emerald" : "btn-secondary"}`}
                suppressHydrationWarning
              >
                Sealed ({mounted ? sealedCount : 0})
              </button>
              <button
                type="button"
                onClick={() => setSealFilter("UNSEALED")}
                className={`btn btn-sm ${sealFilter === "UNSEALED" ? "btn-outline-gold" : "btn-secondary"}`}
                suppressHydrationWarning
              >
                Not Sealed ({mounted ? totalSites - sealedCount : 0})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      {!mounted ? (
        <LoadingSpinner message="Opening archaeological vault records..." />
      ) : !authenticated ? (
        <EmptyStateView
          title="Sign-In Required"
          description="Custodian Vault endpoints require user authentication. Please sign in or select a demo profile to inspect archaeological sites."
          action={
            <button
              type="button"
              onClick={login}
              className="btn btn-primary"
            >
              {AUTH_MODE === "mock" ? "Sign In (Mock Mode)" : "Sign In to View Sites"}
            </button>
          }
        />
      ) : loading ? (
        <LoadingSpinner message="Fetching encrypted archaeological vault records..." />
      ) : error ? (
        <ErrorRetryView message={error} onRetry={loadSites} />
      ) : filteredSites.length === 0 ? (
        <EmptyStateView
          title="No Matching Sites Found"
          description={
            searchQuery
              ? `No archaeological sites matched your search query "${searchQuery}".`
              : "No sites match the selected status filter."
          }
          action={
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSealFilter("ALL");
              }}
              className="btn btn-secondary btn-sm"
            >
              Clear Filters
            </button>
          }
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "24px",
          }}
        >
          {filteredSites.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      )}
    </div>
  );
}

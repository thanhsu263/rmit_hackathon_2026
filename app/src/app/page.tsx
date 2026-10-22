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
      {/* Hero / Context Banner - 64px spacing rhythm */}
      <section style={{ marginBottom: "64px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "32px",
            marginBottom: "48px",
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
                letterSpacing: "0.06em",
                color: "var(--accent)",
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                padding: "4px 12px",
                borderRadius: "9999px",
                fontWeight: 500,
                marginBottom: "16px",
              }}
            >
              <span>🦖</span>
              <span>Prehistoric &amp; Archaeological Heritage Vault</span>
            </div>

            <h1
              style={{
                fontSize: "clamp(2.2rem, 5vw, 3.25rem)",
                fontWeight: 500,
                letterSpacing: "-0.022em",
                lineHeight: 1.08,
                marginBottom: "16px",
                color: "var(--ink)",
              }}
            >
              Archaeological Heritage Sites
            </h1>

            <p
              style={{
                color: "var(--ink-2)",
                fontSize: "1.02rem",
                lineHeight: 1.6,
                maxWidth: "680px",
              }}
            >
              Exact excavation coordinates are sealed in the browser with {AUTH_MODE === "mock" ? "simulated end-to-end encryption (mock mode)" : "Tide end-to-end encryption"} under tag <code style={{ color: "var(--ink)", fontFamily: "var(--font-mono)", background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: "4px" }}>sitecoords</code>. Public researchers view generalized 50 km boundary circles. Decrypting unblurred locations requires consensus from 2 of 3 multi-party stewards.
            </p>
          </div>

          {/* Quick Metrics - clean whitespace separation, no nested border soup */}
          <div style={{ display: "flex", gap: "32px", alignItems: "flex-end" }}>
            <div>
              <span style={{ fontSize: "0.72rem", color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "4px" }}>
                Total Vaults
              </span>
              <strong
                style={{ fontSize: "2.2rem", color: "var(--ink)", fontWeight: 500, fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}
                suppressHydrationWarning
              >
                {mounted ? totalSites : 0}
              </strong>
            </div>

            <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: "32px" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "4px" }}>
                Sealed Vaults
              </span>
              <strong
                style={{ fontSize: "2.2rem", color: "var(--ok)", fontWeight: 500, fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}
                suppressHydrationWarning
              >
                {mounted ? sealedCount : 0}
              </strong>
            </div>
          </div>
        </div>

        {/* 4-Step Architecture Flow - Gray monochrome, pure restraint */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "24px",
            padding: "24px 0",
            borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
            marginBottom: "40px",
          }}
        >
          <div className="flow-step">
            <span className="flow-step-num" style={{ color: "var(--ink-3)", fontSize: "0.82rem", fontFamily: "var(--font-mono)", flexShrink: 0, transition: "color 0.2s ease" }}>01</span>
            <div>
              <strong style={{ fontSize: "0.88rem", color: "var(--ink)", fontWeight: 500, display: "block" }}>Field Sealing</strong>
              <span style={{ fontSize: "0.82rem", color: "var(--ink-3)", lineHeight: 1.45 }}>Dig lead encrypts raw coordinates in-browser</span>
            </div>
          </div>

          <div className="flow-step">
            <span className="flow-step-num" style={{ color: "var(--ink-3)", fontSize: "0.82rem", fontFamily: "var(--font-mono)", flexShrink: 0, transition: "color 0.2s ease" }}>02</span>
            <div>
              <strong style={{ fontSize: "0.88rem", color: "var(--ink)", fontWeight: 500, display: "block" }}>50 km Blur Radius</strong>
              <span style={{ fontSize: "0.82rem", color: "var(--ink-3)", lineHeight: 1.45 }}>Derived to protect site from looting</span>
            </div>
          </div>

          <div className="flow-step">
            <span className="flow-step-num" style={{ color: "var(--ink-3)", fontSize: "0.82rem", fontFamily: "var(--font-mono)", flexShrink: 0, transition: "color 0.2s ease" }}>03</span>
            <div>
              <strong style={{ fontSize: "0.88rem", color: "var(--ink)", fontWeight: 500, display: "block" }}>2-of-3 Quorum</strong>
              <span style={{ fontSize: "0.82rem", color: "var(--ink-3)", lineHeight: 1.45 }}>Lone admin blocked; multi-party consensus</span>
            </div>
          </div>

          <div className="flow-step">
            <span className="flow-step-num" style={{ color: "var(--ink-3)", fontSize: "0.82rem", fontFamily: "var(--font-mono)", flexShrink: 0, transition: "color 0.2s ease" }}>04</span>
            <div>
              <strong style={{ fontSize: "0.88rem", color: "var(--ink)", fontWeight: 500, display: "block" }}>In-Browser Decrypt</strong>
              <span style={{ fontSize: "0.82rem", color: "var(--ink-3)", lineHeight: 1.45 }}>Plaintext never touches servers</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar - Clean single line without heavy double-borders */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ position: "relative", flex: "1 1 320px", maxWidth: "480px" }}>
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
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--ink-3)"
              strokeWidth="2"
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setSealFilter("ALL")}
              className="btn btn-sm btn-secondary"
              style={{
                background: sealFilter === "ALL" ? "rgba(255, 255, 255, 0.08)" : "transparent",
                color: sealFilter === "ALL" ? "var(--ink)" : "var(--ink-3)",
              }}
              suppressHydrationWarning
            >
              All Sites ({mounted ? totalSites : 0})
            </button>
            <button
              type="button"
              onClick={() => setSealFilter("SEALED")}
              className="btn btn-sm btn-secondary"
              style={{
                background: sealFilter === "SEALED" ? "rgba(110, 231, 183, 0.08)" : "transparent",
                color: sealFilter === "SEALED" ? "var(--ok)" : "var(--ink-3)",
                borderColor: sealFilter === "SEALED" ? "rgba(110, 231, 183, 0.2)" : "var(--line)",
              }}
              suppressHydrationWarning
            >
              Sealed ({mounted ? sealedCount : 0})
            </button>
            <button
              type="button"
              onClick={() => setSealFilter("UNSEALED")}
              className="btn btn-sm btn-secondary"
              style={{
                background: sealFilter === "UNSEALED" ? "rgba(255, 255, 255, 0.05)" : "transparent",
                color: sealFilter === "UNSEALED" ? "var(--ink)" : "var(--ink-3)",
              }}
              suppressHydrationWarning
            >
              Not Sealed ({mounted ? totalSites - sealedCount : 0})
            </button>
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

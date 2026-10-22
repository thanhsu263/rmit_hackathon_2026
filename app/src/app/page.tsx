"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Site } from "../components/types";
import { getSites } from "../components/api";
import { useTideCloak } from "../components/tidecloak";
import { SiteCard } from "../components/SiteCard";
import { LoadingSpinner, ErrorRetryView, EmptyStateView } from "../components/StateViews";

export default function SitesPage() {
  const { token, authenticated, login } = useTideCloak();

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
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--amber-primary)",
                fontWeight: 700,
                marginBottom: "8px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Zero-Knowledge Archaeological Vault
            </div>
            <h1
              style={{
                fontSize: "2.4rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                marginBottom: "12px",
              }}
            >
              Archaeological Heritage Sites
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "1.05rem",
                maxWidth: "680px",
                lineHeight: 1.6,
              }}
            >
              Exact coordinates are sealed in the browser with TideCloak client-side encryption.
              General researchers only view coordinates blurred within a 50 km radius.
              Decryption requires consensus from 2 of 3 multi-party stewards.
            </p>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: "flex", gap: "14px" }}>
            <div
              className="vault-card"
              style={{ padding: "16px 22px", minWidth: "130px", textAlign: "center" }}
            >
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>
                Total Sites
              </span>
              <strong style={{ fontSize: "1.8rem", color: "var(--text-primary)", fontWeight: 700 }}>
                {totalSites}
              </strong>
            </div>

            <div
              className="vault-card"
              style={{
                padding: "16px 22px",
                minWidth: "130px",
                textAlign: "center",
                borderColor: "var(--emerald-border)",
              }}
            >
              <span style={{ fontSize: "0.75rem", color: "var(--emerald-primary)", textTransform: "uppercase", display: "block" }}>
                Sealed Vaults
              </span>
              <strong style={{ fontSize: "1.8rem", color: "#6EE7B7", fontWeight: 700 }}>
                {sealedCount}
              </strong>
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
              placeholder="Search archaeological sites by era or name..."
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

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
              Status:
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                onClick={() => setSealFilter("ALL")}
                className={`btn btn-sm ${sealFilter === "ALL" ? "btn-primary" : "btn-secondary"}`}
              >
                All Sites ({totalSites})
              </button>
              <button
                type="button"
                onClick={() => setSealFilter("SEALED")}
                className={`btn btn-sm ${sealFilter === "SEALED" ? "btn-emerald" : "btn-secondary"}`}
              >
                Sealed ({sealedCount})
              </button>
              <button
                type="button"
                onClick={() => setSealFilter("UNSEALED")}
                className={`btn btn-sm ${sealFilter === "UNSEALED" ? "btn-outline-amber" : "btn-secondary"}`}
              >
                Not Sealed ({totalSites - sealedCount})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      {!authenticated ? (
        <EmptyStateView
          title="Sign-In Required"
          description="Custodian Vault endpoints require user authentication. Please sign in or select a demo profile to continue."
          action={
            <button
              type="button"
              onClick={login}
              className="btn btn-primary"
            >
              Sign In to View Sites
            </button>
          }
        />
      ) : loading ? (
        <LoadingSpinner message="Fetching encrypted archaeological vault records..." />
      ) : error ? (
        <ErrorRetryView message={error} onRetry={loadSites} />
      ) : filteredSites.length === 0 ? (
        <EmptyStateView
          title="No Matching Sites"
          description={
            searchQuery
              ? `No archaeological sites matched your search "${searchQuery}".`
              : "No sites found in this category."
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

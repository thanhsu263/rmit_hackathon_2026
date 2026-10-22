"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Site } from "../components/types";
import { getSites } from "../components/api";
import { useTideCloak } from "../components/tidecloak";
import { SiteCard } from "../components/SiteCard";
import { LoadingSpinner, ErrorRetryView, EmptyStateView } from "../components/StateViews";
import { AUTH_MODE } from "../lib/auth/config";
import { HeroPlate } from "../components/HeroPlate";

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
      <section
        className="rise-in"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "56px",
          alignItems: "center",
          margin: "24px 0 88px",
        }}
      >
        <div>
          <span className="eyebrow">A heritage register with no master key</span>
          <h1 style={{ fontSize: "clamp(3rem, 6.6vw, 5.4rem)", margin: "18px 0 18px", letterSpacing: "-0.035em", lineHeight: 0.98 }}>
            Some places should stay <em style={{ fontStyle: "italic", color: "var(--accent-ink)" }}>lost.</em>
          </h1>
          <p className="state-word" style={{ fontSize: "clamp(1.3rem, 2.2vw, 1.75rem)", color: "var(--ink-2)", marginBottom: "28px" }}>
            …until two of three keepers agree.
          </p>
          <p style={{ color: "var(--ink-2)", fontSize: "1rem", maxWidth: "46ch", marginBottom: "32px" }}>
            Exact sites are sealed{AUTH_MODE === "mock" ? " (simulated)" : ""} the moment they are recorded. Everyone else sees a 50 km blur.
          </p>
          <div style={{ display: "flex", gap: "40px", alignItems: "flex-end" }}>
            <div>
              <strong className="state-word" style={{ fontStyle: "normal", fontSize: "2.6rem" }} suppressHydrationWarning>
                {mounted ? totalSites : 0}
              </strong>
              <span style={{ display: "block", fontSize: "0.82rem", color: "var(--ink-3)" }}>sites in the register</span>
            </div>
            <div>
              <strong className="state-word" style={{ fontStyle: "normal", fontSize: "2.6rem", color: "var(--accent-ink)" }} suppressHydrationWarning>
                {mounted ? sealedCount : 0}
              </strong>
              <span style={{ display: "block", fontSize: "0.82rem", color: "var(--ink-3)" }}>sealed</span>
            </div>
            <div>
              <strong className="state-word" style={{ fontStyle: "normal", fontSize: "2.6rem" }}>2/3</strong>
              <span style={{ display: "block", fontSize: "0.82rem", color: "var(--ink-3)" }}>stewards to open one</span>
            </div>
          </div>
        </div>

        <HeroPlate />
      </section>

      <section style={{ marginBottom: "28px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <span className="eyebrow">The register</span>
          <h2 style={{ fontSize: "2rem", marginTop: "6px" }}>Sites in our care</h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name or era"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "240px", padding: "8px 12px" }}
            aria-label="Search sites"
          />
          <div role="group" aria-label="Filter by seal" style={{ display: "flex", gap: "4px" }}>
            {([
              ["ALL", `All ${mounted ? totalSites : 0}`],
              ["SEALED", `Sealed ${mounted ? sealedCount : 0}`],
              ["UNSEALED", `Not sealed ${mounted ? totalSites - sealedCount : 0}`],
            ] as const).map(([key, text]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSealFilter(key)}
                className="btn btn-sm"
                aria-pressed={sealFilter === key}
                style={{
                  background: sealFilter === key ? "var(--ink)" : "transparent",
                  color: sealFilter === key ? "var(--bg)" : "var(--ink-2)",
                  borderColor: sealFilter === key ? "var(--ink)" : "var(--line-strong)",
                }}
                suppressHydrationWarning
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      {!mounted ? (
        <LoadingSpinner message="Opening the register…" />
      ) : !authenticated ? (
        <EmptyStateView
          title="Sign in to open the register"
          description="Every look at a site is recorded, so the register needs to know who you are."
          action={
            <button
              type="button"
              onClick={login}
              className="btn btn-primary"
            >
              {AUTH_MODE === "mock" ? "Sign in (simulated)" : "Sign in"}
            </button>
          }
        />
      ) : loading ? (
        <LoadingSpinner message="Opening the register…" />
      ) : error ? (
        <ErrorRetryView message={error} onRetry={loadSites} />
      ) : filteredSites.length === 0 ? (
        <EmptyStateView
          title="No sites match"
          description={
            searchQuery
              ? `Nothing matched "${searchQuery}".`
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
              Clear filters
            </button>
          }
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "28px",
          }}
        >
          {filteredSites.map((site, i) => (
            <SiteCard key={site.id} site={site} index={i} />
          ))}
        </div>
      )}

      <section
        aria-label="How it works"
        style={{
          marginTop: "96px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "32px",
          borderTop: "1.5px solid var(--ink)",
          paddingTop: "28px",
        }}
      >
        {[
          ["I", "Sealed at the dig.", "The dig lead encrypts the true point in the browser. The server never sees it."],
          ["II", "Blurred for everyone.", "The public record keeps a circle 50 km wide. Enough to research, too wide to loot."],
          ["III", "Opened by two of three.", "A custodian, an authority and the dig lead. Any one alone is refused, and every try is logged."],
        ].map(([n, title, body]) => (
          <div key={n}>
            <span style={{ fontFamily: "var(--font-serif)", color: "var(--accent-ink)", fontSize: "0.95rem" }}>{n}.</span>
            <h3 style={{ fontSize: "1.35rem", margin: "6px 0 8px" }}>{title}</h3>
            <p style={{ color: "var(--ink-2)", fontSize: "0.92rem" }}>{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

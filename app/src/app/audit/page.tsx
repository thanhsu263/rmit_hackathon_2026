"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AuditEvent } from "../../components/types";
import { getAuditEvents } from "../../components/api";
import { useTideCloak } from "../../components/tidecloak";
import { AuditTable } from "../../components/AuditTable";
import { LoadingSpinner, ErrorRetryView, EmptyStateView } from "../../components/StateViews";

export default function AuditPage() {
  const { token, authenticated, login } = useTideCloak();

  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAudit = useCallback(async () => {
    if (!authenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getAuditEvents(token);
      setEvents(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load audit registry events.");
    } finally {
      setLoading(false);
    }
  }, [authenticated, token]);

  useEffect(() => {
    loadAudit();
  }, [loadAudit]);

  return (
    <div className="container">
      {/* Header section */}
      <section style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ maxWidth: "740px" }}>
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
                marginBottom: "12px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Cryptographic Audit Stream
            </div>

            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "2.4rem",
                fontWeight: 700,
                letterSpacing: "-0.01em",
                marginBottom: "10px",
                color: "var(--text-primary)",
              }}
            >
              Immutable Governance Trail
            </h1>

            <p style={{ color: "var(--text-secondary)", fontSize: "1.02rem", lineHeight: 1.65 }}>
              All client-side decryption attempts, access requests, and site sealing actions are permanently recorded. Actor identities are extracted directly from verified TideCloak JWT tokens. Ordered newest first.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={loadAudit}
              disabled={loading}
              className="btn btn-secondary btn-sm"
              aria-label="Refresh audit events"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={loading ? "animate-spin" : ""}
              >
                <polyline points="1 4 1 10 7 10" />
                <polyline points="23 20 23 14 17 14" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
              </svg>
              Refresh Log
            </button>
            <Link href="/" className="btn btn-primary btn-sm">
              View Sites
            </Link>
          </div>
        </div>
      </section>

      {/* Main Body */}
      {!authenticated ? (
        <EmptyStateView
          title="Sign-In Required"
          description="Access to the immutable audit registry requires authenticated credentials."
          action={
            <button type="button" onClick={login} className="btn btn-primary">
              Sign In to View Audit Log
            </button>
          }
        />
      ) : loading ? (
        <LoadingSpinner message="Querying immutable audit events..." />
      ) : error ? (
        <ErrorRetryView message={error} onRetry={loadAudit} />
      ) : events.length === 0 ? (
        <EmptyStateView
          title="No Audit Records Found"
          description="No cryptographic operations or access requests have been logged yet."
        />
      ) : (
        <AuditTable events={events} />
      )}
    </div>
  );
}

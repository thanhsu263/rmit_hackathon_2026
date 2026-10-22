"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AuditEvent } from "../../components/types";
import { getAuditEvents } from "../../components/api";
import { useTideCloak } from "../../components/tidecloak";
import { AuditTable } from "../../components/AuditTable";
import { LoadingSpinner, ErrorRetryView, EmptyStateView } from "../../components/StateViews";
import { AUTH_MODE } from "../../lib/auth/config";

export default function AuditPage() {
  const { token, authenticated, login } = useTideCloak();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      {/* Header section - 64px rhythm */}
      <section style={{ marginBottom: "48px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "24px" }}>
          <div style={{ maxWidth: "720px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.76rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--ink-3)",
                fontWeight: 500,
                marginBottom: "16px",
              }}
            >
              Cryptographic Audit Stream
            </div>

            <h1
              style={{
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                fontWeight: 500,
                letterSpacing: "-0.022em",
                lineHeight: 1.1,
                marginBottom: "14px",
                color: "var(--ink)",
              }}
            >
              Immutable Governance Trail
            </h1>

            <p style={{ color: "var(--ink-2)", fontSize: "1.02rem", lineHeight: 1.6, maxWidth: "680px" }}>
              All client-side decryption attempts, access requests, and site sealing actions are permanently recorded. Actor identities are extracted directly from {AUTH_MODE === "mock" ? "simulated session tokens" : "verified TideCloak JWT tokens"}. Ordered newest first.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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
                strokeWidth="2"
                className={loading ? "animate-spin" : ""}
              >
                <polyline points="1 4 1 10 7 10" />
                <polyline points="23 20 23 14 17 14" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
              </svg>
              Refresh Log
            </button>
            <Link href="/" className="btn btn-secondary btn-sm">
              View Sites
            </Link>
          </div>
        </div>
      </section>

      {/* Main Body */}
      {!mounted ? (
        <LoadingSpinner message="Querying immutable audit events..." />
      ) : !authenticated ? (
        <EmptyStateView
          title="Sign-In Required"
          description="Access to the immutable audit registry requires authenticated credentials."
          action={
            <button type="button" onClick={login} className="btn btn-primary">
              {AUTH_MODE === "mock" ? "Sign In (Mock Mode)" : "Sign In to View Audit Log"}
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

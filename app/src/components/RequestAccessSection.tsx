"use client";

import React, { useState } from "react";
import { Site } from "./types";
import { useTideCloak } from "./tidecloak";
import { createAccessRequest } from "./api";

interface RequestAccessSectionProps {
  site: Site;
  onRequestCreated?: () => void;
}

const PRESET_REASONS = [
  "Non-destructive acoustic sonar tomography on basalt chambers before winter tidal surges.",
  "Ground-Penetrating Radar (GPR) deep-layer anomaly verification for academic thesis publication.",
  "Emergency heritage conservation assessment following tectonic tremors in the Aegean rift valley.",
];

export function RequestAccessSection({ site, onRequestCreated }: RequestAccessSectionProps) {
  const { token, user } = useTideCloak();

  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMessage("Please enter a research reason for requesting access.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const requester = user?.username || "researcher";
      await createAccessRequest(
        {
          siteId: site.id,
          reason: reason.trim(),
        },
        token,
        requester
      );

      setConfirmed(true);
      setReason("");
      if (onRequestCreated) onRequestCreated();
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to submit access request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="vault-card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ marginBottom: "6px" }}>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 500, letterSpacing: "-0.018em", color: "var(--ink)" }}>
          Request Location Access
        </h3>
      </div>

      <p style={{ color: "var(--ink-2)", fontSize: "0.86rem", lineHeight: 1.55, marginBottom: "16px" }}>
        Submit formal archaeological justification. Grants require multi-party consensus from 2 of 3 designated stewards.
      </p>

      {/* Confirmation Banner */}
      {confirmed && (
        <div className="alert-banner alert-banner-info" role="status">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" style={{ flexShrink: 0, marginTop: "2px" }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div>
            <strong style={{ display: "block", color: "var(--ink)", fontSize: "0.92rem", fontWeight: 500, marginBottom: "2px" }}>
              Access Request Registered
            </strong>
            {/* Required contract copy */}
            <p style={{ color: "var(--ink)", fontSize: "0.92rem", fontWeight: 500 }}>
              Approvals happen with the stewards (2 of 3) in TideCloak, not in this app.
            </p>
            <p style={{ fontSize: "0.82rem", color: "var(--ink-2)", marginTop: "4px", lineHeight: 1.5 }}>
              The Community Custodian, Heritage Authority, and Dig Lead will review your submission in Tide Console (QEA Governance).
            </p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="alert-banner alert-banner-denied" role="alert">
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <label htmlFor="access-reason" className="form-label">
              Academic Justification
            </label>
            <span style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>
              Public Audit Logged
            </span>
          </div>

          <textarea
            id="access-reason"
            className="form-textarea"
            placeholder="Explain why high-precision coordinates are required for your archaeological study..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isSubmitting}
            required
            rows={3}
          />
        </div>

        {/* Quick Sample Presets */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "0.74rem", color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
            Quick Sample Justifications:
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {PRESET_REASONS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setReason(preset)}
                className="btn btn-secondary btn-sm"
                style={{
                  fontSize: "0.74rem",
                  padding: "4px 8px",
                  textAlign: "left",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={preset}
              >
                {preset.slice(0, 42)}...
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          id="submit-request-btn"
          disabled={isSubmitting || !reason.trim()}
          className="btn btn-primary"
          style={{ width: "100%", marginTop: "4px" }}
          aria-label="Request exact location"
        >
          {isSubmitting ? (
            <>
              <div
                className="animate-spin"
                style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  border: "2px solid #000",
                  borderTopColor: "transparent",
                }}
              />
              Registering Request...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 2L11 13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Request Exact Location
            </>
          )}
        </button>
      </form>
    </div>
  );
}

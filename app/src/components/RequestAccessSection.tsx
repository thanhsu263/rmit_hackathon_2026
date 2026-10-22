"use client";

import React, { useState } from "react";
import { Site } from "./types";
import { useTideCloak } from "./tidecloak";
import { createAccessRequest } from "./api";

interface RequestAccessSectionProps {
  site: Site;
  onRequestCreated?: () => void;
}

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
    <div className="vault-card" style={{ marginBottom: "24px" }}>
      <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
        Request Exact Location Access
      </h3>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "18px" }}>
        Submit formal justification to access unblurred coordinates. Access is evaluated under governed threshold consensus.
      </p>

      {/* Confirmation Banner */}
      {confirmed && (
        <div className="alert-banner alert-banner-info" role="status">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--cyan-primary)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div>
            <strong style={{ display: "block", color: "#67E8F9", marginBottom: "4px" }}>
              Access Request Registered
            </strong>
            {/* Required contract copy */}
            <p style={{ color: "#CFFAFE", fontSize: "0.9rem" }}>
              Approvals happen with the stewards (2 of 3) in TideCloak, not in this app.
            </p>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              The Community Custodian, Heritage Authority, and Dig Lead will review your request in Tide Console QEA.
            </p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="alert-banner alert-banner-denied" role="alert">
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="access-reason" className="form-label">
            Research Justification & Purpose
          </label>
          <textarea
            id="access-reason"
            className="form-textarea"
            placeholder="Explain why high-precision coordinates are required for your archaeological study (e.g., ground-penetrating radar survey, non-invasive acoustic tomography)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isSubmitting}
            required
            rows={3}
          />
          <span className="form-hint">
            Reason will be logged in the public immutable audit registry.
          </span>
        </div>

        <button
          type="submit"
          id="submit-request-btn"
          disabled={isSubmitting || !reason.trim()}
          className="btn btn-primary"
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
              Working...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 2L11 13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Request exact location
            </>
          )}
        </button>
      </form>
    </div>
  );
}

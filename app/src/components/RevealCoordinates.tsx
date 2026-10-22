"use client";

import React, { useState } from "react";
import { Site } from "./types";
import { useTideCloak } from "./tidecloak";
import { recordAuditEvent } from "./api";

interface RevealCoordinatesProps {
  site: Site;
  onAuditLogged?: () => void;
}

export function RevealCoordinates({ site, onAuditLogged }: RevealCoordinatesProps) {
  const { refreshToken, doDecrypt, token, user } = useTideCloak();

  // Plaintext kept ONLY in component state, never sent to server or stored in localStorage
  const [exactCoordinates, setExactCoordinates] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [deniedMessage, setDeniedMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Contract: Hidden when sealedExact is null: show "Not sealed yet"
  if (!site.sealedExact) {
    return (
      <div
        className="vault-card"
        style={{
          background: "rgba(245, 158, 11, 0.04)",
          border: "1px dashed var(--amber-border)",
          padding: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--amber-primary)" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h4 style={{ color: "var(--amber-primary)", fontSize: "1rem" }}>
            Not sealed yet
          </h4>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
          This archaeological site does not have sealed exact coordinates. A dig lead holding the{" "}
          <code style={{ color: "var(--amber-primary)", fontFamily: "var(--font-mono)" }}>
            _tide_sitecoords.selfencrypt
          </code>{" "}
          role can seal it below.
        </p>
      </div>
    );
  }

  const handleReveal = async () => {
    setIsLoading(true);
    setDeniedMessage(null);

    const actor = user?.username || "researcher";

    if (!site.sealedExact) return;

    try {
      // 1. Contract rule: Call refreshToken() first
      await refreshToken();

      // 2. Contract rule: Call doDecrypt([{ encrypted: site.sealedExact, tags: ['sitecoords'] }])
      // Contract rule: Always attempt doDecrypt (do not skip based on role check) so denial comes from TideCloak
      const decryptedArray = await doDecrypt([
        { encrypted: site.sealedExact, tags: ["sitecoords"] },
      ]);

      const plaintext = decryptedArray[0];

      // 3. Contract rule: Success -> show exact lat, lng with note
      setExactCoordinates(plaintext);

      // 4. Contract rule: POST /api/audit DECRYPT_SUCCEEDED
      await recordAuditEvent(
        {
          siteId: site.id,
          siteName: site.name,
          action: "DECRYPT_SUCCEEDED",
        },
        token,
        actor
      );

      if (onAuditLogged) onAuditLogged();
    } catch (err: any) {
      // 5. Contract rule: Failure -> clear denied state ("You do not hold the decrypt role yet. Two of three stewards must approve.")
      const message =
        err?.message ||
        "You do not hold the decrypt role yet. Two of three stewards must approve.";
      setDeniedMessage(message);

      // 6. Contract rule: POST /api/audit DECRYPT_DENIED
      try {
        await recordAuditEvent(
          {
            siteId: site.id,
            siteName: site.name,
            action: "DECRYPT_DENIED",
          },
          token,
          actor
        );
        if (onAuditLogged) onAuditLogged();
      } catch (auditErr) {
        // Suppress audit logging error to preserve primary denied view
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (exactCoordinates) {
      navigator.clipboard.writeText(exactCoordinates);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="vault-card" style={{ marginBottom: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
            Exact Site Coordinates
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "2px" }}>
            Sealed with client-side zero-knowledge encryption. Decryption requires TideCloak 2-of-3 steward consensus.
          </p>
        </div>

        {!exactCoordinates && (
          <button
            type="button"
            id="reveal-exact-btn"
            onClick={handleReveal}
            disabled={isLoading}
            className="btn btn-emerald"
            aria-label="Reveal exact archaeological coordinates"
          >
            {isLoading ? (
              <>
                <div
                  className="animate-spin"
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    border: "2px solid #FFF",
                    borderTopColor: "transparent",
                  }}
                />
                Working...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Reveal exact location
              </>
            )}
          </button>
        )}
      </div>

      {/* Denied State Banner */}
      {deniedMessage && (
        <div className="alert-banner alert-banner-denied" role="alert">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--rose-primary)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <strong style={{ display: "block", color: "var(--rose-primary)", marginBottom: "4px" }}>
              Decryption Request Denied by TideCloak
            </strong>
            <p style={{ color: "#FECDD3", marginBottom: "8px" }}>
              {deniedMessage}
            </p>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              Access to exact site coordinates is protected by a 2-of-3 multi-party authorization threshold:
              Community Custodian, Heritage Authority, and Dig Lead. A single administrator cannot bypass this governance rule.
            </p>
          </div>
        </div>
      )}

      {/* Success State: Revealed Coordinates */}
      {exactCoordinates && (
        <div style={{ marginTop: "12px" }}>
          <div className="alert-banner alert-banner-success" style={{ marginBottom: "16px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-primary)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            <div>
              <strong style={{ display: "block", color: "#6EE7B7", marginBottom: "4px" }}>
                Cryptographic Threshold Verified
              </strong>
              {/* Mandatory contract copy */}
              <p style={{ color: "#D1FAE5", fontSize: "0.92rem", fontWeight: 500 }}>
                Decrypted in your browser. The server only stores ciphertext.
              </p>
            </div>
          </div>

          <div className="coord-box" style={{ borderColor: "var(--emerald-border)" }}>
            <div>
              <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                High-Precision Coordinates (GPS WGS84)
              </span>
              <span className="coord-exact-value">
                {exactCoordinates}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="btn btn-secondary btn-sm"
              aria-label="Copy exact coordinates to clipboard"
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-primary)" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy Coords
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

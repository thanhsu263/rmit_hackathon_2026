"use client";

import React, { useState } from "react";
import { Site } from "./types";
import { useTideCloak } from "./tidecloak";
import { recordAuditEvent } from "./api";
import { AUTH_MODE } from "../lib/auth/config";

interface RevealCoordinatesProps {
  site: Site;
  onAuditLogged?: () => void;
}

export function RevealCoordinates({ site, onAuditLogged }: RevealCoordinatesProps) {
  const { refreshToken, doDecrypt, token, user } = useTideCloak();

  // Plaintext is kept ONLY in component state, never sent to server or stored in localStorage
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
          border: "1px dashed var(--gold-border)",
          padding: "24px",
          height: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "var(--radius-sm)",
              background: "var(--gold-bg)",
              color: "var(--gold-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <h4 style={{ color: "var(--gold-primary)", fontSize: "1.05rem", fontWeight: 700 }}>
              Not sealed yet
            </h4>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              {AUTH_MODE === "mock"
                ? "Exact coordinates not yet committed to E2EE vault (simulated)"
                : "Exact coordinates not yet committed to TideCloak E2EE"}
            </span>
          </div>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
          This archaeological site currently only has generalized boundary data. A dig lead holding the{" "}
          <code style={{ color: "var(--gold-primary)", fontFamily: "var(--font-mono)", background: "rgba(245,158,11,0.1)", padding: "2px 6px", borderRadius: "4px" }}>
            _tide_sitecoords.selfencrypt
          </code>{" "}
          role can seal the high-precision GPS coordinates below.
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
      } catch {
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

  const splitCoords = exactCoordinates ? exactCoordinates.split(",") : null;
  const latVal = splitCoords ? splitCoords[0]?.trim() : null;
  const lngVal = splitCoords ? splitCoords[1]?.trim() : null;

  return (
    <div className="vault-card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Card Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
          marginBottom: "18px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "var(--radius-sm)",
                background: "var(--emerald-bg)",
                color: "var(--emerald-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 style={{ fontSize: "1.18rem", fontWeight: 700, color: "var(--text-primary)" }}>
              High-Precision Location Vault
            </h3>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.86rem", lineHeight: 1.5 }}>
            Client-side zero-knowledge encrypted under tag <code style={{ color: "var(--gold-primary)", fontFamily: "var(--font-mono)" }}>sitecoords</code>. Decryption strictly enforces 2-of-3 multi-party quorum.
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
                Decrypting In-Browser...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Reveal Exact Location
              </>
            )}
          </button>
        )}
      </div>

      {/* Initial State Explainer before action */}
      {!exactCoordinates && !deniedMessage && !isLoading && (
        <div
          style={{
            background: "#080B13",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "18px",
            marginTop: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--gold-primary)",
              }}
            />
            <span style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--gold-primary)", fontWeight: 700 }}>
              Threshold Consensus Rule
            </span>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
            Clicking &quot;Reveal Exact Location&quot; invokes local WebCrypto decryption. If your token does not contain authorization signed by at least 2 of 3 independent stewards, the {AUTH_MODE === "mock" ? "security policy (simulated)" : "TideCloak security policy"} immediately denies decryption.
          </p>
        </div>
      )}

      {/* Denied State: Detailed 2-of-3 Quorum Visualization */}
      {deniedMessage && (
        <div style={{ marginTop: "10px" }}>
          <div className="alert-banner alert-banner-denied" role="alert">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--rose-primary)" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: "2px" }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <strong style={{ display: "block", color: "var(--rose-primary)", fontSize: "0.95rem", marginBottom: "4px" }}>
                {AUTH_MODE === "mock"
                  ? "Decryption Denied (TideCloak Simulation)"
                  : "Decryption Denied by TideCloak Policy"}
              </strong>
              {/* Mandatory contract copy */}
              <p style={{ color: "#FFE4E6", fontWeight: 600, fontSize: "0.92rem", marginBottom: "8px" }}>
                {deniedMessage}
              </p>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                A lone administrator or researcher is cryptographically blocked. {AUTH_MODE === "mock" ? "Multi-party quorum signatures are required before unsealing cultural coordinates." : "TideCloak requires multi-party quorum signatures before unsealing cultural coordinates."}
              </p>
            </div>
          </div>

          {/* Steward Threshold Status Breakdown */}
          <div
            style={{
              background: "#080B14",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "16px",
              marginTop: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>
                Multi-Party Steward Quorum
              </span>
              <span className="badge badge-danger" style={{ fontSize: "0.7rem" }}>
                0 of 2 Approvals • Quorum Unmet
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px" }}>
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Steward 1</span>
                <strong style={{ fontSize: "0.82rem", color: "var(--text-primary)", display: "block" }}>Community Custodian</strong>
                <span style={{ fontSize: "0.72rem", color: "var(--rose-light)" }}>⏳ Pending authorization</span>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Steward 2</span>
                <strong style={{ fontSize: "0.82rem", color: "var(--text-primary)", display: "block" }}>Heritage Authority</strong>
                <span style={{ fontSize: "0.72rem", color: "var(--rose-light)" }}>⏳ Pending authorization</span>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Steward 3</span>
                <strong style={{ fontSize: "0.82rem", color: "var(--text-primary)", display: "block" }}>Dig Lead</strong>
                <span style={{ fontSize: "0.72rem", color: "var(--rose-light)" }}>⏳ Pending authorization</span>
              </div>
            </div>

            {/* Quick Demo Helper Button */}
            <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                Need to authorize this access request?
              </span>
              <a
                href="/mock/approvals"
                className="btn btn-outline-gold btn-sm"
                style={{ fontSize: "0.76rem" }}
              >
                Go to Simulated Approvals (2 of 3) →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Success State: Revealed Coordinates */}
      {exactCoordinates && (
        <div style={{ marginTop: "auto" }}>
          <div className="alert-banner alert-banner-success" style={{ marginBottom: "16px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-primary)" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: "2px" }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <strong style={{ color: "var(--emerald-light)", fontSize: "0.95rem" }}>
                  Cryptographic Threshold Quorum Verified
                </strong>
                <span className="badge badge-sealed" style={{ fontSize: "0.68rem", padding: "1px 6px" }}>
                  2 of 3 Authorized
                </span>
              </div>
              {/* Mandatory contract copy */}
              <p style={{ color: "#D1FAE5", fontSize: "0.92rem", fontWeight: 600 }}>
                Decrypted in your browser. The server only stores ciphertext.
              </p>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "2px", display: "block" }}>
                Tag: <code style={{ fontFamily: "var(--font-mono)", color: "var(--emerald-light)" }}>sitecoords</code> • Plaintext held in ephemeral client memory only.
              </span>
            </div>
          </div>

          {/* Coordinate Readout Box */}
          <div className="coord-box" style={{ borderColor: "var(--emerald-border)", flexDirection: "column", alignItems: "stretch", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <span style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700, marginBottom: "4px" }}>
                  High-Precision Archaeological GPS (WGS84 Datum)
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
                    <span style={{ color: "var(--emerald-light)" }}>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy GPS Coords
                  </>
                )}
              </button>
            </div>

            {/* Split Latitude / Longitude Chips */}
            {latVal && lngVal && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ background: "rgba(16, 185, 129, 0.05)", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--emerald-border)" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>Latitude</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", color: "var(--emerald-light)", fontWeight: 600 }}>{latVal}° N</span>
                </div>
                <div style={{ background: "rgba(16, 185, 129, 0.05)", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--emerald-border)" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>Longitude</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", color: "var(--emerald-light)", fontWeight: 600 }}>{lngVal}° E</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

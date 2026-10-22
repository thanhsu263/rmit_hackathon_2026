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
          padding: "28px",
          height: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "var(--radius-xs)",
              background: "rgba(255, 255, 255, 0.04)",
              color: "var(--ink-3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <h4 style={{ color: "var(--ink)", fontSize: "1.05rem", fontWeight: 500 }}>
              Not sealed yet
            </h4>
            <span style={{ fontSize: "0.76rem", color: "var(--ink-3)" }}>
              {AUTH_MODE === "mock"
                ? "Exact coordinates not yet committed to E2EE vault (simulated)"
                : "Exact coordinates not yet committed to TideCloak E2EE"}
            </span>
          </div>
        </div>
        <p style={{ color: "var(--ink-2)", fontSize: "0.88rem", lineHeight: 1.55 }}>
          This archaeological site currently only has generalized boundary data. A dig lead holding the{" "}
          <code style={{ color: "var(--ink)", fontFamily: "var(--font-mono)", background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: "4px" }}>
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
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 500, letterSpacing: "-0.018em", color: "var(--ink)" }}>
              High-Precision Location Vault
            </h3>
          </div>
          <p style={{ color: "var(--ink-2)", fontSize: "0.86rem", lineHeight: 1.5 }}>
            Client-side zero-knowledge encrypted under tag <code style={{ color: "var(--ink)", fontFamily: "var(--font-mono)" }}>sitecoords</code>. Decryption strictly enforces 2-of-3 multi-party quorum.
          </p>
        </div>

        {!exactCoordinates && (
          <button
            type="button"
            id="reveal-exact-btn"
            onClick={handleReveal}
            disabled={isLoading}
            className="btn btn-primary"
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
                    border: "2px solid #000",
                    borderTopColor: "transparent",
                  }}
                />
                Decrypting In-Browser...
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
            borderTop: "1px solid var(--line)",
            paddingTop: "16px",
            marginTop: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--ink-3)",
              }}
            />
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-3)", fontWeight: 500 }}>
              Threshold Consensus Rule
            </span>
          </div>
          <p style={{ fontSize: "0.88rem", color: "var(--ink)", lineHeight: 1.5 }}>
            Decryption enforces <strong>2-of-3 multi-party quorum</strong>. If fewer than 2 stewards have authorized access, decryption is cryptographically blocked.
          </p>
        </div>
      )}

      {/* Denied State: Detailed 2-of-3 Quorum Visualization */}
      {deniedMessage && (
        <div style={{ marginTop: "16px" }}>
          <div className="alert-banner alert-banner-denied" role="alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--no)" strokeWidth="2" style={{ flexShrink: 0, marginTop: "2px" }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <strong style={{ display: "block", color: "var(--no)", fontSize: "0.92rem", fontWeight: 600, marginBottom: "4px" }}>
                {AUTH_MODE === "mock"
                  ? "Decryption Denied (TideCloak Simulation)"
                  : "Decryption Denied by TideCloak Policy"}
              </strong>
              {/* Mandatory contract copy */}
              <p style={{ color: "var(--ink)", fontWeight: 600, fontSize: "0.95rem", marginBottom: "6px" }}>
                {deniedMessage}
              </p>
              <p style={{ fontSize: "0.84rem", color: "var(--ink-2)", lineHeight: 1.45 }}>
                A lone administrator is cryptographically blocked. Multi-party quorum signatures from 2 of 3 stewards are required.
              </p>
            </div>
          </div>

          {/* Steward Threshold Status Breakdown */}
          <div
            style={{
              borderTop: "1px solid var(--line)",
              paddingTop: "16px",
              marginTop: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-3)" }}>
                Multi-Party Steward Quorum
              </span>
              <span className="badge badge-danger" style={{ fontSize: "0.7rem" }}>
                0 of 2 Approvals • Quorum Unmet
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
              <div style={{ borderLeft: "2px solid var(--line)", paddingLeft: "10px" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--ink-3)", display: "block" }}>Steward 1</span>
                <strong style={{ fontSize: "0.82rem", color: "var(--ink)", fontWeight: 500, display: "block" }}>Community Custodian</strong>
                <span style={{ fontSize: "0.72rem", color: "var(--no)" }}>Pending authorization</span>
              </div>

              <div style={{ borderLeft: "2px solid var(--line)", paddingLeft: "10px" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--ink-3)", display: "block" }}>Steward 2</span>
                <strong style={{ fontSize: "0.82rem", color: "var(--ink)", fontWeight: 500, display: "block" }}>Heritage Authority</strong>
                <span style={{ fontSize: "0.72rem", color: "var(--no)" }}>Pending authorization</span>
              </div>

              <div style={{ borderLeft: "2px solid var(--line)", paddingLeft: "10px" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--ink-3)", display: "block" }}>Steward 3</span>
                <strong style={{ fontSize: "0.82rem", color: "var(--ink)", fontWeight: 500, display: "block" }}>Dig Lead</strong>
                <span style={{ fontSize: "0.72rem", color: "var(--no)" }}>Pending authorization</span>
              </div>
            </div>

            {/* Quick Demo Helper Button */}
            <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--ink-2)" }}>
                Need to authorize this access request?
              </span>
              <a
                href="/mock/approvals"
                className="btn btn-secondary btn-sm"
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="2" style={{ flexShrink: 0, marginTop: "2px" }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <strong style={{ color: "var(--ok)", fontSize: "0.92rem", fontWeight: 500 }}>
                  Cryptographic Threshold Quorum Verified
                </strong>
                <span className="badge badge-sealed" style={{ fontSize: "0.68rem", padding: "1px 6px" }}>
                  2 of 3 Authorized
                </span>
              </div>
              {/* Mandatory contract copy */}
              <p style={{ color: "var(--ink)", fontSize: "0.92rem", fontWeight: 500 }}>
                Decrypted in your browser. The server only stores ciphertext.
              </p>
              <span style={{ fontSize: "0.78rem", color: "var(--ink-3)", marginTop: "2px", display: "block" }}>
                Tag: <code style={{ fontFamily: "var(--font-mono)", color: "var(--ink-2)" }}>sitecoords</code> • Plaintext held in ephemeral client memory only.
              </span>
            </div>
          </div>

          {/* Coordinate Readout Box with Kỹ thuật 4 signature */}
          <div
            style={{
              borderTop: "1px solid var(--line)",
              paddingTop: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              {/* 50 km circle with illuminated amber dot + radiant pulse wave */}
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
                title="50 km generalized radius unsealed: Exact pinpoint illuminated"
              >
                <svg width="56" height="56" viewBox="0 0 56 56" style={{ overflow: "visible" }}>
                  {/* 50 km dashed outer boundary */}
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    fill="none"
                    stroke="var(--ink-3)"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  {/* Radiant pulse wave */}
                  <circle
                    cx="28"
                    cy="28"
                    r="8"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="1"
                    style={{
                      transformOrigin: "center",
                      animation: "radiantPulse 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite",
                    }}
                  />
                  {/* True center coordinate dot */}
                  <circle
                    cx="28"
                    cy="28"
                    r="3.5"
                    fill="var(--accent)"
                  />
                </svg>
              </div>

              <div style={{ flex: "1 1 200px" }}>
                <span style={{ display: "block", fontSize: "0.72rem", color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500, marginBottom: "2px" }}>
                  High-Precision Archaeological GPS (WGS84)
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.2rem", fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.01em" }}>
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
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span style={{ color: "var(--ok)" }}>Copied</span>
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", paddingTop: "12px", borderTop: "1px solid var(--line)" }}>
                <div>
                  <span style={{ fontSize: "0.72rem", color: "var(--ink-3)", textTransform: "uppercase", display: "block" }}>Latitude</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", color: "var(--ink)", fontWeight: 500 }}>{latVal}° N</span>
                </div>
                <div>
                  <span style={{ fontSize: "0.72rem", color: "var(--ink-3)", textTransform: "uppercase", display: "block" }}>Longitude</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", color: "var(--ink)", fontWeight: 500 }}>{lngVal}° E</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

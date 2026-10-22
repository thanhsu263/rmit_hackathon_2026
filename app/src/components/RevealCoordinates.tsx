"use client";

import React, { useState } from "react";
import { Site } from "./types";
import { useTideCloak } from "./tidecloak";
import { recordAuditEvent } from "./api";
import { AUTH_MODE } from "../lib/auth/config";
import { SurveyPlate } from "./SurveyPlate";

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

  const isSealed = Boolean(site.sealedExact);
  const word = exactCoordinates
    ? "Revealed."
    : deniedMessage
      ? "Still locked."
      : isSealed
        ? "Sealed."
        : "Not sealed yet.";

  return (
    <section
      className="vault-card"
      style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "36px", alignItems: "center", padding: "32px" }}
    >
      <SurveyPlate
        siteId={site.id}
        blurred={site.blurred}
        exact={exactCoordinates}
        caption={
          exactCoordinates
            ? "Exact point, decrypted in this browser only."
            : `Public view: blurred to ${site.blurred.radiusKm} km around ${site.blurred.lat.toFixed(1)}, ${site.blurred.lng.toFixed(1)}.`
        }
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div>
          <span className="eyebrow">Exact location</span>
          <div className="state-word" style={{ marginTop: "6px", color: exactCoordinates ? "var(--accent-ink)" : deniedMessage ? "var(--no)" : "var(--ink)" }} aria-live="polite">
            {word}
          </div>
        </div>

        {!isSealed && (
          <p style={{ color: "var(--ink-2)", fontSize: "0.95rem", maxWidth: "44ch" }}>
            Only a blurred position exists so far. The dig lead seals the true point below.
          </p>
        )}

        {isSealed && !exactCoordinates && !deniedMessage && (
          <p style={{ color: "var(--ink-2)", fontSize: "0.95rem", maxWidth: "44ch" }}>
            The true point is ciphertext. It opens only for someone two of three stewards have approved.
          </p>
        )}

        {deniedMessage && (
          <div className="alert-banner alert-banner-denied" role="alert" style={{ marginBottom: 0 }}>
            <div>
              <strong style={{ display: "block", fontWeight: 500, marginBottom: "2px" }}>{deniedMessage}</strong>
              <span style={{ fontSize: "0.84rem", color: "var(--ink-2)" }}>
                One steward is not enough.{" "}
                {AUTH_MODE === "mock" && <a href="/mock/approvals">See the approvals</a>}
              </span>
            </div>
          </div>
        )}

        {exactCoordinates && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div className="coord-box">
              <span className="coord-exact-value">{latVal}, {lngVal}</span>
              <button type="button" onClick={handleCopy} className="btn btn-secondary btn-sm" aria-label="Copy exact coordinates to clipboard">
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <span style={{ fontSize: "0.84rem", color: "var(--ink-2)" }}>
              Two of three stewards agreed. Decrypted in your browser; the server only stores ciphertext.
            </span>
          </div>
        )}

        {isSealed && !exactCoordinates && (
          <div>
            <button
              type="button"
              id="reveal-exact-btn"
              onClick={handleReveal}
              disabled={isLoading}
              className="btn btn-primary"
              aria-label="Reveal exact archaeological coordinates"
              style={{ padding: "12px 22px", fontSize: "0.98rem" }}
            >
              {isLoading ? "Decrypting…" : "Reveal exact location"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

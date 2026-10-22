"use client";

import React, { useState } from "react";
import { Site, BlurredLocation } from "./types";
import { useTideCloak } from "./tidecloak";
import { sealSite } from "./api";
import { AUTH_MODE } from "../lib/auth/config";

interface SealSiteSectionProps {
  site: Site;
  onSiteSealed: (updatedSite: Site) => void;
}

export function SealSiteSection({ site, onSiteSealed }: SealSiteSectionProps) {
  const { hasRealmRole, doEncrypt, token, user } = useTideCloak();

  const [latInput, setLatInput] = useState<string>("");
  const [lngInput, setLngInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Contract: Visible ONLY if hasRealmRole('_tide_sitecoords.selfencrypt')
  const canSeal = hasRealmRole("_tide_sitecoords.selfencrypt");
  if (!canSeal) {
    return null;
  }

  // Live calculation of blurred location
  const numLat = parseFloat(latInput);
  const numLng = parseFloat(lngInput);
  const hasValidInputs =
    !isNaN(numLat) &&
    !isNaN(numLng) &&
    numLat >= -90 &&
    numLat <= 90 &&
    numLng >= -180 &&
    numLng <= 180;

  const previewBlurredLat = hasValidInputs ? Math.round(numLat * 2) / 2 : null;
  const previewBlurredLng = hasValidInputs ? Math.round(numLng * 2) / 2 : null;

  const handleFillDemoCoords = (lat: number, lng: number) => {
    setLatInput(lat.toString());
    setLngInput(lng.toString());
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);

    // Contract validation: [-90, 90] / [-180, 180]
    if (isNaN(lat) || lat < -90 || lat > 90) {
      setErrorMessage("Latitude must be a valid number between -90 and 90.");
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setErrorMessage("Longitude must be a valid number between -180 and 180.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Contract rule: compute blurred by rounding each to nearest 0.5 with radiusKm: 50
      const blurred: BlurredLocation = {
        lat: Math.round(lat * 2) / 2,
        lng: Math.round(lng * 2) / 2,
        radiusKm: 50,
      };

      // 2. Contract rule: doEncrypt([{ data: `${lat},${lng}`, tags: ['sitecoords'] }])
      const encryptedArray = await doEncrypt([
        {
          data: `${lat},${lng}`,
          tags: ["sitecoords"],
        },
      ]);

      const sealedExact = encryptedArray[0];

      // 3. Contract rule: POST /api/sites/:id/seal with { sealedExact, blurred }
      const actor = user?.username || "diglead";
      const updatedSite = await sealSite(
        site.id,
        {
          sealedExact,
          blurred,
        },
        token,
        actor
      );

      // 4. Contract rule: Clear the inputs after success
      setLatInput("");
      setLngInput("");
      setSuccessMessage(
        AUTH_MODE === "mock"
          ? `Successfully sealed site coordinates with E2EE (simulated)! Generalized boundary committed to ${blurred.lat}, ${blurred.lng} (50 km blur radius).`
          : `Successfully sealed site coordinates with TideCloak E2EE! Generalized boundary committed to ${blurred.lat}, ${blurred.lng} (50 km blur radius).`
      );

      onSiteSealed(updatedSite);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to seal coordinates.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="vault-card"
      style={{
        border: "1px solid var(--gold-border)",
        background: "rgba(245, 158, 11, 0.03)",
        marginTop: "24px",
        marginBottom: "24px",
      }}
    >
      {/* Lead Title & Authorization Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-sm)",
              background: "var(--gold-bg)",
              color: "var(--gold-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 12px rgba(245, 158, 11, 0.2)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Dig Lead Vault Sealing Console
            </h3>
            <span style={{ fontSize: "0.78rem", color: "var(--gold-primary)", fontWeight: 700 }}>
              Authorized by realm role: <code style={{ fontFamily: "var(--font-mono)" }}>_tide_sitecoords.selfencrypt</code>
            </span>
          </div>
        </div>

        <span className="badge badge-unsealed">
          🔒 Field Sealing Authorized
        </span>
      </div>

      <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "20px" }}>
        Enter true GPS coordinates to commit this archaeological discovery. Coordinates are encrypted locally in your browser {AUTH_MODE === "mock" ? "with simulated E2EE" : "with TideCloak"}. The server only receives ciphertext, and a generalized 50 km boundary is derived automatically.
      </p>

      {/* Success banner */}
      {successMessage && (
        <div className="alert-banner alert-banner-success" role="status">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-primary)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <div>
            <strong style={{ display: "block", color: "var(--emerald-light)", marginBottom: "2px" }}>
              Vault Sealed Successfully
            </strong>
            <p style={{ fontSize: "0.88rem" }}>{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error banner */}
      {errorMessage && (
        <div className="alert-banner alert-banner-denied" role="alert">
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Input grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "16px" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="seal-lat" className="form-label">
              Exact Latitude (°N / °S)
            </label>
            <input
              type="number"
              step="any"
              id="seal-lat"
              className="form-input"
              placeholder="e.g. 36.4128"
              value={latInput}
              onChange={(e) => setLatInput(e.target.value)}
              disabled={isSubmitting}
              required
            />
            <span className="form-hint">Valid range: -90.000000 to +90.000000</span>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="seal-lng" className="form-label">
              Exact Longitude (°E / °W)
            </label>
            <input
              type="number"
              step="any"
              id="seal-lng"
              className="form-input"
              placeholder="e.g. 25.4317"
              value={lngInput}
              onChange={(e) => setLngInput(e.target.value)}
              disabled={isSubmitting}
              required
            />
            <span className="form-hint">Valid range: -180.000000 to +180.000000</span>
          </div>
        </div>

        {/* Live Calculation & Blur Visualization Box */}
        {hasValidInputs && previewBlurredLat !== null && previewBlurredLng !== null && (
          <div
            style={{
              background: "#080B13",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "var(--radius-md)",
              padding: "14px 18px",
              marginBottom: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block" }}>
                Auto-Derived Generalized Boundary (Contract Formula)
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.92rem", color: "var(--gold-light)", fontWeight: 600 }}>
                Approximate: {previewBlurredLat.toFixed(1)}, {previewBlurredLng.toFixed(1)} (within 50 km)
              </span>
            </div>

            <span className="badge badge-info" style={{ fontSize: "0.7rem" }}>
              Formula: Math.round(deg * 2) / 2
            </span>
          </div>
        )}

        {/* Quick Demo Fill Buttons & Submit */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginTop: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Demo Quick-Fill:</span>
            <button
              type="button"
              onClick={() => handleFillDemoCoords(36.4128, 25.4317)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.76rem", padding: "4px 8px" }}
            >
              Sanctuary (36.41, 25.43)
            </button>
            <button
              type="button"
              onClick={() => handleFillDemoCoords(52.0194, 1.3482)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.76rem", padding: "4px 8px" }}
            >
              Barrow Mound (52.02, 1.35)
            </button>
          </div>

          <button
            type="submit"
            id="submit-seal-btn"
            disabled={isSubmitting || !latInput || !lngInput}
            className="btn btn-primary"
            aria-label="Encrypt and seal site coordinates"
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
                Encrypting &amp; Sealing...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Encrypt &amp; Seal Coordinates
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

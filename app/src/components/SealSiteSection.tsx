"use client";

import React, { useState } from "react";
import { Site, BlurredLocation } from "./types";
import { useTideCloak } from "./tidecloak";
import { sealSite } from "./api";

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
        `Successfully sealed site coordinates with TideCloak E2EE! Blurred location set to ${blurred.lat}, ${blurred.lng}.`
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
        border: "1px solid var(--amber-border)",
        background: "rgba(245, 158, 11, 0.04)",
        marginBottom: "24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "var(--radius-sm)",
              background: "var(--amber-bg)",
              color: "var(--amber-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Dig Lead Vault Seal Control
            </h3>
            <span style={{ fontSize: "0.78rem", color: "var(--amber-primary)", fontWeight: 600 }}>
              Authorized by role: _tide_sitecoords.selfencrypt
            </span>
          </div>
        </div>

        <span className="badge badge-unsealed">Dig Lead Role Active</span>
      </div>

      <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "20px" }}>
        Enter true GPS coordinates from the field. They will be encrypted in your browser with tag{" "}
        <code style={{ color: "var(--amber-primary)", fontFamily: "var(--font-mono)" }}>sitecoords</code>{" "}
        before transmission. The server will only ever receive ciphertext and the blurred location.
      </p>

      {successMessage && (
        <div className="alert-banner alert-banner-success" role="status">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-primary)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <p>{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="alert-banner alert-banner-denied" role="alert">
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <div className="form-group">
            <label htmlFor="exact-latitude" className="form-label">
              Exact Latitude [-90 to 90]
            </label>
            <input
              id="exact-latitude"
              type="number"
              step="any"
              className="form-input"
              placeholder="e.g. 36.3892"
              value={latInput}
              onChange={(e) => setLatInput(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="exact-longitude" className="form-label">
              Exact Longitude [-180 to 180]
            </label>
            <input
              id="exact-longitude"
              type="number"
              step="any"
              className="form-input"
              placeholder="e.g. 25.4611"
              value={lngInput}
              onChange={(e) => setLngInput(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
        </div>

        {/* Real-time Computed Blurred Preview */}
        {hasValidInputs && (
          <div
            style={{
              background: "#080B12",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "12px 16px",
              marginBottom: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>
                Auto-Computed Blurred Coordinates (Nearest 0.5°)
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", color: "var(--amber-primary)", fontWeight: 600 }}>
                {previewBlurredLat?.toFixed(1)}, {previewBlurredLng?.toFixed(1)} (radius 50 km)
              </span>
            </div>
            <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              Public research map view
            </span>
          </div>
        )}

        <button
          type="submit"
          id="seal-coordinates-btn"
          disabled={isSubmitting || !latInput || !lngInput}
          className="btn btn-primary"
          aria-label="Encrypt and seal coordinates"
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
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Seal Coordinates with TideCloak E2EE
            </>
          )}
        </button>
      </form>
    </div>
  );
}

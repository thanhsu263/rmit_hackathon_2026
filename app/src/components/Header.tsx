"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTideCloak } from "./tidecloak";
import { resetMockData } from "./api";

export function Header() {
  const pathname = usePathname();
  const {
    authenticated,
    user,
    login,
    logout,
    switchUser,
    availableUsers,
    currentProfileKey,
    hasRealmRole,
  } = useTideCloak();

  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleResetData = () => {
    resetMockData();
    setResetMessage("Mock data reset!");
    setTimeout(() => {
      setResetMessage(null);
      window.location.reload();
    }, 800);
  };

  const hasEncrypt = hasRealmRole("_tide_sitecoords.selfencrypt");
  const hasDecrypt = hasRealmRole("_tide_sitecoords.selfdecrypt");

  return (
    <header className="header-wrapper">
      {/* Hackathon Demo Governance Bar */}
      <div className="demo-bar">
        <div className="container demo-bar-inner">
          <div className="demo-role-selector">
            <span className="demo-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              TideCloak Demo Profile:
            </span>
            <select
              id="demo-profile-select"
              className="demo-select"
              value={currentProfileKey}
              onChange={(e) => switchUser(e.target.value)}
              aria-label="Switch active demo profile"
            >
              <option value="researcher">researcher (Field researcher - decrypt only after 2-of-3 approval)</option>
              <option value="diglead">diglead (Lead Archaeologist - Can Seal)</option>
              <option value="custodian">custodian (Community Steward 1 of 3)</option>
              <option value="heritage">heritage (Heritage Authority Steward 2 of 3)</option>
              <option value="unauthenticated">Unauthenticated Guest (Simulate 401)</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {authenticated && (
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                {hasEncrypt && (
                  <span
                    className="badge badge-info"
                    style={{ fontSize: "0.72rem", padding: "2px 8px" }}
                    title="User holds _tide_sitecoords.selfencrypt"
                  >
                    role: selfencrypt
                  </span>
                )}
                {hasDecrypt && (
                  <span
                    className="badge badge-sealed"
                    style={{ fontSize: "0.72rem", padding: "2px 8px" }}
                    title="User holds _tide_sitecoords.selfdecrypt (2 of 3 authorized)"
                  >
                    role: selfdecrypt
                  </span>
                )}
                {!hasEncrypt && !hasDecrypt && (
                  <span
                    className="badge"
                    style={{
                      fontSize: "0.72rem",
                      padding: "2px 8px",
                      background: "rgba(255,255,255,0.06)",
                      color: "var(--text-muted)",
                    }}
                  >
                    public blurred viewer
                  </span>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handleResetData}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.75rem", padding: "3px 8px", height: "26px" }}
              title="Reset mock sites and audit log to initial state"
            >
              {resetMessage || "Reset Demo Data"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container">
        <nav className="nav-bar" aria-label="Main Navigation">
          <Link href="/" className="nav-brand">
            <div className="nav-logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                <circle cx="12" cy="16" r="1.5" />
              </svg>
            </div>
            <div>
              <span className="nav-brand-text">Custodian Vault</span>
              <span
                style={{
                  display: "block",
                  fontSize: "0.68rem",
                  color: "var(--amber-primary)",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                TideCloak 2-of-3 E2EE Protected
              </span>
            </div>
          </Link>

          <div className="nav-links">
            <Link
              href="/"
              className={`nav-link ${pathname === "/" ? "active" : ""}`}
            >
              Sites
            </Link>
            <Link
              href="/audit"
              className={`nav-link ${pathname === "/audit" ? "active" : ""}`}
            >
              Audit Log
            </Link>
          </div>

          <div className="nav-user-panel">
            {authenticated && user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="user-badge" title={user.roleDescription}>
                  <div className="user-avatar-dot" />
                  <span className="user-username">{user.username}</span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="btn btn-secondary btn-sm"
                  aria-label="Sign out of Custodian Vault"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={login}
                className="btn btn-primary btn-sm"
                aria-label="Sign into Custodian Vault"
              >
                Sign In
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

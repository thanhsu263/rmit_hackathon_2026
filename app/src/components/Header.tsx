"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTideCloak } from "./tidecloak";
import { resetMockData } from "./api";
import { AUTH_MODE } from "../lib/auth/config";

export function Header() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const {
    authenticated,
    user,
    login,
    logout,
    switchUser,
    currentProfileKey,
    hasRealmRole,
  } = useTideCloak();

  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleResetData = () => {
    resetMockData();
    setResetMessage("Reset");
    setTimeout(() => {
      setResetMessage(null);
      window.location.reload();
    }, 600);
  };

  const hasEncrypt = hasRealmRole("_tide_sitecoords.selfencrypt");
  const hasDecrypt = hasRealmRole("_tide_sitecoords.selfdecrypt");
  const access = hasDecrypt ? "Can read exact" : hasEncrypt ? "Can seal" : "Sees 50 km blur";

  return (
    <header className="header-wrapper">
      <div className="container">
        <nav className="nav-bar" aria-label="Main Navigation">
          <Link href="/" className="nav-brand">
            <div className="nav-logo-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="12" r="8.5" strokeDasharray="2.4 2.4" />
                <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <div>
              <span className="nav-brand-text">Custodian Vault</span>
              <span className="nav-brand-sub">Heritage locations, held in common</span>
            </div>
          </Link>

          <div className="nav-links">
            <Link href="/" className={`nav-link ${pathname === "/" ? "active" : ""}`}>
              Sites
            </Link>
            <Link href="/audit" className={`nav-link ${pathname === "/audit" ? "active" : ""}`}>
              Audit Log
            </Link>
            {AUTH_MODE === "mock" && (
              <Link
                href="/mock/approvals"
                className={`nav-link ${pathname === "/mock/approvals" ? "active" : ""}`}
              >
                Simulated approvals
              </Link>
            )}
          </div>

          <div className="nav-user-panel">
            <label className="demo-role-selector" htmlFor="demo-profile-select">
              <span className="demo-label">{AUTH_MODE === "mock" ? "Acting as" : "Profile"}</span>
              <select
                id="demo-profile-select"
                className="demo-select"
                value={mounted ? currentProfileKey : "researcher"}
                onChange={(e) => switchUser(e.target.value)}
                aria-label="Switch active demo profile"
                suppressHydrationWarning
              >
                <option value="researcher">Researcher</option>
                <option value="diglead">Dig lead</option>
                <option value="custodian">Community custodian</option>
                <option value="heritage">Heritage authority</option>
                <option value="unauthenticated">Signed out</option>
              </select>
            </label>

            {!mounted ? (
              <div style={{ height: "32px", minWidth: "70px" }} />
            ) : authenticated && user ? (
              <>
                <div className="user-badge" title={user.roleDescription}>
                  <div className="user-avatar-dot" style={{ background: hasDecrypt ? "var(--accent)" : "var(--ok)" }} />
                  <span className="user-username">{user.username}</span>
                  <span className="user-access" style={{ color: "var(--ink-3)", fontSize: "0.78rem" }}>· {access}</span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="btn btn-secondary btn-sm"
                  aria-label="Sign out of Custodian Vault"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={login}
                className="btn btn-primary btn-sm"
                aria-label="Sign into Custodian Vault"
              >
                Sign in
              </button>
            )}

            {AUTH_MODE === "mock" && (
              <button
                type="button"
                onClick={handleResetData}
                className="btn btn-sm"
                style={{ background: "transparent", color: "var(--ink-3)", padding: "6px 8px" }}
                title="Reset mock sites and audit log to initial state"
              >
                {resetMessage ? `✓ ${resetMessage}` : "Reset demo"}
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

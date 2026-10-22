"use client";

import React from "react";
import { AuditAction } from "./types";
import { AUTH_MODE } from "../lib/auth/config";

interface StatusBadgeProps {
  status: "sealed" | "unsealed" | AuditAction;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  if (status === "sealed") {
    return (
      <span
        className="badge badge-sealed"
        title={AUTH_MODE === "mock" ? "Sealed with E2EE (Simulated)" : "Sealed with TideCloak E2EE"}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Sealed
      </span>
    );
  }

  if (status === "unsealed") {
    return (
      <span className="badge badge-unsealed" title="Awaiting cryptographic seal">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        Not sealed
      </span>
    );
  }

  // Audit Action Badges
  switch (status) {
    case "SITE_SEALED":
      return (
        <span className="badge badge-unsealed">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Sealed
        </span>
      );
    case "ACCESS_REQUESTED":
      return (
        <span className="badge badge-info">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Requested
        </span>
      );
    case "DECRYPT_SUCCEEDED":
      return (
        <span className="badge badge-sealed">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Revealed
        </span>
      );
    case "DECRYPT_DENIED":
      return (
        <span className="badge badge-danger">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Denied
        </span>
      );
    default:
      return <span className="badge badge-info">{status}</span>;
  }
}

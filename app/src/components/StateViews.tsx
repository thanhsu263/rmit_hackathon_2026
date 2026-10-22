"use client";

import React from "react";

export function LoadingSpinner({ message = "Decrypting vault records..." }: { message?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 20px",
        gap: "16px",
      }}
    >
      <div
        className="animate-spin"
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          border: "2px solid var(--line-strong)",
          borderTopColor: "var(--accent)",
        }}
      />
      <p style={{ color: "var(--ink-2)", fontSize: "0.88rem", fontWeight: 400, fontFamily: "var(--font-mono)" }}>
        {message}
      </p>
    </div>
  );
}

export function ErrorRetryView({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="vault-card"
      style={{
        textAlign: "center",
        padding: "48px 24px",
        margin: "32px 0",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "rgba(251, 113, 133, 0.1)",
          color: "var(--no)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h3 style={{ fontSize: "1.15rem", fontWeight: 500, letterSpacing: "-0.018em", marginBottom: "8px", color: "var(--ink)" }}>
        Connection or Governance Error
      </h3>

      <p style={{ color: "var(--ink-2)", marginBottom: "24px", maxWidth: "480px", margin: "0 auto 24px", lineHeight: 1.55, fontSize: "0.9rem" }}>
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="btn btn-primary btn-sm"
        aria-label="Retry loading data"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="1 4 1 10 7 10" />
          <polyline points="23 20 23 14 17 14" />
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
        </svg>
        Try Again
      </button>
    </div>
  );
}

export function EmptyStateView({
  title = "No Records Found",
  description = "No items match your query or have been sealed yet.",
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="vault-card"
      style={{
        textAlign: "center",
        padding: "64px 24px",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: "rgba(31, 27, 22, 0.05)",
          color: "var(--ink-3)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <h3 style={{ fontSize: "1.15rem", fontWeight: 500, letterSpacing: "-0.018em", color: "var(--ink)", marginBottom: "8px" }}>
        {title}
      </h3>

      <p style={{ color: "var(--ink-2)", fontSize: "0.9rem", maxWidth: "440px", margin: "0 auto 24px", lineHeight: 1.55 }}>
        {description}
      </p>

      {action}
    </div>
  );
}

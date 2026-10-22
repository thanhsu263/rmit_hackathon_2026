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
        padding: "60px 20px",
        gap: "16px",
      }}
    >
      <div
        className="animate-spin"
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          border: "3px solid rgba(245, 158, 11, 0.2)",
          borderTopColor: "var(--amber-primary)",
        }}
      />
      <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", fontWeight: 500 }}>
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
        border: "1px solid var(--rose-border)",
        background: "rgba(244, 63, 94, 0.05)",
        textAlign: "center",
        padding: "40px 24px",
        margin: "24px 0",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "var(--rose-bg)",
          color: "var(--rose-primary)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 style={{ fontSize: "1.1rem", marginBottom: "8px", color: "var(--text-primary)" }}>
        Connection or Security Error
      </h3>
      <p style={{ color: "var(--text-secondary)", marginBottom: "20px", maxWidth: "480px", margin: "0 auto 20px" }}>
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="btn btn-primary btn-sm"
        aria-label="Retry loading data"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
        padding: "50px 24px",
        borderStyle: "dashed",
        background: "rgba(14, 19, 31, 0.4)",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.05)",
          color: "var(--text-muted)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <h3 style={{ fontSize: "1.05rem", color: "var(--text-primary)", marginBottom: "6px" }}>{title}</h3>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", maxWidth: "420px", margin: "0 auto 18px" }}>
        {description}
      </p>
      {action}
    </div>
  );
}

import React, { Suspense } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { TideCloakProvider } from "../components/tidecloak";
import { Header } from "../components/Header";

export const metadata: Metadata = {
  title: "Custodian Vault | Archaeological Heritage Protection",
  description:
    "End-to-end encrypted archaeological site coordinates protected by 2-of-3 TideCloak steward consensus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <TideCloakProvider>
          <Suspense fallback={<div style={{ height: "105px", background: "#07090E" }} />}>
            <Header />
          </Suspense>
          <main style={{ flex: 1, padding: "32px 0 64px" }}>
            <Suspense fallback={<div className="container" style={{ padding: "40px 0" }}>Loading...</div>}>
              {children}
            </Suspense>
          </main>
          <footer
            style={{
              borderTop: "1px solid var(--border-subtle)",
              padding: "24px 0",
              background: "rgba(7, 9, 14, 0.95)",
              color: "var(--text-muted)",
              fontSize: "0.82rem",
            }}
          >
            <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <strong style={{ color: "var(--text-secondary)" }}>Custodian Vault</strong> • UNLOCKED Challenge 2 • Hackathon Prototype
              </div>
              <div>
                Threshold Governance: 2 of 3 Stewards (Community Custodian, Heritage Authority, Dig Lead)
              </div>
            </div>
          </footer>
        </TideCloakProvider>
      </body>
    </html>
  );
}

import React, { Suspense } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { TideCloakProvider } from "../components/tidecloak";
import { Header } from "../components/Header";

export const metadata: Metadata = {
  title: "Custodian Vault | Archaeological Heritage Protection",
  description:
    "End-to-end encrypted archaeological site coordinates protected by 2-of-3 TideCloak multi-party steward consensus.",
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
          <Suspense fallback={<div style={{ height: "108px", background: "#07080B" }} />}>
            <Header />
          </Suspense>
          <main style={{ flex: 1, padding: "36px 0 68px" }}>
            <Suspense fallback={<div className="container" style={{ padding: "48px 0" }}>Loading vault environment...</div>}>
              {children}
            </Suspense>
          </main>
          <footer
            style={{
              borderTop: "1px solid var(--border-subtle)",
              padding: "28px 0",
              background: "rgba(7, 8, 11, 0.95)",
              color: "var(--text-muted)",
              fontSize: "0.84rem",
            }}
          >
            <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontFamily: "var(--font-serif)", fontWeight: 700, color: "var(--text-secondary)" }}>
                  Custodian Vault
                </span>
                <span>•</span>
                <span>UNLOCKED Challenge 2</span>
                <span>•</span>
                <span>Hackathon Prototype</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                <span>Threshold Governance:</span>
                <span style={{ color: "var(--gold-primary)", fontWeight: 600 }}>2 of 3 Stewards</span>
                <span>(Community Custodian, Heritage Authority, Dig Lead)</span>
              </div>
            </div>
          </footer>
        </TideCloakProvider>
      </body>
    </html>
  );
}

import React, { Suspense } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { TideCloakProvider } from "../components/tidecloak";
import { Header } from "../components/Header";
import { SimulationBanner } from "../lib/auth/client";

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
    <html lang="en" suppressHydrationWarning>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }} suppressHydrationWarning>
        <SimulationBanner />
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
              borderTop: "1px solid var(--line)",
              padding: "32px 0",
              color: "var(--ink-3)",
              fontSize: "0.82rem",
            }}
          >
            <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 500, color: "var(--ink)" }}>
                  Custodian Vault
                </span>
                <span>•</span>
                <span>UNLOCKED Challenge 2</span>
                <span>•</span>
                <span>Hackathon Prototype</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--ink-3)" }}>
                <span>Threshold Governance:</span>
                <span style={{ color: "var(--ink-2)", fontWeight: 500 }}>2 of 3 Stewards</span>
                <span>(Community Custodian, Heritage Authority, Dig Lead)</span>
              </div>
            </div>
          </footer>
        </TideCloakProvider>
      </body>
    </html>
  );
}

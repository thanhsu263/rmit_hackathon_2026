import React, { Suspense } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { TideCloakProvider } from "../components/tidecloak";
import { Header } from "../components/Header";
import { SimulationBanner } from "../lib/auth/client";
import { ALL_PHOTOS } from "../components/siteImages";

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
          <Suspense fallback={<div style={{ height: "68px", background: "var(--bg)" }} />}>
            <Header />
          </Suspense>
          <main style={{ flex: 1, padding: "40px 0 96px" }}>
            <Suspense fallback={<div className="container" style={{ padding: "48px 0" }}>Opening the archive…</div>}>
              {children}
            </Suspense>
          </main>
          <footer
            style={{
              borderTop: "1px solid var(--line)",
              padding: "32px 0 40px",
              color: "var(--ink-3)",
              fontSize: "0.82rem",
            }}
          >
            <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px 32px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.05rem", color: "var(--ink)" }}>
                  Custodian Vault
                </span>
                <span>No one holds the master key. Two of three stewards do.</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "right" }}>
                <span>UNLOCKED Challenge 2 · Hackathon prototype · Fictional sites</span>
                <span id="photo-credits">
                  Illustrative photos on Unsplash by{" "}
                  {ALL_PHOTOS.map((p, i) => (
                    <React.Fragment key={p.href}>
                      {i > 0 && ", "}
                      <a href={p.href} target="_blank" rel="noreferrer" style={{ color: "var(--ink-2)" }}>{p.credit}</a>
                    </React.Fragment>
                  ))}
                  . Survey plates drawn in code.
                </span>
              </div>
            </div>
          </footer>
        </TideCloakProvider>
      </body>
    </html>
  );
}

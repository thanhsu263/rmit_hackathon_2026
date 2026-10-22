import React from "react";
import { SurveyPlate } from "./SurveyPlate";
import { HERO_PHOTO } from "./siteImages";

const print: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: "4px",
  boxShadow: "0 1px 0 rgba(31,27,22,0.05), 0 28px 48px -24px rgba(60,40,20,0.38)",
};

/** Home hero: a field photo and a survey plate laid on the desk, with a steward tag pinned on top. */
export function HeroPlate() {
  return (
    <div style={{ position: "relative", minHeight: "460px" }} aria-hidden="true">
      {HERO_PHOTO && (
        <div style={{ ...print, position: "absolute", top: 0, right: 0, width: "58%", padding: "10px 10px 30px", transform: "rotate(3deg)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={HERO_PHOTO.src} alt="" className="paper-photo" style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", display: "block", borderRadius: "2px" }} />
          <span style={{ position: "absolute", bottom: "8px", left: "12px", fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.78rem", color: "var(--ink-3)" }}>
            Trench 2, season one
          </span>
        </div>
      )}

      <div style={{ ...print, position: "absolute", left: 0, top: HERO_PHOTO ? "120px" : 0, width: HERO_PHOTO ? "74%" : "100%", padding: "12px 12px 16px", transform: "rotate(-1.5deg)" }}>
        <SurveyPlate siteId="hero-plate-thornwick" drawIn />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "0.78rem", color: "var(--ink-3)" }}>
          <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}>Plate 01 · location withheld</span>
          <span className="mono">± 50 km</span>
        </div>
      </div>

      {/* Steward tag */}
      <div
        style={{
          position: "absolute",
          right: "4%",
          bottom: "0",
          transform: "rotate(-3deg)",
          background: "#FFFDF8",
          border: "1px solid var(--line-strong)",
          borderRadius: "4px",
          padding: "14px 18px",
          boxShadow: "0 18px 30px -18px rgba(60,40,20,0.5)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {[true, false, false].map((filled, i) => (
          <svg key={i} width="34" height="34" viewBox="0 0 34 34" style={{ transform: filled ? "rotate(-8deg)" : undefined }}>
            {filled ? (
              <>
                <circle cx="17" cy="17" r="15" fill="var(--accent)" />
                <circle cx="17" cy="17" r="10.5" fill="none" stroke="#FBF8F1" strokeOpacity="0.6" />
              </>
            ) : (
              <circle cx="17" cy="17" r="15" fill="none" stroke="var(--ink-3)" strokeDasharray="3 3" />
            )}
          </svg>
        ))}
        <div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "var(--ink)", lineHeight: 1.1 }}>1 of 2 seals</div>
          <div style={{ fontSize: "0.74rem", color: "var(--ink-3)" }}>still locked</div>
        </div>
      </div>
    </div>
  );
}

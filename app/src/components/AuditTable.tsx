"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuditEvent } from "./types";
import { StatusBadge } from "./StatusBadge";
import { AUTH_MODE } from "../lib/auth/config";

interface AuditTableProps {
  events: AuditEvent[];
}

export function AuditTable({ events }: AuditTableProps) {
  const [filterAction, setFilterAction] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredEvents = events.filter((ev) => {
    if (filterAction !== "ALL" && ev.action !== filterAction) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchActor = ev.actor.toLowerCase().includes(q);
      const matchSite = (ev.siteName || ev.siteId).toLowerCase().includes(q);
      const matchAction = ev.action.toLowerCase().includes(q);
      return matchActor || matchSite || matchAction;
    }
    return true;
  });

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return (
        d.toLocaleString("en-US", {
          timeZone: "UTC",
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }) + " UTC"
      );
    } catch {
      return iso;
    }
  };

  const getActionExplanation = (action: string) => {
    switch (action) {
      case "DECRYPT_DENIED":
        return AUTH_MODE === "mock"
          ? "Quorum threshold unmet (Simulation blocked lone actor)"
          : "Quorum threshold unmet (TideCloak blocked lone actor)";
      case "DECRYPT_SUCCEEDED":
        return "2-of-3 steward consensus verified (Local client decrypt)";
      case "SITE_SEALED":
        return "Dig lead sealed raw GPS with tag 'sitecoords'";
      case "ACCESS_REQUESTED":
        return "Researcher submitted justification for steward review";
      default:
        return "Cryptographic operation verified";
    }
  };

  return (
    <div>
      {/* Search and Filters Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: "1 1 320px" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search audit trail by actor, site, or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: "38px" }}
              aria-label="Filter audit log records"
            />
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="2"
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <label htmlFor="audit-filter-action" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>
            Filter Action:
          </label>
          <select
            id="audit-filter-action"
            className="demo-select"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            style={{ padding: "8px 12px", minWidth: "180px" }}
          >
            <option value="ALL">All Events ({events.length})</option>
            <option value="SITE_SEALED">Site Sealed ({events.filter(e => e.action === "SITE_SEALED").length})</option>
            <option value="ACCESS_REQUESTED">Access Requested ({events.filter(e => e.action === "ACCESS_REQUESTED").length})</option>
            <option value="DECRYPT_SUCCEEDED">Decryption Succeeded ({events.filter(e => e.action === "DECRYPT_SUCCEEDED").length})</option>
            <option value="DECRYPT_DENIED">Decryption Denied ({events.filter(e => e.action === "DECRYPT_DENIED").length})</option>
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="audit-table-wrapper">
        <table className="audit-table" aria-label="Cryptographic Audit Event Registry">
          <thead>
            <tr>
              <th scope="col">Timestamp</th>
              <th scope="col">{AUTH_MODE === "mock" ? "Actor (From Token)" : "Actor (From JWT)"}</th>
              <th scope="col">Site Dossier</th>
              <th scope="col">Cryptographic Action</th>
              <th scope="col">Security Governance Context</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)" }}>
                  No audit events found matching the selected filter.
                </td>
              </tr>
            ) : (
              filteredEvents.map((ev, idx) => (
                <tr key={`${ev.at}-${idx}`}>
                  {/* Timestamp */}
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.84rem", whiteSpace: "nowrap" }} suppressHydrationWarning>
                    <span style={{ color: "var(--ink)", fontWeight: 500 }}>{formatTimestamp(ev.at)}</span>
                  </td>

                  {/* Actor */}
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.84rem", color: "var(--ink)", fontWeight: 600 }}>
                      {ev.actor}
                    </span>
                  </td>

                  {/* Site */}
                  <td>
                    <Link
                      href={`/sites/${ev.siteId}`}
                      style={{
                        color: "var(--ink)",
                        fontWeight: 600,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span style={{ borderBottom: "1px dotted var(--line)" }}>
                        {ev.siteName || ev.siteId}
                      </span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </Link>
                  </td>

                  {/* Action */}
                  <td>
                    <StatusBadge status={ev.action} size="sm" />
                  </td>

                  {/* Governance Context */}
                  <td style={{ fontSize: "0.84rem", color: "var(--ink-2)", lineHeight: 1.45 }}>
                    {getActionExplanation(ev.action)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

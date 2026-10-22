"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuditEvent, AuditAction } from "./types";
import { StatusBadge } from "./StatusBadge";

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
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return iso;
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: "1 1 300px" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by actor, site, or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: "36px" }}
              aria-label="Filter audit log records"
            />
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="2"
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label htmlFor="audit-filter-action" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
            Action:
          </label>
          <select
            id="audit-filter-action"
            className="demo-select"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            style={{ padding: "8px 12px", minWidth: "160px" }}
          >
            <option value="ALL">All Actions ({events.length})</option>
            <option value="SITE_SEALED">Site Sealed</option>
            <option value="ACCESS_REQUESTED">Access Requested</option>
            <option value="DECRYPT_SUCCEEDED">Decryption Succeeded</option>
            <option value="DECRYPT_DENIED">Decryption Denied</option>
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="audit-table-wrapper">
        <table className="audit-table" aria-label="Cryptographic Audit Event Registry">
          <thead>
            <tr>
              <th scope="col">Timestamp (UTC)</th>
              <th scope="col">Actor</th>
              <th scope="col">Site</th>
              <th scope="col">Action</th>
              <th scope="col">Security Context</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                  No audit events found matching the selected filter.
                </td>
              </tr>
            ) : (
              filteredEvents.map((ev, idx) => (
                <tr key={`${ev.at}-${idx}`}>
                  {/* Timestamp */}
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                    <span title={ev.at}>{formatTimestamp(ev.at)}</span>
                  </td>

                  {/* Actor */}
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: ev.actor === "diglead" ? "var(--amber-primary)" : "var(--cyan-primary)",
                        }}
                      />
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "0.86rem" }}>
                        {ev.actor}
                      </span>
                    </div>
                  </td>

                  {/* Site */}
                  <td>
                    <Link
                      href={`/sites/${ev.siteId}`}
                      style={{
                        color: "var(--text-primary)",
                        fontWeight: 600,
                        textDecoration: "underline",
                        textDecorationColor: "rgba(255,255,255,0.2)",
                      }}
                    >
                      {ev.siteName || ev.siteId}
                    </Link>
                  </td>

                  {/* Action with Human Readable Label */}
                  <td>
                    <StatusBadge status={ev.action} />
                  </td>

                  {/* Security Context */}
                  <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    {ev.action === "DECRYPT_SUCCEEDED" && (
                      <span style={{ color: "#6EE7B7" }}>2-of-3 Steward Threshold Verified</span>
                    )}
                    {ev.action === "DECRYPT_DENIED" && (
                      <span style={{ color: "#FCA5A5" }}>Blocked: Unapproved Token</span>
                    )}
                    {ev.action === "SITE_SEALED" && (
                      <span>E2EE Tag sitecoords</span>
                    )}
                    {ev.action === "ACCESS_REQUESTED" && (
                      <span>Pending Tide QEA Review</span>
                    )}
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

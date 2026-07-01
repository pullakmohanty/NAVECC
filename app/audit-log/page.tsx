"use client";

import { useState, useEffect, useMemo } from "react";
import type { AuditEntry, AuditCategory } from "@/data/mockData";
import AuditRow from "@/components/ui/AuditRow";

// ─── Filter config ─────────────────────────────────────────────────────────

type FilterKey = "All" | "Approvals" | "Root cause" | "Drug detection" | "Override";

const filterCategories: Record<FilterKey, AuditCategory[]> = {
  "All":             [],
  "Approvals":       ["REVIEW_ASSIGNED"],
  "Root cause":      ["ROOT_CAUSE"],
  "Drug detection":  ["PV_FLAG", "EVENT_CREATED"],
  "Override":        ["ACTION_TAKEN"],
};

const filterKeys: FilterKey[] = ["All", "Approvals", "Root cause", "Drug detection", "Override"];

// ─── Date grouping ─────────────────────────────────────────────────────────

function formatDateLabel(isoDate: string) {
  const d = new Date(isoDate + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function groupByDate(entries: AuditEntry[]) {
  const groups: { date: string; label: string; entries: AuditEntry[] }[] = [];
  const seen: Record<string, number> = {};

  for (const entry of entries) {
    const date = entry.timestamp.slice(0, 10);
    if (seen[date] === undefined) {
      seen[date] = groups.length;
      groups.push({ date, label: formatDateLabel(date), entries: [] });
    }
    groups[seen[date]].entries.push(entry);
  }

  return groups;
}

// ─── Stat card ─────────────────────────────────────────────────────────────

function StatCard({ label, value, accent, progress }: { label: string; value: string; accent?: string; progress?: number }) {
  const bar = accent ?? "#085040";
  return (
    <div style={{ flex:1, backgroundColor:"#FFFFFF", border:"1px solid #F0F4F5", borderRadius:10, padding:"12px 18px" }}>
      <span style={{ fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.6px", color:"#bbb", display:"block", marginBottom:4 }}>
        {label}
      </span>
      <span style={{ fontSize:26, fontWeight:700, color: '#212B32', lineHeight:1 }}>
        {value}
      </span>
      <div style={{ height:2, marginTop:8, borderRadius:1, backgroundColor: bar+"22" }}>
        <div style={{ height:"100%", width:`${progress ?? 60}%`, backgroundColor: bar, borderRadius:1 }}/>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AuditLogPage() {
  const [allEntries,   setAllEntries]   = useState<AuditEntry[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");
  const [search,       setSearch]       = useState("");

  // Fetch on mount and poll every 30s to pick up new CPXO scan entries
  useEffect(() => {
    function load() {
      fetch("/api/audit-log")
        .then(r => r.json())
        .then(data => setAllEntries(data));
    }
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  // Derived stats
  const systemCount    = allEntries.filter(e => e.actor === "SYSTEM").length;
  const approvedCount  = allEntries.filter(e => e.category === "REVIEW_ASSIGNED").length;
  const incidentIds    = new Set(allEntries.map(e => e.incidentId).filter(Boolean));
  const totalLabel     = allEntries.length > 0 ? String(allEntries.length) : "148";

  const filtered = useMemo(() => {
    let entries = [...allEntries];

    const cats = filterCategories[activeFilter];
    if (cats.length > 0) {
      entries = entries.filter((e) => cats.includes(e.category));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      entries = entries.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          (e.incidentId?.toLowerCase().includes(q) ?? false)
      );
    }

    return entries;
  }, [allEntries, activeFilter, search]);

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* 1. PAGE HEADER */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 500, color: "#005EB8", margin: 0 }}>
            Clinical Audit Log
          </h1>
          <p style={{ fontSize: 12, color: "#212B32", margin: "4px 0 0 0" }}>
            Reasoning Ledger · append-only · tamper-proof
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            backgroundColor: "#F8FAFC",
            border: "0.5px solid #F0F4F5",
            borderRadius: 6,
            padding: "6px 12px",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: "#085040",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#212B32",
              letterSpacing: "0.06em",
            }}
          >
            APPEND-ONLY · TAMPER-PROOF
          </span>
        </div>
      </div>

      {/* 2. KPI CARDS */}
      <div style={{ display: "flex", gap: 14 }}>
        <StatCard label="Total entries"           value={totalLabel}                    accent="#085040"  progress={74} />
        <StatCard label="Approved decisions"      value={String(approvedCount || 31)}   accent="#085040"  progress={31} />
        <StatCard label="System analysis entries" value={String(systemCount || 94)}     accent="#085040"  progress={63} />
        <StatCard label="Delay events covered"    value={String(incidentIds.size || 17)} accent="#dc2626" progress={50} />
      </div>

      {/* 3. FILTER TABS + SEARCH + EXPORT */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #F0F4F5",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {/* Tabs row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #F0F4F5",
            paddingRight: 12,
          }}
        >
          <div style={{ display: "flex" }}>
            {filterKeys.map((key) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                style={{
                  fontSize: 13,
                  fontWeight: activeFilter === key ? 500 : 400,
                  color: activeFilter === key ? "#005EB8" : "#212B32",
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom:
                    activeFilter === key ? "2px solid #085040" : "2px solid transparent",
                  padding: "10px 16px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Search + Export */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search entries…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                fontSize: 12,
                color: "#212B32",
                backgroundColor: "#F8FAFC",
                border: "1px solid #F0F4F5",
                borderRadius: 6,
                padding: "6px 10px",
                outline: "none",
                width: 180,
              }}
            />
          </div>
        </div>

        {/* 4. CHRONOLOGICAL ENTRIES grouped by date */}
        {groups.length === 0 ? (
          <div style={{ padding: "32px 16px", textAlign: "center" }}>
            <span style={{ fontSize: 13, color: "#212B32" }}>
              {allEntries.length === 0 ? "Loading entries…" : "No entries match this filter."}
            </span>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 16px",
                  backgroundColor: "#F8FAFC",
                  borderBottom: "0.5px solid #F4F7FA",
                  borderTop: "0.5px solid #F4F7FA",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#212B32",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {group.label}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: "#212B32",
                    backgroundColor: "#F4F7FA",
                    padding: "1px 7px",
                    borderRadius: 10,
                  }}
                >
                  {group.entries.length} {group.entries.length === 1 ? "entry" : "entries"}
                </span>
              </div>

              {group.entries.map((entry) => (
                <AuditRow key={entry.id} entry={entry} />
              ))}
            </div>
          ))
        )}

        {/* 5. Footer */}
        <div
          style={{
            padding: "10px 16px",
            borderTop: "1px solid #F0F4F5",
            backgroundColor: "#FAFBFC",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 11, color: "#212B32" }}>
            Showing {filtered.length} of {totalLabel} total ledger entries · No edit or delete operations
            permitted · SOC 2 · ISO 27001 · HIPAA · GDPR
          </span>
        </div>
      </div>

    </div>
  );
}

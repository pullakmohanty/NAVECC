"use client";

import { useRouter } from "next/navigation";
import { incidents } from "@/data/mockData";
import type { Incident } from "@/data/mockData";
import { useState } from "react";

const SEV_COLOR: Record<string, string> = {
  CRITICAL: "#E05C5C",
  HIGH:     "#E8A838",
  MEDIUM:   "#185FA5",
  LOW:      "#64748B",
};

const STATUS_COLOR: Record<string, string> = {
  OPEN:        "#E05C5C",
  "IN REVIEW": "#E8A838",
  RESOLVED:    "#2D9E6A",
};

function IncidentRowLocal({ incident, hovered, onEnter, onLeave, onClick }: {
  incident: Incident;
  hovered: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        backgroundColor: hovered ? "#F8FFFE" : "#FFFFFF",
        cursor: "pointer",
        transition: "background-color 0.12s",
        borderBottom: "0.5px solid #F0F4F5",
      }}
    >
      <td style={{ width: 36, padding: "12px 0 12px 16px" }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          backgroundColor: SEV_COLOR[incident.severity] ?? "#64748B",
          display: "inline-block",
        }} />
      </td>
      <td style={{ fontSize: 12, fontFamily: "monospace", color: "#028090", fontWeight: 500, paddingRight: 20, whiteSpace: "nowrap" }}>
        {incident.id}
      </td>
      <td style={{ paddingRight: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#0D1B3E" }}>{incident.drug}</div>
        <div style={{ fontSize: 12, color: "#64748B" }}>{incident.location}</div>
      </td>
      <td style={{ paddingRight: 20, whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: SEV_COLOR[incident.severity] ?? "#64748B" }}>
          {incident.delayHours}h
        </span>
      </td>
      <td style={{ paddingRight: 20 }}>
        <div style={{ display: "flex", gap: 5 }}>
          {incident.dataSources.map(src => (
            <span key={src} style={{
              fontSize: 10, fontWeight: 600, color: "#028090",
              backgroundColor: "#E6F4F5", padding: "2px 6px", borderRadius: 4,
            }}>{src}</span>
          ))}
        </div>
      </td>
      <td style={{ paddingRight: 20, whiteSpace: "nowrap" }}>
        <span style={{
          fontSize: 11, fontWeight: 600,
          color: SEV_COLOR[incident.severity] ?? "#64748B",
          backgroundColor: (SEV_COLOR[incident.severity] ?? "#64748B") + "18",
          padding: "2px 8px", borderRadius: 4,
        }}>
          {incident.severity}
        </span>
      </td>
      <td style={{ paddingRight: 16, whiteSpace: "nowrap" }}>
        <span style={{
          fontSize: 11, fontWeight: 500,
          color: STATUS_COLOR[incident.status] ?? "#64748B",
        }}>
          {incident.status}
        </span>
      </td>
    </tr>
  );
}

export default function IncidentsPage() {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const open     = incidents.filter(i => i.status === "OPEN").length;
  const critical = incidents.filter(i => i.severity === "CRITICAL").length;
  const inReview = incidents.filter(i => i.status === "IN REVIEW").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 500, color: "#0D1B3E", margin: "0 0 4px 0" }}>Incidents</h1>
        <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
          {incidents.length} total · {open} open · {critical} critical · {inReview} in review
        </p>
      </div>

      {/* KPI strip */}
      <div style={{ display: "flex", gap: 12 }}>
        {[
          { label: "OPEN",      value: open,               color: "#E05C5C" },
          { label: "CRITICAL",  value: critical,           color: "#E05C5C" },
          { label: "IN REVIEW", value: inReview,           color: "#E8A838" },
          { label: "RESOLVED",  value: incidents.filter(i => i.status === "RESOLVED").length, color: "#2D9E6A" },
        ].map(k => (
          <div key={k.label} style={{
            backgroundColor: "#FFFFFF", border: "0.5px solid #E2E8F0",
            borderRadius: 10, padding: "14px 20px", flex: 1,
          }}>
            <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748B", marginBottom: 6 }}>
              {k.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ backgroundColor: "#FFFFFF", border: "0.5px solid #E2E8F0", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "0.5px solid #F0F4F5" }}>
          <span style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748B" }}>
            All incidents
          </span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "0.5px solid #F0F4F5" }}>
              {["", "ID", "Drug · Location", "Delay", "Sources", "Severity", "Status"].map(h => (
                <th key={h} style={{
                  fontSize: 11, fontWeight: 500, textTransform: "uppercase",
                  letterSpacing: "0.06em", color: "#64748B",
                  textAlign: "left", padding: "8px 16px 8px 0",
                  paddingLeft: h === "" ? 16 : 0,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {incidents.map(inc => (
              <IncidentRowLocal
                key={inc.id}
                incident={inc}
                hovered={hoveredId === inc.id}
                onEnter={() => setHoveredId(inc.id)}
                onLeave={() => setHoveredId(null)}
                onClick={() => router.push(`/incidents/${inc.id}`)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

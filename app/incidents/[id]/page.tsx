"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Incident, AuditEntry } from "@/data/mockData";
import DataSourceCard from "@/components/ui/DataSourceCard";
import AuditRow from "@/components/ui/AuditRow";
import { UrgencyDot } from "@/components/ui/UrgencyDot";
import StaffHoursChart from "@/components/charts/StaffHoursChart";


// ── Helpers ──────────────────────────────────────────────────────────────────


const SEV_COLOR: Record<string, string> = {
  CRITICAL: "#005EB8", HIGH: "#028090", MEDIUM: "#005EB8", LOW: "#028090",
};

function fmtDetected(iso: string) {
  const date = new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  return `${date} · ${iso.slice(11, 16)}`;
}
function fmtHours(h: number) {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return mins > 0 ? `${hrs}h ${String(mins).padStart(2, "0")}m` : `${hrs}h`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em",
      color: "#000000", display: "block", marginBottom: 10,
    }}>
      {children}
    </span>
  );
}

function Field({ label, value, redValue }: { label: string; value: string; redValue?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#000000" }}>
        {label}
      </span>
      <span style={{ fontSize: 12, fontWeight: redValue ? 700 : 400, color: "#000000" }}>
        {value}
      </span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function IncidentDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const id      = (params?.id as string) ?? "INC-00934";

  const [allIncidents,  setAllIncidents]  = useState<Incident[]>([]);
  const [incident,      setIncident]      = useState<Incident | null>(null);
  const [auditEntries,  setAuditEntries]  = useState<AuditEntry[]>([]);
  const [hoveredId,     setHoveredId]     = useState<string | null>(null);

  // Fetch incident list (for left panel)
  useEffect(() => {
    fetch("/api/incidents").then(r => r.json()).then(setAllIncidents);
  }, []);

  // Fetch selected incident detail
  useEffect(() => {
    setIncident(null);
    fetch(`/api/incidents/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.incident) {
          setIncident(data.incident);
          setAuditEntries(data.auditEntries ?? []);
        }
      });
  }, [id]);

  if (!incident) return null;


  return (
    <div style={{
      display: "flex", gap: 12,
      height: "calc(100vh - 160px)",
      overflow: "hidden",
    }}>

      {/* ══ LEFT — Incident list ══════════════════════════════════════════════ */}
      <div style={{
        width: 236, flexShrink: 0,
        backgroundColor: "#FFFFFF",
        border: "1px solid #F0F4F5",
        borderRadius: 10, overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}>
        {/* List header */}
        <div style={{
          padding: "10px 14px", borderBottom: "1px solid #F0F4F5",
          backgroundColor: "#F8FAFC", flexShrink: 0,
        }}>
          <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "#000000" }}>
            Open Incidents
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, color: "#028090",
            backgroundColor: "rgba(2,128,144,0.08)", padding: "1px 6px",
            borderRadius: 8, marginLeft: 8,
          }}>
            {allIncidents.length}
          </span>
        </div>

        {/* Incident rows */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {allIncidents.map(inc => {
            const sc       = SEV_COLOR[inc.severity] ?? "#000000";
            const isActive = inc.id === id;
            const isHover  = hoveredId === inc.id && !isActive;
            return (
              <div
                key={inc.id}
                onClick={() => router.push(`/incidents/${inc.id}`)}
                onMouseEnter={() => setHoveredId(inc.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  padding: "9px 12px 9px 0",
                  paddingLeft: 0,
                  cursor: "pointer",
                  backgroundColor: isActive ? "#F0FFFE" : isHover ? "#FAFEFF" : "transparent",
                  borderBottom: "1px solid #F4F7FA",
                  display: "flex", gap: 0,
                }}
              >
                <div style={{ width: 12, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* ID + severity */}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%",
                      backgroundColor: sc, display: "inline-block", flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 10, fontFamily: "var(--font-geist-mono), monospace", color: "#028090", fontWeight: 500 }}>
                      {inc.id}
                    </span>
                    <span style={{ marginLeft: "auto" }}>
                      <UrgencyDot urgency={inc.severity} />
                    </span>
                  </div>
                  {/* Drug */}
                  <div style={{
                    fontSize: 12, fontWeight: isActive ? 500 : 400,
                    color: "#005EB8", marginBottom: 3,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {inc.drug}
                  </div>
                  {/* Delay + status */}
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 10, color: sc, fontWeight: 600 }}>{inc.delayHours}h delay</span>
                    <span style={{ fontSize: 9, color: "#F0F4F5" }}>·</span>
                    <span style={{ fontSize: 11, fontWeight: 500, color: "#000000" }}>
                      {inc.status}
                    </span>
                  </div>
                </div>
                <div style={{ width: 10, flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ CENTER — Main workspace ═══════════════════════════════════════════ */}
      <div style={{ flex: 1, minWidth: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* ── INCIDENT HEADER ── */}
        <div style={{
          backgroundColor: "#FFFFFF", border: "1px solid #F0F4F5",
          borderRadius: 10, padding: "14px 18px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontFamily: "var(--font-geist-mono), monospace", color: "#028090", fontWeight: 500 }}>
              {incident.id}
            </span>
            <UrgencyDot urgency={incident.severity} />
            <span style={{ fontSize: 11, fontWeight: 500, color: "#000000" }}>
              {incident.status}
            </span>
          </div>
          <h1 style={{ fontSize: 15, fontWeight: 500, color: "#005EB8", margin: "0 0 8px 0", lineHeight: 1.35 }}>
            {incident.drug} delivery {incident.delayHours}h late — infusion postponed {incident.treatmentPostponedHours} hours — {incident.pathway}
          </h1>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { label: "Patient ref", value: incident.patientRef },
              { label: "Drug",        value: incident.drug },
              { label: "Pathway",     value: incident.pathway },
              { label: "Detected",    value: fmtDetected(incident.detectedAt) },
              { label: "Evidence",    value: incident.evidenceLevel },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", gap: 4, alignItems: "baseline" }}>
                <span style={{ fontSize: 10, color: "#000000" }}>{label}</span>
                <span style={{ fontSize: 11, color: "#000000", fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── SIGNAL CARDS — 3 columns, first thing you see ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {incident.dataSources.includes("COURIER") && (
            <DataSourceCard
              type="COURIER" org={incident.courierName}
              finding={`Delivery ${incident.delayHours}h late`}
              detail={`${incident.delayCause} · courier ref ${incident.courierRef}`}
              timestamp={`Detected ${fmtDetected(incident.detectedAt)}`}
            />
          )}
          {incident.dataSources.includes("APPT") && (
            <DataSourceCard
              type="APPT" org={incident.pathway}
              finding="Infusion appointment rescheduled"
              detail={`Missed infusion window · ${incident.treatmentPostponedHours}h treatment postponed · patient on critical therapy`}
              timestamp={`Detected ${fmtDetected(incident.detectedAt)}`}
            />
          )}
          {incident.dataSources.includes("NURSE") && (
            <DataSourceCard
              type="NURSE" org={incident.pathway}
              finding="Nurse visit rebooked"
              detail={`${fmtHours(incident.nhsStaffHoursLost)} NHS staff rescheduling · ${incident.complaintFiled ? "complaint filed" : "no complaint filed"} · patient unaware of delay`}
              timestamp={`Detected ${fmtDetected(incident.detectedAt)}`}
            />
          )}
        </div>

        {/* ── KEY FIELDS ── */}
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #F0F4F5", borderRadius: 10, padding: "14px 18px" }}>
          <SectionLabel>Incident fields</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 28px" }}>
            <Field label="Delay cause"           value={incident.delayCause} />
            <Field
              label="Arvion visibility without NavECC"
              value={incident.arvionVisibility === "ZERO" ? "Zero — no signal received" : incident.arvionVisibility === "PARTIAL" ? "Partial — limited signal" : "Full visibility"}
              redValue={incident.arvionVisibility === "ZERO"}
            />
            <Field label="Treatment postponed"   value={`${incident.treatmentPostponedHours} hours`} />
            <Field label="Proactive action"      value="Detected post-delivery — Phase 1 scope" />
            <Field label="NHS staff time lost"   value={fmtHours(incident.nhsStaffHoursLost)} />
            <Field label="Pathway"               value={incident.pathway} />
            <Field label="Patient complaint filed" value={incident.complaintFiled ? "Filed" : "None — patient was unaware"} />
            <Field label="Detected"              value={fmtDetected(incident.detectedAt)} />
          </div>
        </div>

        {/* ── EVENT SUMMARY ── */}
        <div style={{
          backgroundColor: "#F8FAFC", border: "1px solid #F0F4F5",
          borderRadius: 8, padding: "14px 18px",
        }}>
          <SectionLabel>Event summary</SectionLabel>
          <p style={{ fontSize: 13, fontStyle: "italic", color: "#000000", margin: 0, lineHeight: 1.65 }}>
            &ldquo;{incident.eventSummary}&rdquo;
          </p>
        </div>

        {/* ── NHS STAFF HOURS ── */}
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #F0F4F5", borderRadius: 10, padding: "14px 18px" }}>
          <SectionLabel>NHS staff hours lost — breakdown</SectionLabel>
          <StaffHoursChart />
        </div>

        {/* ── TIMELINE — first-class card ── */}
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #F0F4F5", borderRadius: 10, overflow: "hidden" }}>
          <div style={{
            padding: "10px 16px", borderBottom: "1px solid #F0F4F5",
            backgroundColor: "#FAFBFC", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#005EB8" }}>
              Timeline — Reasoning Ledger
            </span>
            <span style={{ fontSize: 9, fontWeight: 600, color: "#000000", backgroundColor: "#F4F7FA", padding: "2px 8px", borderRadius: 4, letterSpacing: "0.05em" }}>
              APPEND-ONLY · TAMPER-PROOF
            </span>
          </div>
          {auditEntries.map(entry => (
            <AuditRow key={entry.id} entry={entry} />
          ))}
        </div>

      </div>

    </div>
  );
}

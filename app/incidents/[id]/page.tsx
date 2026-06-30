"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Incident, AuditEntry } from "@/data/mockData";
import { pendingApprovals } from "@/data/mockData";
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

function fmtTime(iso: string) {
  return new Date(iso).toISOString().slice(11, 19);
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
  const [severityFilter, setSeverityFilter] = useState("All");

  // Review panel state
  const [reviewDecision,   setReviewDecision]   = useState("");
  const [reviewRootCause,  setReviewRootCause]  = useState("accept");
  const [reviewNotes,      setReviewNotes]      = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewDone,       setReviewDone]       = useState(false);

  // Reset review form when navigating to a different incident
  useEffect(() => {
    setReviewDecision("");
    setReviewRootCause("accept");
    setReviewNotes("");
    setReviewDone(false);
  }, [id]);

  async function handleReviewSubmit(forcedDecision?: string) {
    const decision = forcedDecision ?? reviewDecision;
    if (!decision || !incident) return;
    setReviewSubmitting(true);
    await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId: incident.id, decision, rootCause: reviewRootCause, evidence: "Accept", notes: reviewNotes }),
    });
    setReviewSubmitting(false);
    setReviewDone(true);
  }

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

  const hasPendingApproval = pendingApprovals.some(a => a.incidentId === id);

  const severityFilters = ["All", "CRITICAL", "HIGH", "MEDIUM"];
  const filteredIncidents = severityFilter === "All"
    ? allIncidents
    : allIncidents.filter(inc => inc.severity === severityFilter);

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
            {filteredIncidents.length}
          </span>
        </div>

        {/* Severity filter */}
        <div style={{
          display: "flex", gap: 6, flexWrap: "wrap",
          padding: "8px 12px", borderBottom: "1px solid #F0F4F5", flexShrink: 0,
        }}>
          {severityFilters.map(sev => {
            const active = severityFilter === sev;
            return (
              <button key={sev} onClick={() => setSeverityFilter(sev)} style={{
                fontSize: 10, fontWeight: active ? 500 : 400,
                color: active ? "#028090" : "#000000",
                backgroundColor: active ? "rgba(2,128,144,0.07)" : "#FFFFFF",
                border: active ? "1px solid #028090" : "1px solid #F0F4F5",
                borderRadius: 6, padding: "3px 9px", cursor: "pointer",
                textTransform: "capitalize" as const,
              }}>
                {sev === "All" ? "All" : sev.charAt(0) + sev.slice(1).toLowerCase()}
              </button>
            );
          })}
        </div>

        {/* Incident rows */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {filteredIncidents.map(inc => {
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
            {incident.drug} delivery {incident.delayHours}h late · infusion postponed {incident.treatmentPostponedHours} hours · {incident.pathway}
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

        {/* ── SIGNAL CARDS — 3 columns ── */}
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
              value={incident.arvionVisibility === "ZERO" ? "Zero, no signal received" : incident.arvionVisibility === "PARTIAL" ? "Partial, limited signal" : "Full visibility"}
              redValue={incident.arvionVisibility === "ZERO"}
            />
            <Field label="Treatment postponed"   value={`${incident.treatmentPostponedHours} hours`} />
            <Field label="Proactive action"      value="Detected post-delivery (Phase 1 scope)" />
            <Field label="NHS staff time lost"   value={fmtHours(incident.nhsStaffHoursLost)} />
            <Field label="Pathway"               value={incident.pathway} />
            <Field label="Patient complaint filed" value={incident.complaintFiled ? "Filed" : "None, patient was unaware"} />
            <Field label="Detected"              value={fmtDetected(incident.detectedAt)} />
          </div>
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

      {/* ══ RIGHT — Case review panel (only for incidents with pending approval) */}
      {hasPendingApproval && <div style={{
        width: 272, flexShrink: 0,
        backgroundColor: "#FFFFFF",
        border: "1px solid #F0F4F5",
        borderRadius: 10, overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}>
        {/* Panel header */}
        <div style={{
          padding: "10px 14px", borderBottom: "1px solid #F0F4F5",
          backgroundColor: "#F8FAFC", flexShrink: 0,
        }}>
          <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "#000000" }}>
            Case review
          </span>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: "14px" }}>

          {/* Human governance note */}
          <div style={{ borderTop: "1.5px dashed #E2E8F0", paddingTop: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 10, color: "#000000", lineHeight: 1.5 }}>
              Human involvement — post-action only. Actions have already executed.
            </span>
          </div>

          {/* Process stepper */}
          <div style={{ marginBottom: 14 }}>
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#000000", display: "block", marginBottom: 10 }}>
              Process status
            </span>
            <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
              {[
                { label: "Detected",  done: true  },
                { label: "Classified", done: true  },
                { label: "Actioned",  done: true  },
                { label: "Review",    done: false, active: !reviewDone },
                { label: "Closed",    done: reviewDone },
              ].map((step, i, arr) => (
                <React.Fragment key={i}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 0 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%",
                      backgroundColor: step.done || step.active ? "#028090" : "#F4F7FA",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700,
                      color: step.done || step.active ? "#FFFFFF" : "#94A3B8",
                      flexShrink: 0,
                    }}>
                      {step.done ? "✓" : i + 1}
                    </div>
                    <span style={{ fontSize: 8, fontWeight: step.active ? 600 : 400, color: step.active ? "#028090" : step.done ? "#000000" : "#94A3B8", whiteSpace: "nowrap", textAlign: "center" }}>
                      {step.label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <span style={{ flex: 1, minWidth: 4, height: 1, backgroundColor: step.done ? "#028090" : "#E2E8F0", margin: "10px 2px 0" }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Reasoning Ledger — compact, fixed-height scrollable */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#000000" }}>
                Reasoning ledger
              </span>
              <span style={{ fontSize: 8, fontWeight: 600, color: "#000000", backgroundColor: "#F4F7FA", padding: "1px 6px", borderRadius: 4, letterSpacing: "0.04em" }}>
                APPEND-ONLY
              </span>
            </div>
            <div style={{
              maxHeight: 160, overflowY: "auto",
              border: "0.5px solid #F0F4F5", borderRadius: 8, padding: "8px",
              display: "flex", flexDirection: "column", gap: 8,
            }}>
              {auditEntries.length === 0 ? (
                <span style={{ fontSize: 10, color: "#94A3B8" }}>No ledger entries yet.</span>
              ) : auditEntries.map(entry => (
                <div
                  key={entry.id}
                  style={{
                    borderLeft: entry.isMHRAFlag ? "2px solid #E8A838" : "2px solid transparent",
                    paddingLeft: 6,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 1 }}>
                    <span style={{ fontSize: 9, fontFamily: "var(--font-geist-mono), monospace", color: "#000000" }}>
                      {fmtTime(entry.timestamp)}
                    </span>
                    <span style={{ fontSize: 9, fontWeight: 500, color: "#000000" }}>
                      {entry.actor}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 500, color: "#005EB8", margin: 0, lineHeight: 1.4 }}>
                    {entry.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Decision form or success */}
          {reviewDone ? (
            <div style={{ backgroundColor: "#F0FDF4", border: "0.5px solid #BBF7D0", borderRadius: 8, padding: "16px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>✓</div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#028090", margin: "0 0 4px 0" }}>Review submitted</p>
              <p style={{ fontSize: 11, color: "#000000", margin: 0, lineHeight: 1.5 }}>Appended to Reasoning Ledger for {incident?.id}.</p>
            </div>
          ) : (
            <>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#005EB8", display: "block", marginBottom: 12 }}>
                Post-action governance decision
              </span>

              {/* Your decision */}
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#000000", display: "block", marginBottom: 5 }}>
                  Your decision
                </span>
                <select
                  value={reviewDecision}
                  onChange={e => setReviewDecision(e.target.value)}
                  style={{ width: "100%", fontSize: 12, color: "#005EB8", backgroundColor: "#FAFBFC", border: "1px solid #F0F4F5", borderRadius: 6, padding: "6px 8px", outline: "none", cursor: "pointer" }}
                >
                  <option value="">Select decision…</option>
                  <option value="approve">Approve automated action</option>
                  <option value="escalate">Escalate to clinical team</option>
                  <option value="override">Override — manual action taken</option>
                </select>
              </div>

              {/* Root cause classification */}
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#000000", display: "block", marginBottom: 5 }}>
                  Root cause classification
                </span>
                <select
                  value={reviewRootCause}
                  onChange={e => setReviewRootCause(e.target.value)}
                  style={{ width: "100%", fontSize: 12, color: "#005EB8", backgroundColor: "#FAFBFC", border: "1px solid #F0F4F5", borderRadius: 6, padding: "6px 8px", outline: "none", cursor: "pointer" }}
                >
                  <option value="accept">Accept — {incident?.rootCause}</option>
                  <option value="override">Override — different root cause</option>
                </select>
              </div>

              {/* Review notes */}
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#000000", display: "block", marginBottom: 5 }}>
                  Review notes
                </span>
                <textarea
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  placeholder="Add governance notes, context, or follow-up actions…"
                  rows={3}
                  style={{ width: "100%", fontSize: 12, color: "#000000", backgroundColor: "#FAFBFC", border: "1px solid #F0F4F5", borderRadius: 6, padding: "7px 8px", outline: "none", resize: "vertical", fontFamily: "inherit", lineHeight: 1.5, boxSizing: "border-box" }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button
                  onClick={() => handleReviewSubmit()}
                  disabled={!reviewDecision || reviewSubmitting}
                  style={{ width: "100%", fontSize: 12, fontWeight: 600, color: !reviewDecision || reviewSubmitting ? "#94A3B8" : "#FFFFFF", backgroundColor: !reviewDecision || reviewSubmitting ? "#F0F4F5" : "#005EB8", border: "none", borderRadius: 6, padding: "8px 12px", cursor: !reviewDecision || reviewSubmitting ? "not-allowed" : "pointer" }}
                >
                  {reviewSubmitting ? "Submitting…" : "Approve & Close →"}
                </button>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => { setReviewDecision("escalate"); handleReviewSubmit("escalate"); }}
                    disabled={reviewSubmitting}
                    style={{ flex: 1, fontSize: 11, fontWeight: 500, color: "#028090", backgroundColor: "transparent", border: "1px solid #028090", borderRadius: 6, padding: "7px 8px", cursor: "pointer" }}
                  >
                    Escalate
                  </button>
                  <button
                    onClick={() => {}}
                    style={{ flex: 1, fontSize: 11, fontWeight: 400, color: "#000000", backgroundColor: "transparent", border: "1px solid #F0F4F5", borderRadius: 6, padding: "7px 8px", cursor: "pointer" }}
                  >
                    Save Draft
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>}

    </div>
  );
}

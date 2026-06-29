"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PieChart, Pie, Cell, Tooltip, Label,
  BarChart, Bar, XAxis, YAxis, LabelList, ResponsiveContainer,
} from "recharts";
import AuditRow from "@/components/ui/AuditRow";
import type { Incident, AuditEntry } from "@/data/mockData";
import { severityStyles, dataSourceStyles, chartDefaults } from "@/lib/design-system";

// ── Types ────────────────────────────────────────────────────────────────────

type Approval = {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: string;
  title: string;
  detail: string;
  timeRemaining: string;
  incidentId?: string;
};

type IncidentRef = {
  id: string;
  drug: string;
  delay: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "RESOLVED";
};

type CardData = {
  id: string;
  label: string;
  rate: string;
  rateColor: string;
  borderColor: string;
  flag: { text: string; bg: string; color: string };
  badges: string[];
  description: string;
  incidents: IncidentRef[];
  moreCount?: number;
  infoBox: { label: string; text: string; bg: string; labelColor: string } | null;
  signals: string[];
  fix: string;
  nhsHours: number;
  nhsPct: number;
};

// ── Static data ──────────────────────────────────────────────────────────────

const DONUT_DATA = [
  { name: "Courier / Traffic",   value: 61.5, color: "#005EB8", pct: "0.8%" },
  { name: "Cold Chain",          value: 15.4, color: "#005EB8", pct: "0.2%" },
  { name: "Hospital Receiving",  value: 15.4, color: "#028090", pct: "0.2%" },
  { name: "Homecare Scheduling", value: 7.7,  color: "#028090", pct: "0.1%" },
];

const BAR_DATA = [
  { name: "Cold Chain",          value: 8.7, color: "#005EB8" },
  { name: "Courier / Traffic",   value: 5.8, color: "#005EB8" },
  { name: "Hospital Receiving",  value: 4.1, color: "#028090" },
  { name: "Homecare Scheduling", value: 2.7, color: "#028090" },
];

const CARDS: CardData[] = [
  {
    id: "courier",
    label: "Courier / Traffic",
    rate: "0.8%",
    rateColor: "#005EB8",
    borderColor: "#005EB8",
    flag: { text: "Highest frequency", bg: "#FDECEA", color: "#005EB8" },
    badges: ["9 events", "avg 5.8h delay"],
    description:
      "Courier arrived outside delivery window — M6 and M25 congestion, road closures, handover delays between depots.",
    incidents: [
      { id: "INC-00934", drug: "Ultomiris 500mg", delay: "7.2h", severity: "CRITICAL" },
      { id: "INC-00915", drug: "Ultomiris 500mg", delay: "3.8h", severity: "MEDIUM" },
      { id: "INC-00903", drug: "Ultomiris 500mg", delay: "6.9h", severity: "HIGH" },
    ],
    moreCount: 6,
    infoBox: null,
    signals: ["COURIER GPS", "PORTAL STALE", "NURSE PING", "EMAIL SIGNAL"],
    fix: "Pre-dispatch route alerts + backup courier SLA for M6 / M25 corridor. Real-time GPS monitoring per delivery.",
    nhsHours: 28.5,
    nhsPct: 67,
  },
  {
    id: "cold-chain",
    label: "Cold Chain",
    rate: "0.2%",
    rateColor: "#005EB8",
    borderColor: "#005EB8",
    flag: { text: "Longest delay", bg: "#FFF3E0", color: "#028090" },
    badges: ["2 events", "avg 8.7h delay"],
    description:
      "Temperature excursion during transit triggers mandatory pharmacist verification hold before dispensing.",
    incidents: [
      { id: "INC-00928", drug: "Soliris 300mg",  delay: "5.6h", severity: "HIGH" },
      { id: "INC-00781", drug: "Strensiq 40mg",  delay: "2.1h", severity: "MEDIUM" },
    ],
    infoBox: {
      label: "WHY IT TAKES LONGEST",
      text: "Cold chain breach triggers a mandatory pharmacist hold. Drug cannot be dispensed until integrity is confirmed. Avg hold: 4.2h additional delay.",
      bg: "#FFFBEB",
      labelColor: "#028090",
    },
    signals: ["TEMP TAG", "PORTAL STALE", "COURIER GPS"],
    fix: "Real-time temperature threshold alerts before dispatch. Cold chain validation at hub. Automated pharmacist pre-notification.",
    nhsHours: 8.5,
    nhsPct: 20,
  },
  {
    id: "hospital",
    label: "Hospital Receiving",
    rate: "0.2%",
    rateColor: "#028090",
    borderColor: "#028090",
    flag: { text: "NHS site issue", bg: "#E6F1FB", color: "#005EB8" },
    badges: ["2 events", "avg 4.1h delay"],
    description:
      "Pharmacy receiving desk unavailable at delivery — shift change, short staffing, or documentation gap at NHS hospital sites.",
    incidents: [
      { id: "INC-00921", drug: "Strensiq 80mg", delay: "4.1h", severity: "HIGH" },
      { id: "INC-00807", drug: "Strensiq 80mg", delay: "4.6h", severity: "HIGH" },
    ],
    infoBox: {
      label: "WHY IT HAPPENS",
      text: "Courier arrives at hospital dock but receiving desk is on shift change. Drug sits unaccepted. NavECC detects via missed confirmation scan.",
      bg: "#E8EBF2",
      labelColor: "#005EB8",
    },
    signals: ["DELIVERY LOGS", "NURSE PING", "PORTAL STALE"],
    fix: "Pre-notify pharmacy receiving desk 2h before courier arrival with ETA confirmation. Automated dock booking.",
    nhsHours: 4.2,
    nhsPct: 10,
  },
  {
    id: "homecare",
    label: "Homecare Scheduling",
    rate: "0.1%",
    rateColor: "#028090",
    borderColor: "#028090",
    flag: { text: "Lowest impact", bg: "#EAF3DE", color: "#000000" },
    badges: ["1 event", "avg 2.7h delay"],
    description:
      "Nurse unavailable to match revised delivery time — coordination gap between logistics ETA and homecare scheduling.",
    incidents: [
      { id: "INC-00909", drug: "Soliris 300mg", delay: "2.7h", severity: "RESOLVED" },
    ],
    infoBox: {
      label: "WHY IT IS LOWEST RISK",
      text: "Homecare scheduling gaps are self-correcting. Nurse reschedules within 2-3h. Lowest patient risk of all causes.",
      bg: "#EAF3DE",
      labelColor: "#000000",
    },
    signals: ["NURSE PING", "EMAIL SIGNAL", "PORTAL STALE"],
    fix: "Share logistics ETA with homecare portal in real time. Automated nurse availability check before dispatch.",
    nhsHours: 1.3,
    nhsPct: 3,
  },
];


const PRIORITIES = [
  { badge: "PRIORITY 1", text: "Enforce backup courier SLA — M6 / M25 corridor" },
  { badge: "PRIORITY 2", text: "Deploy cold chain hub validation before dispatch" },
  { badge: "PRIORITY 3", text: "Integrate homecare ETA portal sync in real time" },
];

// ── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, valueColor, sub, subColor, barColor }: {
  label: string; value: string; valueColor: string;
  sub: string; subColor?: string; barColor: string;
}) {
  return (
    <div style={{
      backgroundColor: "#FFFFFF", border: "1px solid #F0F4F5", borderRadius: 10,
      padding: "14px 16px 0 16px", overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "#000000", display: "block", marginBottom: 8 }}>
        {label}
      </span>
      <span style={{ fontSize: 26, fontWeight: 700, color: valueColor, lineHeight: 1, display: "block", marginBottom: 5 }}>
        {value}
      </span>
      <span style={{ fontSize: 11, color: subColor ?? "#000000", display: "block", marginBottom: 14 }}>
        {sub}
      </span>
      <div style={{ height: 3, backgroundColor: `${barColor}22` }}>
        <div style={{ height: "100%", width: "60%", backgroundColor: barColor, borderRadius: 1 }} />
      </div>
    </div>
  );
}

// ── Donut centre label ────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DonutCenter(props: any) {
  const cx = props.viewBox?.cx ?? 0;
  const cy = props.viewBox?.cy ?? 0;
  return (
    <g>
      <text x={cx} y={cy - 5} textAnchor="middle" fill="#005EB8" fontSize={20} fontWeight={700}>
        1.3%
      </text>
      <text x={cx} y={cy + 13} textAnchor="middle" fill="#000000" fontSize={11}>
        silent rate
      </text>
    </g>
  );
}

// ── Root cause card ───────────────────────────────────────────────────────────

function RcCard({ card, onNavigate }: { card: CardData; onNavigate: (id: string) => void }) {
  return (
    <div style={{
      backgroundColor: "#FFFFFF", border: "1px solid #F0F4F5",
      borderRadius: 10, overflow: "hidden",
    }}>
      {/* Top */}
      <div style={{ padding: "12px 14px", borderBottom: "1px solid #F4F7FA" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: card.rateColor, lineHeight: 1 }}>{card.rate}</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: card.flag.color, backgroundColor: card.flag.bg, padding: "2px 8px", borderRadius: 4 }}>
            {card.flag.text}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 7 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#005EB8" }}>{card.label}</span>
          {card.badges.map(b => (
            <span key={b} style={{ fontSize: 10, color: "#000000", backgroundColor: "#F4F7FA", padding: "2px 7px", borderRadius: 4 }}>{b}</span>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "#000000", margin: 0, lineHeight: 1.55 }}>{card.description}</p>
      </div>

      {/* Body */}
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Affected incidents */}
        <div>
          <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#000000", display: "block", marginBottom: 6 }}>
            Affected Incidents
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {card.incidents.map(inc => {
              return (
                <div key={inc.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                  <span
                    onClick={() => onNavigate(inc.id)}
                    style={{ color: "#028090", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-geist-mono), monospace", flexShrink: 0 }}
                  >
                    {inc.id}
                  </span>
                  <span style={{ color: "#000000", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inc.drug}</span>
                  <span style={{ color: "#000000", fontWeight: 600, flexShrink: 0 }}>{inc.delay}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#000000", flexShrink: 0 }}>
                    {inc.severity}
                  </span>
                </div>
              );
            })}
            {card.moreCount && (
              <span style={{ fontSize: 11, color: "#028090", cursor: "pointer", marginTop: 1 }}>
                +{card.moreCount} more incidents
              </span>
            )}
          </div>
        </div>

        {/* Info box */}
        {card.infoBox && (
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #F0F4F5", borderRadius: 6, padding: "8px 10px" }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: card.infoBox.labelColor, display: "block", marginBottom: 4 }}>
              {card.infoBox.label}
            </span>
            <p style={{ fontSize: 11, color: "#000000", margin: 0, lineHeight: 1.55 }}>{card.infoBox.text}</p>
          </div>
        )}

        {/* Signal sources */}
        <div>
          <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#000000", display: "block", marginBottom: 6 }}>
            Detected Via
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {card.signals.map(s => (
              <span key={s} style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.04em", color: "#028090", backgroundColor: "rgba(2,128,144,0.07)", border: "0.5px solid rgba(2,128,144,0.2)", padding: "2px 7px", borderRadius: 4 }}>
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Fix */}
        <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #F0F4F5", borderRadius: 6, padding: "8px 10px" }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#028090", display: "block", marginBottom: 4 }}>
            Fix
          </span>
          <p style={{ fontSize: 11, color: "#000000", margin: 0, lineHeight: 1.55 }}>{card.fix}</p>
        </div>

        {/* NHS impact */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#000000" }}>NHS Impact</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#000000" }}>{card.nhsHours}h absorbed</span>
          </div>
          <div style={{ height: 4, backgroundColor: "#F4F7FA", borderRadius: 2 }}>
            <div style={{ height: "100%", width: `${card.nhsPct}%`, backgroundColor: card.borderColor, borderRadius: 2 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Filter pill ───────────────────────────────────────────────────────────────

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      fontSize: 12, fontWeight: active ? 500 : 400,
      color: active ? "#028090" : "#000000",
      backgroundColor: active ? "rgba(2,128,144,0.07)" : "#FFFFFF",
      border: active ? "1px solid #028090" : "1px solid #F0F4F5",
      borderRadius: 6, padding: "5px 12px", cursor: "pointer", whiteSpace: "nowrap" as const,
    }}>
      {label}
    </button>
  );
}

// ── Tab button ────────────────────────────────────────────────────────────────

function Tab({ label, badge, active, onClick }: { label: string; badge?: number; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      fontSize: 13, fontWeight: active ? 500 : 400,
      color: active ? "#005EB8" : "#000000",
      backgroundColor: "transparent", border: "none",
      borderBottom: active ? "2px solid #028090" : "2px solid transparent",
      padding: "10px 16px", cursor: "pointer",
      display: "flex", alignItems: "center", gap: 6,
    }}>
      {label}
      {badge != null && (
        <span style={{ fontSize: 11, fontWeight: 600, color: active ? "#005EB8" : "#000000", backgroundColor: active ? "#FEF2F2" : "#F4F7FA", padding: "1px 7px", borderRadius: 10 }}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

function RootCausePageInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const tabParam      = searchParams.get("tab");
  const incidentParam = searchParams.get("incident");

  const [pendingApprovals, setPendingApprovals] = useState<Approval[]>([]);
  const [activeTab,     setActiveTab]     = useState<"analysis" | "review">(
    tabParam === "case-review" ? "review" : "analysis"
  );
  const [activeDrug,    setActiveDrug]    = useState("All drugs");
  const [activePathway, setActivePathway] = useState("All");

  // Case review state
  const [selectedCaseId,    setSelectedCaseId]    = useState("ACT-001");
  const [reviewIncident,    setReviewIncident]    = useState<Incident | null>(null);
  const [reviewAuditEntries,setReviewAuditEntries]= useState<AuditEntry[]>([]);
  const [reviewDecision,    setReviewDecision]    = useState("");
  const [reviewRootCause,   setReviewRootCause]   = useState("accept");
  const [reviewNotes,       setReviewNotes]       = useState("");
  const [reviewSubmitting,  setReviewSubmitting]  = useState(false);
  const [reviewedCases,     setReviewedCases]     = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/approvals").then(r => r.json()).then((data: Approval[]) => {
      setPendingApprovals(data);
      if (incidentParam) {
        const match = data.find((a) => a.incidentId === incidentParam);
        if (match) selectCase(match.id);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch incident when case review tab is active or selected case changes
  useEffect(() => {
    if (activeTab !== "review") return;
    const approval = pendingApprovals.find(a => a.id === selectedCaseId);
    const incidentId = approval?.incidentId ?? "INC-00934";
    setReviewIncident(null);
    setReviewAuditEntries([]);
    fetch(`/api/incidents/${incidentId}`)
      .then(r => r.json())
      .then(data => {
        setReviewIncident(data.incident ?? null);
        setReviewAuditEntries(data.auditEntries ?? []);
      });
  }, [activeTab, selectedCaseId, pendingApprovals]);

  async function handleCaseSubmit(forcedDecision?: string) {
    const decision = forcedDecision ?? reviewDecision;
    if (!decision || !reviewIncident) return;
    setReviewSubmitting(true);
    const approval = pendingApprovals.find(a => a.id === selectedCaseId);
    await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        incidentId: approval?.incidentId ?? reviewIncident.id,
        decision,
        rootCause: reviewRootCause,
        evidence: "Accept",
        notes: reviewNotes,
      }),
    });
    setReviewSubmitting(false);
    setReviewedCases(prev => new Set([...prev, selectedCaseId]));
  }

  function selectCase(id: string) {
    setSelectedCaseId(id);
    setReviewDecision("");
    setReviewNotes("");
    setReviewRootCause("accept");
  }

  const drugs    = ["All drugs", "Ultomiris 500mg", "Soliris 300mg", "Strensiq 80mg"];
  const pathways = ["All", "Homecare", "NHS Hospital"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* PAGE HEADER */}
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 500, color: "#005EB8", margin: 0 }}>Root Cause Analysis</h1>
        <p style={{ fontSize: 12, color: "#000000", margin: "4px 0 0 0" }}>
          Last 30 days · 17 delay events · Homecare pathway · Ultomiris, Soliris, Strensiq
        </p>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", borderBottom: "1px solid #F0F4F5", backgroundColor: "#FFFFFF", borderRadius: "8px 8px 0 0", overflow: "hidden", marginBottom: -20 }}>
        <Tab label="Root Cause Analysis" active={activeTab === "analysis"} onClick={() => setActiveTab("analysis")} />
        <Tab label="Case review" badge={pendingApprovals.length} active={activeTab === "review"} onClick={() => setActiveTab("review")} />
      </div>

      {/* ── ANALYSIS TAB ───────────────────────────────────────────────────── */}
      {activeTab === "analysis" && (
        <>
          {/* FILTER ROW */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #F0F4F5", borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#000000", whiteSpace: "nowrap" }}>Drug</span>
              <div style={{ display: "flex", gap: 6 }}>
                {drugs.map(d => <Pill key={d} label={d} active={activeDrug === d} onClick={() => setActiveDrug(d)} />)}
              </div>
            </div>
            <div style={{ width: 1, height: 24, backgroundColor: "#F0F4F5", flexShrink: 0 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#000000", whiteSpace: "nowrap" }}>Pathway</span>
              <div style={{ display: "flex", gap: 6 }}>
                {pathways.map(p => <Pill key={p} label={p} active={activePathway === p} onClick={() => setActivePathway(p)} />)}
              </div>
            </div>
          </div>

          {/* SECTION 1 — KPI CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            <KpiCard label="Silent delay rate"   value="1.3%" valueColor="#005EB8" sub="17 of 1,307 deliveries"  barColor="#005EB8" />
            <KpiCard label="Avg delay duration"  value="4.8h" valueColor="#028090" sub="across all root causes"  barColor="#028090" />
            <KpiCard label="NHS hours absorbed"  value="42.5h" valueColor="#005EB8" sub="staff time lost silently" barColor="#005EB8" />
            <KpiCard label="Complaints filed"    value="0"    valueColor="#005EB8" sub="patients never reported" subColor="#005EB8" barColor="#005EB8" />
          </div>

          {/* SECTION 2 — CHARTS */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #F0F4F5", borderRadius: 10, display: "flex", overflow: "hidden" }}>

            {/* LEFT — Donut */}
            <div style={{ flex: 1, padding: "18px 20px", minWidth: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "#000000", display: "block", marginBottom: 14 }}>
                Delay attribution
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ flexShrink: 0 }}>
                  <PieChart width={180} height={180}>
                    <Pie
                      data={DONUT_DATA}
                      cx={90} cy={90}
                      innerRadius={55} outerRadius={80}
                      dataKey="value"
                      startAngle={90} endAngle={-270}
                      strokeWidth={0}
                    >
                      {DONUT_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      <Label content={DonutCenter} />
                    </Pie>
                    <Tooltip formatter={(v: unknown) => [`${v}%`, "Share"] as [string, string]} contentStyle={chartDefaults.tooltipStyle} labelStyle={chartDefaults.tooltipLabelStyle} itemStyle={chartDefaults.tooltipItemStyle} />
                  </PieChart>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {DONUT_DATA.map(d => (
                    <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: d.color, display: "inline-block", flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: "#000000", flex: 1 }}>{d.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: d.color }}>{d.pct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ width: 1, backgroundColor: "#F4F7FA", flexShrink: 0 }} />

            {/* RIGHT — Horizontal bar */}
            <div style={{ flex: 1, padding: "18px 20px", minWidth: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "#000000", display: "block", marginBottom: 14 }}>
                Avg delay by root cause (hours)
              </span>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart layout="vertical" data={BAR_DATA} margin={{ top: 0, right: 44, bottom: 0, left: 0 }}>
                  <XAxis type="number" domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#F0F4F5" }} tickCount={6} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#000000" }} width={132} />
                  <Tooltip formatter={(v: unknown) => [`${v}h`, "Avg delay"] as [string, string]} cursor={{ fill: "#F8FAFC" }} contentStyle={chartDefaults.tooltipStyle} labelStyle={chartDefaults.tooltipLabelStyle} itemStyle={chartDefaults.tooltipItemStyle} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                    {BAR_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    <LabelList dataKey="value" position="right" formatter={(v: unknown) => `${v}h`} style={{ fontSize: 11, fill: "#000000", fontWeight: 600 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SECTION 3 — ROOT CAUSE CARDS */}
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#000000", display: "block", marginBottom: 12 }}>
              Root cause breakdown
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {CARDS.map(card => (
                <RcCard key={card.id} card={card} onNavigate={id => router.push(`/incidents/${id}`)} />
              ))}
            </div>
          </div>

          {/* SECTION 4 — INSIGHT BANNER */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #F0F4F5", borderRadius: 10, padding: "16px 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#000000", display: "block", marginBottom: 8 }}>Key insight</span>
              <p style={{ fontSize: 12, color: "#000000", margin: 0, lineHeight: 1.65 }}>
                Courier / Traffic alone accounts for 61% of all delay events. Fixing the M6 and M25 SLA closes the majority of the 1.3% gap immediately. Cold Chain causes the longest individual delays despite its low frequency — a single breach costs 8.7h on average.
              </p>
            </div>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#000000", display: "block", marginBottom: 8 }}>Priority actions</span>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {PRIORITIES.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 0", borderBottom: i < 2 ? "0.5px solid #F0F4F5" : "none" }}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.04em", color: "#000000", flexShrink: 0, marginTop: 1 }}>
                      {item.badge}
                    </span>
                    <span style={{ fontSize: 12, color: "#000000", lineHeight: 1.45 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── CASE REVIEW TAB ────────────────────────────────────────────────── */}
      {activeTab === "review" && (
        <div style={{ display: "flex", gap: 14, minHeight: 640 }}>

          {/* LEFT — Case list (260px) */}
          <div style={{ width: 260, flexShrink: 0, backgroundColor: "#FFFFFF", border: "1px solid #F0F4F5", borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid #F0F4F5", backgroundColor: "#F8FAFC", flexShrink: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "#000000" }}>
                Cases awaiting review
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#005EB8", backgroundColor: "#FEF2F2", padding: "1px 6px", borderRadius: 8, marginLeft: 8 }}>
                {pendingApprovals.length}
              </span>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {pendingApprovals.map(a => {
                const isActive   = a.id === selectedCaseId;
                const isReviewed = reviewedCases.has(a.id);
                const sevColor   = a.severity === "CRITICAL" ? "#005EB8" : a.severity === "HIGH" ? "#028090" : "#005EB8";
                return (
                  <div
                    key={a.id}
                    onClick={() => selectCase(a.id)}
                    style={{ padding: "10px 12px 10px 12px", cursor: "pointer", backgroundColor: isActive ? "#F0FFFE" : "transparent", borderBottom: "1px solid #F4F7FA", display: "flex" }}
                  >
                    <div style={{ width: 12, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Severity + ID */}
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: sevColor, display: "inline-block", flexShrink: 0 }} />
                        <span style={{ fontSize: 10, fontFamily: "var(--font-geist-mono), monospace", color: "#028090", fontWeight: 500 }}>{a.incidentId}</span>
                        {isReviewed && <span style={{ fontSize: 9, fontWeight: 700, color: "#028090", backgroundColor: "#F0FDF4", padding: "1px 5px", borderRadius: 3, marginLeft: "auto" }}>DONE</span>}
                      </div>
                      {/* Category */}
                      <div style={{ fontSize: 11, fontWeight: isActive ? 500 : 400, color: "#005EB8", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {a.category}
                      </div>
                      {/* Title */}
                      <div style={{ fontSize: 11, color: "#000000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 4 }}>
                        {a.title}
                      </div>
                      {/* Time remaining */}
                      <span style={{ fontSize: 10, color: "#000000", backgroundColor: "#F8FAFC", border: "1px solid #F0F4F5", borderRadius: 4, padding: "1px 6px" }}>
                        ⏱ {a.timeRemaining} remaining
                      </span>
                    </div>
                    <div style={{ width: 10, flexShrink: 0 }} />
                  </div>
                );
              })}
            </div>
            {/* Human governance note */}
            <div style={{ padding: "10px 12px", borderTop: "1px solid #F0F4F5", backgroundColor: "#FAFBFC", flexShrink: 0 }}>
              <p style={{ fontSize: 10, color: "#000000", margin: 0, lineHeight: 1.5 }}>
                Human involvement — post-action only. Actions have already executed.
              </p>
            </div>
          </div>

          {/* RIGHT — Review workspace */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {!reviewIncident ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 12, color: "#000000" }}>Loading case…</span>
              </div>
            ) : (
              <>
                {/* 1. Case header */}
                <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #F0F4F5", borderRadius: 10, padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-geist-mono), monospace", color: "#028090", fontWeight: 500 }}>{reviewIncident.id}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: (severityStyles[reviewIncident.severity] ?? severityStyles.MEDIUM).text, backgroundColor: (severityStyles[reviewIncident.severity] ?? severityStyles.MEDIUM).bg, border: `0.5px solid ${(severityStyles[reviewIncident.severity] ?? severityStyles.MEDIUM).border}`, padding: "2px 8px", borderRadius: 9999 }}>{reviewIncident.severity}</span>
                    <span style={{ fontSize: 10, color: "#000000" }}>·</span>
                    <span style={{ fontSize: 12, color: "#000000" }}>{reviewIncident.drug}</span>
                    <span style={{ fontSize: 10, color: "#000000" }}>·</span>
                    <span style={{ fontSize: 12, color: "#000000" }}>{reviewIncident.pathway}</span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "#005EB8", margin: 0 }}>
                    {reviewIncident.drug} delivery {reviewIncident.delayHours}h late — infusion postponed {reviewIncident.treatmentPostponedHours}h — {reviewIncident.pathway}
                  </p>
                </div>

                {/* 2. Process steps */}
                <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #F0F4F5", borderRadius: 10, padding: "14px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {[
                      { label: "Detected",    done: true  },
                      { label: "Classified",  done: true  },
                      { label: "Actioned",    done: true  },
                      { label: "Under Review",done: false, active: true },
                      { label: "Closed",      done: false },
                    ].map((step, i, arr) => (
                      <React.Fragment key={i}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: step.done ? "#028090" : step.active ? "#028090" : "#F4F7FA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: step.done || step.active ? "#FFFFFF" : "#F0F4F5" }}>
                            {step.done ? "✓" : i + 1}
                          </div>
                          <span style={{ fontSize: 10, fontWeight: step.active ? 600 : 400, color: step.active ? "#028090" : step.done ? "#000000" : "#000000", whiteSpace: "nowrap" }}>
                            {step.label}
                          </span>
                        </div>
                        {i < arr.length - 1 && (
                          <div style={{ flex: 1, height: 2, backgroundColor: step.done ? "#028090" : "#F4F7FA", margin: "0 6px", marginBottom: 20 }} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* 3. Evidence cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {(["COURIER", "APPT", "NURSE"] as const).filter(t => reviewIncident.dataSources.includes(t)).map(type => {
                    const pill = dataSourceStyles[type] ?? { bg: "#F4F7FA", text: "#000000" };
                    const cfg = {
                      COURIER: { label: "COURIER",     org: reviewIncident.courierName, finding: `Delivery ${reviewIncident.delayHours}h late`, detail: reviewIncident.delayCause },
                      APPT:    { label: "APPOINTMENT", org: reviewIncident.pathway,     finding: "Infusion appointment rescheduled", detail: `${reviewIncident.treatmentPostponedHours}h treatment postponed · patient on critical therapy` },
                      NURSE:   { label: "NURSE",       org: reviewIncident.pathway,     finding: "Nurse visit rebooked", detail: `${Math.floor(reviewIncident.nhsStaffHoursLost)}h ${Math.round((reviewIncident.nhsStaffHoursLost % 1) * 60)}m NHS staff · ${reviewIncident.complaintFiled ? "complaint filed" : "no complaint filed"}` },
                    }[type];
                    return (
                      <div key={type} style={{ backgroundColor: "#FFFFFF", border: "1px solid #F0F4F5", borderRadius: 8, padding: "10px 12px" }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: pill.text, backgroundColor: pill.bg, padding: "1px 6px", borderRadius: 4, display: "inline-block", marginBottom: 5 }}>{cfg.label}</span>
                        <div style={{ fontSize: 10, color: "#000000", marginBottom: 3 }}>{cfg.org}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#005EB8", marginBottom: 4 }}>{cfg.finding}</div>
                        <div style={{ fontSize: 11, color: "#000000", lineHeight: 1.45 }}>{cfg.detail}</div>
                      </div>
                    );
                  })}
                </div>

                {/* 4. Event summary */}
                <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #F0F4F5", borderRadius: 8, padding: "12px 16px" }}>
                  <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "#000000", display: "block", marginBottom: 6 }}>Event summary</span>
                  <p style={{ fontSize: 12, fontStyle: "italic", color: "#000000", margin: 0, lineHeight: 1.65 }}>
                    &ldquo;{reviewIncident.eventSummary}&rdquo;
                  </p>
                </div>

                {/* 5. Reasoning ledger */}
                <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #F0F4F5", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ padding: "10px 14px", borderBottom: "1px solid #F4F7FA", backgroundColor: "#FAFBFC", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#005EB8" }}>Reasoning Ledger</span>
                    <span style={{ fontSize: 9, fontWeight: 600, color: "#000000", backgroundColor: "#F4F7FA", padding: "2px 8px", borderRadius: 4, letterSpacing: "0.05em" }}>APPEND-ONLY</span>
                  </div>
                  {reviewAuditEntries.slice(0, 4).map(entry => (
                    <AuditRow key={entry.id} entry={entry} />
                  ))}
                </div>

                {/* 6. Decision form / success */}
                {reviewedCases.has(selectedCaseId) ? (
                  <div style={{ backgroundColor: "#F0FDF4", border: "0.5px solid #BBF7D0", borderRadius: 10, padding: "20px 18px", textAlign: "center" }}>
                    <div style={{ fontSize: 20, marginBottom: 8 }}>✓</div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#028090", margin: "0 0 6px 0" }}>Review submitted</p>
                    <p style={{ fontSize: 12, color: "#000000", margin: "0 0 12px 0" }}>Appended to Reasoning Ledger for {reviewIncident.id}.</p>
                    <p style={{ fontSize: 11, color: "#000000", margin: 0 }}>Select another case from the left panel to continue.</p>
                  </div>
                ) : (
                  <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #F0F4F5", borderRadius: 10, padding: "16px 18px" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#005EB8", display: "block", marginBottom: 14 }}>Post-action governance decision</span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      {/* Dropdown 1 */}
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#000000", display: "block", marginBottom: 6 }}>Your decision</span>
                        <select value={reviewDecision} onChange={e => setReviewDecision(e.target.value)} style={{ width: "100%", fontSize: 13, color: "#005EB8", backgroundColor: "#FAFBFC", border: "1px solid #F0F4F5", borderRadius: 6, padding: "7px 10px", outline: "none", cursor: "pointer" }}>
                          <option value="">Select decision…</option>
                          <option value="approve">Approve automated action</option>
                          <option value="escalate">Escalate to clinical team</option>
                          <option value="override">Override — manual action taken</option>
                        </select>
                      </div>
                      {/* Dropdown 2 */}
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#000000", display: "block", marginBottom: 6 }}>Root cause classification</span>
                        <select value={reviewRootCause} onChange={e => setReviewRootCause(e.target.value)} style={{ width: "100%", fontSize: 13, color: "#005EB8", backgroundColor: "#FAFBFC", border: "1px solid #F0F4F5", borderRadius: 6, padding: "7px 10px", outline: "none", cursor: "pointer" }}>
                          <option value="accept">Accept — {reviewIncident.rootCause}</option>
                          <option value="override">Override — different root cause</option>
                        </select>
                      </div>
                    </div>
                    {/* Textarea */}
                    <div style={{ marginBottom: 14 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#000000", display: "block", marginBottom: 6 }}>Review notes</span>
                      <textarea value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} placeholder="Add governance notes, context, or follow-up actions…" rows={3} style={{ width: "100%", fontSize: 12, color: "#000000", backgroundColor: "#FAFBFC", border: "1px solid #F0F4F5", borderRadius: 6, padding: "8px 10px", outline: "none", resize: "vertical", fontFamily: "inherit", lineHeight: 1.5, boxSizing: "border-box" }} />
                    </div>
                    {/* Buttons */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => handleCaseSubmit()}
                        disabled={!reviewDecision || reviewSubmitting}
                        style={{ flex: 1, fontSize: 13, fontWeight: 600, color: !reviewDecision || reviewSubmitting ? "#000000" : "#FFFFFF", backgroundColor: !reviewDecision || reviewSubmitting ? "#F0F4F5" : "#005EB8", border: "none", borderRadius: 7, padding: "9px 14px", cursor: !reviewDecision || reviewSubmitting ? "not-allowed" : "pointer" }}
                      >
                        {reviewSubmitting ? "Submitting…" : "Approve & Close →"}
                      </button>
                      <button
                        onClick={() => { setReviewDecision("escalate"); handleCaseSubmit("escalate"); }}
                        disabled={reviewSubmitting}
                        style={{ fontSize: 13, fontWeight: 500, color: "#028090", backgroundColor: "transparent", border: "1px solid #028090", borderRadius: 7, padding: "9px 14px", cursor: "pointer", whiteSpace: "nowrap" }}
                      >
                        Escalate to Clinical
                      </button>
                      <button
                        onClick={() => {}}
                        style={{ fontSize: 13, fontWeight: 400, color: "#000000", backgroundColor: "transparent", border: "1px solid #F0F4F5", borderRadius: 7, padding: "9px 14px", cursor: "pointer", whiteSpace: "nowrap" }}
                      >
                        Save Draft
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default function RootCausePage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, fontSize: 13, color: "#64748B" }}>Loading…</div>}>
      <RootCausePageInner />
    </Suspense>
  );
}

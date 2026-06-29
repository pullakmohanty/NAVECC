"use client";

import { useEffect, useState } from "react";
import { Brain, Truck, HeartPulse, Shield, Bell, X } from "lucide-react";
import type { ElementType } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ConfigField {
  label: string;
  key: string;
  defaultValue: string;
}

interface AgentProfile {
  id: string;
  name: string;
  shortRole: string;
  color: string;
  headerBg: string;
  headerTextWhite: boolean;
  status: "ACTIVE" | "ALERT";
  Icon: ElementType;
  overview: string;
  inputs: string[];
  outputs: string[];
  tools: string[];
  config: ConfigField[];
  currentTask: string;
}

// ── Agent profiles ────────────────────────────────────────────────────────────

const PROFILES: Record<string, AgentProfile> = {
  cpxo: {
    id: "cpxo",
    name: "CPXO Agent",
    shortRole: "Chief Patient Experience Officer",
    color: "#005EB8",
    headerBg: "#005EB8",
    headerTextWhite: true,
    status: "ACTIVE",
    Icon: Brain,
    overview:
      "The CPXO Agent is the top orchestrator of the NavECC platform. It wakes on a 30-second heartbeat, reads all five active data signals simultaneously, scores exception severity, and delegates tasks to specialist agents. It never executes actions directly — it only orchestrates.",
    inputs: [
      "Cell-signal GPS tag feed",
      "Homecare nurse check-in data",
      "Supply chain portal status",
      "Delivery event logs",
      "Email and order data signals",
    ],
    outputs: [
      "Exception records with severity score",
      "Task assignments to specialist agents",
      "Heartbeat cycle log entries",
      "Signal correlation reports",
    ],
    tools: [
      "exception.create",
      "agents.assign",
      "signal.read",
      "severity.score",
      "heartbeat.log",
    ],
    config: [
      { label: "Heartbeat interval", key: "heartbeat", defaultValue: "30 seconds" },
      { label: "Primary goal", key: "goal", defaultValue: "Zero silent delivery failures" },
      { label: "Severity threshold", key: "threshold", defaultValue: "3 sources required" },
    ],
    currentTask:
      "Monitoring 9 open exceptions across UK homecare pathway — cycle #47 active",
  },

  delivery: {
    id: "delivery",
    name: "Delivery Ops Agent",
    shortRole: "Logistics & courier tracking",
    color: "#028090",
    headerBg: "#E6F4F5",
    headerTextWhite: false,
    status: "ACTIVE",
    Icon: Truck,
    overview:
      "The Delivery Ops Agent tracks live courier positions and logistics data. When the CPXO detects a potential delivery exception it activates Delivery Ops to confirm the courier delay, calculate the ETA impact, and identify alternative route options for emergency dispatch decisions.",
    inputs: [
      "Cell-signal GPS courier position",
      "Courier event log checkpoints",
      "Supply chain portal delivery status",
      "Route and traffic data",
    ],
    outputs: [
      "Confirmed courier delay report",
      "ETA delta calculation",
      "Alternative route recommendation",
      "Emergency dispatch trigger",
    ],
    tools: [
      "gps.getPosition",
      "routes.getAlternates",
      "eta.compute",
      "report.create",
      "cpxo.notify",
    ],
    config: [
      { label: "SLA threshold", key: "sla", defaultValue: "4 hours (PNH)" },
      { label: "Trigger", key: "trigger", defaultValue: "Courier delay detected" },
      { label: "Route check", key: "routes", defaultValue: "M6 · M25 · M42" },
    ],
    currentTask:
      "Tracking INC-00934 courier DPD-7741882 — M6 J7-J8 Birmingham — route update pending confirmation",
  },

  clinical: {
    id: "clinical",
    name: "Clinical Risk Agent",
    shortRole: "Patient safety & severity scoring",
    color: "#E05C5C",
    headerBg: "#FFF0F0",
    headerTextWhite: false,
    status: "ALERT",
    Icon: HeartPulse,
    overview:
      "The Clinical Risk Agent assesses patient safety severity for every delivery exception. It checks drug-specific SLA thresholds, evaluates haemolytic crisis risk for PNH patients, and automatically generates MHRA pharmacovigilance flags when delays exceed regulatory thresholds. It is the only agent that can escalate an exception to LIFE-CRITICAL.",
    inputs: [
      "Patient clinical profile",
      "Drug-specific SLA thresholds",
      "Delivery delay duration",
      "Diagnosis and treatment schedule",
    ],
    outputs: [
      "Severity classification (Low / Medium / Life-critical)",
      "MHRA pharmacovigilance flag",
      "Patient risk assessment score",
      "Escalation notification to CPXO",
    ],
    tools: [
      "patient.getProfile",
      "sla.getThreshold",
      "risk.assess",
      "mhra.createFlag",
      "severity.escalate",
      "cpxo.alert",
    ],
    config: [
      { label: "MHRA flag threshold", key: "mhra", defaultValue: "6 hours (PNH)" },
      { label: "Auto-escalate life-critical", key: "autoEscalate", defaultValue: "Yes — automated" },
      { label: "Risk scoring model", key: "riskModel", defaultValue: "PNH · aHUS · HPP" },
    ],
    currentTask:
      "PNH threshold breach confirmed — INC-00934 Ultomiris 500mg delay exceeds 7h SLA — MHRA flag raised",
  },

  compliance: {
    id: "compliance",
    name: "Compliance Agent",
    shortRole: "GDPR & pharma audit",
    color: "#E8A838",
    headerBg: "#FEF9EC",
    headerTextWhite: false,
    status: "ACTIVE",
    Icon: Shield,
    overview:
      "The Compliance Agent handles all regulatory and audit requirements automatically. It pseudonymises patient IDs under GDPR, writes every agent decision to the append-only Reasoning Ledger, and generates MHRA pharmacovigilance entries. No manual logging is ever required — every compliance record is created automatically.",
    inputs: [
      "Exception records from CPXO",
      "Patient identifiers for pseudonymisation",
      "MHRA flag requests from Clinical Risk",
      "Agent action records",
    ],
    outputs: [
      "GDPR-pseudonymised patient tokens",
      "Immutable Reasoning Ledger entries",
      "MHRA pharmacovigilance records",
      "SOC 2 and ISO 27001 audit trail",
    ],
    tools: [
      "gdpr.pseudonymise",
      "ledger.append",
      "mhra.appendFlag",
      "audit.seal",
      "compliance.notify",
    ],
    config: [
      { label: "GDPR mode", key: "gdpr", defaultValue: "Pseudonymise all patient IDs" },
      { label: "Retention period", key: "retention", defaultValue: "7 years" },
      { label: "Ledger", key: "ledger", defaultValue: "Append-only · tamper-proof" },
    ],
    currentTask:
      "MHRA audit entry LOG-00296 appended to Reasoning Ledger for INC-00934 — regulatory entry confirmed",
  },

  engagement: {
    id: "engagement",
    name: "Engagement Agent",
    shortRole: "Alerts & communications",
    color: "#185FA5",
    headerBg: "#EBF2FB",
    headerTextWhite: false,
    status: "ACTIVE",
    Icon: Bell,
    overview:
      "The Engagement Agent manages all outbound alerts and communications. When an exception is confirmed it automatically drafts and sends notifications to homecare nurses, hospital pharmacists, and the Arvion ops team. It ensures the right people are informed at the right time without any manual coordination.",
    inputs: [
      "Exception details from CPXO",
      "Contact list for affected pathway",
      "Notification templates per severity",
      "Delivery ETA updates",
    ],
    outputs: [
      "Homecare nurse delay alert",
      "Hospital pharmacist ETA notification",
      "Arvion ops team exception report",
      "Patient rescheduling confirmation",
    ],
    tools: [
      "contacts.get",
      "alert.draft",
      "alert.send",
      "notifications.dispatch",
      "cpxo.confirm",
    ],
    config: [
      { label: "Notify on", key: "notifyOn", defaultValue: "Critical and High only" },
      { label: "Channels", key: "channels", defaultValue: "Email · SMS · Portal" },
      { label: "Response window", key: "responseWindow", defaultValue: "15 minutes" },
    ],
    currentTask:
      "St Thomas Hospital pharmacist notification queued — Soliris 300mg ETA update — 3 notifications pending dispatch",
  },
};

// Normalize agent IDs from both pages to canonical keys
function resolveProfile(id: string): AgentProfile | null {
  const map: Record<string, string> = {
    cpxo: "cpxo",
    "delivery-ops": "delivery",
    delivery: "delivery",
    "clinical-risk": "clinical",
    clinical: "clinical",
    compliance: "compliance",
    engagement: "engagement",
  };
  const key = map[id];
  return key ? PROFILES[key] : null;
}

// ── CSS ───────────────────────────────────────────────────────────────────────

const MODAL_CSS = `
  @keyframes amFadeIn  { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
  @keyframes amOverlay { from { opacity:0 } to { opacity:1 } }
  .am-overlay { animation: amOverlay 0.18s ease forwards; }
  .am-card    { animation: amFadeIn  0.22s ease forwards; }
  .am-input {
    width: 100%; font-size: 12px; color: #334155;
    border: 0.5px solid #E2E8F0; border-radius: 6px;
    padding: 7px 10px; background: #FFFFFF;
    box-sizing: border-box; font-family: inherit;
  }
  .am-input:focus { border-color: #028090; outline: none; }
`;

// ── Modal component ───────────────────────────────────────────────────────────

interface AgentModalProps {
  agentId: string | null;
  onClose: () => void;
}

export function AgentModal({ agentId, onClose }: AgentModalProps) {
  const profile = agentId ? resolveProfile(agentId) : null;

  // Config editable state — keyed by field key
  const [configValues, setConfigValues] = useState<Record<string, string>>({});

  // Re-init config values when profile changes
  useEffect(() => {
    if (!profile) return;
    const init: Record<string, string> = {};
    for (const field of profile.config) init[field.key] = field.defaultValue;
    setConfigValues(init);
  }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape key
  useEffect(() => {
    if (!agentId) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [agentId, onClose]);

  if (!profile) return null;

  const { name, shortRole, color, headerBg, headerTextWhite, status, Icon, overview, inputs, outputs, tools, config, currentTask } = profile;

  const isAlert  = status === "ALERT";
  const dotColor = isAlert ? "#E05C5C" : "#2D9E6A";
  const statusBg = isAlert ? "#FDECEA" : "#DCFCE7";
  const statusTx = isAlert ? "#C53030" : "#15803D";

  const headingColor  = headerTextWhite ? "#FFFFFF" : "#0D1B3E";
  const subheadColor  = headerTextWhite ? "rgba(255,255,255,0.72)" : "#64748B";
  const xColor        = headerTextWhite ? "#FFFFFF" : "#64748B";

  function Section({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div style={{ padding: "18px 24px", borderBottom: "0.5px solid #E2E8F0" }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "#64748B", marginBottom: 12 }}>
          {label}
        </div>
        {children}
      </div>
    );
  }

  return (
    <>
      <style>{MODAL_CSS}</style>

      {/* Overlay */}
      <div
        className="am-overlay"
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 50,
        }}
      />

      {/* Modal card */}
      <div
        className="am-card"
        onClick={e => e.stopPropagation()}
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 640, maxHeight: "85vh",
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          overflow: "hidden",
          overflowY: "auto",
          zIndex: 51,
          display: "flex",
          flexDirection: "column",
        }}
      >

        {/* ── SECTION 1: Header ── */}
        <div style={{
          backgroundColor: headerBg,
          padding: "20px 24px",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 10, flexShrink: 0,
              backgroundColor: headerTextWhite ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.7)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon size={22} color={headerTextWhite ? "#FFFFFF" : color} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: headingColor, lineHeight: 1.2, marginBottom: 4 }}>
                {name}
              </div>
              <div style={{ fontSize: 12, color: subheadColor }}>{shortRole}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            {/* Status badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              backgroundColor: statusBg, borderRadius: 20,
              padding: "4px 10px",
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                backgroundColor: dotColor, display: "inline-block",
                animation: isAlert ? "pulseDot 1.6s ease-in-out infinite" : "none",
              }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: statusTx, letterSpacing: "0.04em" }}>
                {status}
              </span>
            </div>
            {/* Close */}
            <button
              onClick={onClose}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: 4, display: "flex", alignItems: "center",
              }}
            >
              <X size={18} color={xColor} />
            </button>
          </div>
        </div>

        {/* ── SECTION 2: Overview ── */}
        <Section label="Overview">
          <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.7, margin: 0 }}>
            {overview}
          </p>
        </Section>

        {/* ── SECTION 3: Inputs & Outputs ── */}
        <Section label="Inputs and Outputs">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Inputs */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748B", marginBottom: 10 }}>
                Inputs
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {inputs.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#028090", display: "inline-block", flexShrink: 0, marginTop: 5 }} />
                    <span style={{ fontSize: 12, color: "#334155", lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Divider */}
            <div style={{ borderLeft: "0.5px solid #E2E8F0", paddingLeft: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748B", marginBottom: 10 }}>
                Outputs
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {outputs.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: color, display: "inline-block", flexShrink: 0, marginTop: 5 }} />
                    <span style={{ fontSize: 12, color: "#334155", lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── SECTION 4: Tools ── */}
        <Section label="Tools Available">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {tools.map(tool => (
              <span
                key={tool}
                style={{
                  fontSize: 11, fontFamily: "var(--font-geist-mono), monospace",
                  color: "#334155",
                  border: "0.5px solid #E2E8F0",
                  borderRadius: 4, padding: "3px 9px",
                  backgroundColor: "#F8FAFC",
                }}
              >
                {tool}
              </span>
            ))}
          </div>
        </Section>

        {/* ── SECTION 5: Configuration ── */}
        <Section label="Configuration">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px" }}>
            {config.map(field => (
              <div key={field.key}>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 5 }}>{field.label}</div>
                <input
                  className="am-input"
                  type="text"
                  value={configValues[field.key] ?? field.defaultValue}
                  onChange={e => setConfigValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </Section>

        {/* ── SECTION 6: Current task ── */}
        <Section label="Current Task">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              backgroundColor: dotColor, display: "inline-block",
              flexShrink: 0, marginTop: 4,
              animation: isAlert ? "pulseDot 1.6s ease-in-out infinite" : "none",
            }} />
            <p style={{ fontSize: 13, fontStyle: "italic", color: "#334155", margin: 0, lineHeight: 1.6 }}>
              {currentTask}
            </p>
          </div>
        </Section>

        {/* ── SECTION 7: Footer ── */}
        <div style={{
          padding: "14px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
          backgroundColor: "#F8FAFC",
          borderTop: "0.5px solid #E2E8F0",
        }}>
          <span style={{ fontSize: 11, fontStyle: "italic", color: "#64748B" }}>
            Changes apply immediately
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onClose}
              style={{
                fontSize: 12, fontWeight: 500, color: "#64748B",
                backgroundColor: "#FFFFFF", border: "0.5px solid #E2E8F0",
                borderRadius: 6, padding: "7px 16px", cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              style={{
                fontSize: 12, fontWeight: 500, color: "#FFFFFF",
                backgroundColor: "#005EB8", border: "none",
                borderRadius: 6, padding: "7px 16px", cursor: "pointer",
              }}
            >
              Save changes
            </button>
          </div>
        </div>

      </div>
    </>
  );
}

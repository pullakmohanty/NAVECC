"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Brain, Truck, HeartPulse, Shield, Bell,
  Radar, Package, RefreshCw,
  Check, Play, Plus, Bot, X,
} from "lucide-react";

// ── CSS ───────────────────────────────────────────────────────────────────────

const CSS = `
  @keyframes fadeIn  { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
  @keyframes cpulse  { 0%,100% { opacity:1 } 50% { opacity:0.45 } }
  * { outline: none !important; }

  /* Text color overrides — needed because globals.css forces * { color:#000 !important } */
  .s2-head  { color: #0D1B3E !important; }
  .s2-body  { color: #334155 !important; }
  .s2-muted { color: #64748B !important; }
  .s2-gray  { color: #94A3B8 !important; }
  .s2-teal  { color: #028090 !important; }
  .s2-green { color: #15803D !important; }
  .s2-amber-t { color: #92400E !important; }
  .s2-white { color: #FFFFFF !important; }
  .s2-it    { font-style: italic; }
  .s2-mono  { font-family: var(--font-geist-mono), monospace; }
  .s2-up    { text-transform: uppercase; letter-spacing: 0.06em; }
`;

// ── Use cases (Step 1) ────────────────────────────────────────────────────────

const USE_CASES = [
  {
    id: "silent-delay",
    name: "Silent delivery delay detection",
    desc: "Detect silent delivery delays that NHS staff absorb and never report. Surfaces the invisible 1.3%.",
    agents: ["CPXO", "Delivery Ops", "Clinical Risk", "Compliance", "Engagement"],
    badge: { label: "● Live", color: "#028090", bg: "#F0FDF4" },
    Icon: Radar, iconColor: "#028090", disabled: false,
  },
  {
    id: "nhs-workaround",
    name: "NHS Workaround Quantification",
    desc: "Measure and attribute the hidden hours NHS staff absorb when deliveries fail — quantify the true cost of silent disruption.",
    agents: [],
    badge: { label: "Coming soon", color: "#64748B", bg: "#F4F7FA" },
    Icon: Package, iconColor: "#94A3B8", disabled: true,
  },
  {
    id: "proactive-intervention",
    name: "Proactive Intervention",
    desc: "Predict delivery risk before failure occurs and trigger proactive actions before the NHS supply chain absorbs the disruption.",
    agents: [],
    badge: { label: "Coming soon", color: "#64748B", bg: "#F4F7FA" },
    Icon: RefreshCw, iconColor: "#94A3B8", disabled: true,
  },
  {
    id: "attribution-model",
    name: "Attribution Model",
    desc: "Attribute intervention outcomes back to specific supply chain decisions — measure what worked, what didn't, and why.",
    agents: [],
    badge: { label: "Coming soon", color: "#64748B", bg: "#F4F7FA" },
    Icon: RefreshCw, iconColor: "#94A3B8", disabled: true,
  },
];

// ── Agent definitions ─────────────────────────────────────────────────────────

const CPXO_TOOLS = ["exception.create", "agents.assign", "signal.read"];

interface SubAgentDef {
  id: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  chipBg: string;
  label: string;
  role: string;
  fullWidth?: boolean;
}

const SUB_AGENTS: SubAgentDef[] = [
  { id: "delivery",   Icon: Truck,      color: "#028090", chipBg: "#E6F4F5", label: "Delivery Ops Agent",  role: "Logistics & courier tracking" },
  { id: "clinical",   Icon: HeartPulse, color: "#E05C5C", chipBg: "#FDECEA", label: "Clinical Risk Agent", role: "Patient safety & severity"    },
  { id: "compliance", Icon: Shield,     color: "#E8A838", chipBg: "#FEF9EC", label: "Compliance Agent",    role: "GDPR & pharma audit"          },
  { id: "engagement", Icon: Bell,       color: "#185FA5", chipBg: "#EBF2FB", label: "Engagement Agent",    role: "Alerts & comms", fullWidth: true },
];

const BADGE_META = [
  { id: "cpxo",       label: "CPXO Agent",    color: "#3B3486" },
  { id: "delivery",   label: "Delivery Ops",  color: "#028090" },
  { id: "clinical",   label: "Clinical Risk", color: "#E05C5C" },
  { id: "compliance", label: "Compliance",    color: "#E8A838" },
  { id: "engagement", label: "Engagement",    color: "#185FA5" },
];

// ── Types ─────────────────────────────────────────────────────────────────────

type AgentId     = "delivery" | "clinical" | "compliance" | "engagement";
type AgentStatus = "locked" | "calling" | "active";
type CPXOPhase   = "Configuring" | "Reading instructions" | "Planning pipeline" | "Active — orchestrating";
type SeqState    = "idle" | "running" | "done";

interface LogEntry {
  time: string;
  dot: "amber" | "blue" | "teal" | "gray";
  text: string;
}

const DOT_COLOR: Record<LogEntry["dot"], string> = {
  amber: "#E8A838",
  blue:  "#185FA5",
  teal:  "#028090",
  gray:  "#94A3B8",
};

function nowTs() {
  return new Date().toLocaleTimeString("en-GB", {
    hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

// ── ProgressBar ───────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: 1 | 2 | 3 }) {
  const STEPS = [
    { n: 1, label: "Select use case" },
    { n: 2, label: "Customise agents" },
    { n: 3, label: "Review and launch" },
  ];
  const items: React.ReactNode[] = [];
  STEPS.forEach((s, i) => {
    const done = s.n < step, active = s.n === step;
    items.push(
      <div key={`s${s.n}`} style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
          backgroundColor: done ? "#1d9e75" : active ? "#0D1B3E" : "#E2E8F0",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {done
            ? <Check size={13} color="#FFFFFF" strokeWidth={2.5} />
            : <span className={active ? "s2-white" : "s2-gray"} style={{ fontSize: 13, fontWeight: 600 }}>{s.n}</span>
          }
        </div>
        <span
          className={done ? "s2-green" : active ? "s2-head" : "s2-gray"}
          style={{ fontSize: 13, fontWeight: active ? 600 : 400, whiteSpace: "nowrap" }}
        >
          {s.label}
        </span>
      </div>
    );
    if (i < 2) items.push(
      <div key={`l${i}`} style={{ flex: 1, height: 1, backgroundColor: done ? "#1d9e75" : "#E2E8F0", margin: "0 12px" }} />
    );
  });
  return <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>{items}</div>;
}

// ── StepFooter ────────────────────────────────────────────────────────────────

function StepFooter({ onBack, nextLabel, onNext, nextDisabled }: {
  onBack?: () => void;
  nextLabel: string;
  onNext: () => void;
  nextDisabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "0.5px solid #E2E8F0", marginTop: 4 }}>
      <button
        onClick={onBack}
        className="s2-muted"
        style={{ fontSize: 13, backgroundColor: "transparent", border: "none", cursor: "pointer", padding: "8px 4px" }}
      >
        ← Back
      </button>
      <button
        onClick={nextDisabled ? undefined : onNext}
        disabled={!!nextDisabled}
        className="s2-white"
        style={{
          fontSize: 13, fontWeight: 500,
          backgroundColor: nextDisabled ? "#E2E8F0" : "#0D1B3E",
          border: "none", borderRadius: 8, padding: "9px 18px",
          cursor: nextDisabled ? "default" : "pointer",
        }}
      >
        {nextLabel}
      </button>
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ on }: { on: boolean }) {
  return (
    <div style={{
      width: 34, height: 20, borderRadius: 10, flexShrink: 0,
      backgroundColor: on ? "#1d9e75" : "#E2E8F0",
      position: "relative",
      transition: "background-color 0.25s",
    }}>
      <div style={{
        width: 14, height: 14, borderRadius: "50%", backgroundColor: "#FFFFFF",
        position: "absolute", top: 3, left: on ? 17 : 3,
        transition: "left 0.2s",
      }} />
    </div>
  );
}

// ── SubAgentCard ──────────────────────────────────────────────────────────────

function SubAgentCard({ agent, status, toggle, editHref }: {
  agent: SubAgentDef; status: AgentStatus; toggle: boolean; editHref: string;
}) {
  const locked  = status === "locked";
  const calling = status === "calling";
  const active  = status === "active";

  const pillBg  = active ? "#DCFCE7" : calling ? "#FEF9C3" : "#F4F7FA";
  const pillCls = active ? "s2-green" : calling ? "s2-amber-t" : "s2-gray";
  const pillTxt = active ? "Active" : calling ? "Calling…" : "Waiting for CPXO";

  return (
    <div style={{
      backgroundColor: "#FFFFFF",
      opacity: locked ? 0.42 : 1,
      transition: "opacity 0.4s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px" }}>
        {/* Icon chip */}
        <div style={{
          width: 32, height: 32, borderRadius: 7, flexShrink: 0,
          backgroundColor: agent.chipBg,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <agent.Icon size={16} color={agent.color} />
        </div>

        {/* Name + role — clickable */}
        <Link href={editHref} style={{ flex: 1, minWidth: 0, textDecoration: "none", display: "block" }}>
          <div className="s2-head" style={{ fontSize: 13.5, fontWeight: 500 }}>{agent.label}</div>
          <div className="s2-muted" style={{ fontSize: 11.5 }}>{agent.role}</div>
        </Link>

        {/* Status pill */}
        <span
          className={pillCls}
          style={{
            fontSize: 10, padding: "2px 8px", borderRadius: 10,
            backgroundColor: pillBg, whiteSpace: "nowrap", flexShrink: 0,
            animation: calling ? "cpulse 1.1s infinite" : "none",
          }}
        >
          {pillTxt}
        </span>

        {/* Toggle */}
        <Toggle on={toggle} />

        {/* Edit */}
        <Link
          href={editHref}
          className="s2-teal"
          style={{
            fontSize: 12, backgroundColor: "transparent",
            textDecoration: "none",
            cursor: "pointer", padding: "4px 6px", flexShrink: 0,
          }}
        >
          Edit
        </Link>
      </div>
    </div>
  );
}

// ── Step 2 ────────────────────────────────────────────────────────────────────

const SETUP_AGENT_ROUTES: Record<string, string> = {
  delivery:   "delivery-ops",
  clinical:   "clinical-risk",
  compliance: "compliance",
  engagement: "engagement",
};

function Step2({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const [seq,        setSeq]        = useState<SeqState>("idle");
  const [cpxoPhase,  setCpxoPhase]  = useState<CPXOPhase>("Configuring");
  const [instruction,setInstruction]= useState("Monitor all active UK homecare deliveries for Ultomiris, Soliris, and Strensiq. Detect silent delivery delays before NHS staff absorb them. Flag exceptions at 4-hour SLA breach. Trigger MHRA pharmacovigilance flag at 6 hours for PNH patients.");
  const [instrSrc,   setInstrSrc]   = useState("Awaiting human input…");
  const [statuses,   setStatuses]   = useState<Record<AgentId, AgentStatus>>({
    delivery: "locked", clinical: "locked", compliance: "locked", engagement: "locked",
  });
  const [toggles, setToggles] = useState<Record<AgentId, boolean>>({
    delivery: false, clinical: false, compliance: false, engagement: false,
  });
  const [logs, setLogs] = useState<LogEntry[]>([
    { time: nowTs(), dot: "gray", text: "Waiting for human instruction…" },
  ]);
  const logRef = useRef<HTMLDivElement>(null);

  // Custom agents
  const [customAgents, setCustomAgents] = useState<{ name: string; role: string }[]>([]);
  const [showAddForm,  setShowAddForm]  = useState(false);
  const [newName,      setNewName]      = useState("");
  const [newRole,      setNewRole]      = useState("");

  function addCustomAgent() {
    const n = newName.trim();
    const r = newRole.trim();
    if (!n) return;
    setCustomAgents(p => [...p, { name: n, role: r || "Custom agent" }]);
    setNewName("");
    setNewRole("");
    setShowAddForm(false);
  }

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  function addLog(dot: LogEntry["dot"], text: string) {
    setLogs(p => [...p, { time: nowTs(), dot, text }]);
  }
  function setS(id: AgentId, s: AgentStatus) { setStatuses(p => ({ ...p, [id]: s })); }
  function setT(id: AgentId, v: boolean)      { setToggles(p => ({ ...p, [id]: v })); }

  function runSequence() {
    if (seq !== "idle") return;
    setSeq("running");
    const src = instruction.trim() || "Silent delivery delay — Arvion UK";
    const t   = (ms: number, fn: () => void) => setTimeout(fn, ms);

    // CPXO phase
    t(0,    () => addLog("gray",  "Sequence started. CPXO agent waking…"));
    t(600,  () => { setCpxoPhase("Reading instructions"); addLog("amber", "CPXO reading human instruction…"); });
    t(1500, () => { setCpxoPhase("Planning pipeline");   addLog("amber", "CPXO planning agent pipeline…"); });
    t(2400, () => {
      setCpxoPhase("Active — orchestrating");
      setInstrSrc(src);
      addLog("amber", "Pipeline planned. Initiating agent activation…");
    });

    // Delivery Ops
    t(3000, () => { setS("delivery", "calling"); addLog("blue", "CPXO → Calling Delivery Ops agent…"); });
    t(4400, () => { setS("delivery", "active");  setT("delivery", true);  addLog("teal", "Delivery Ops confirmed online — logistics signal active"); });

    // Clinical Risk
    t(5200, () => { setS("clinical", "calling"); addLog("blue", "CPXO → Calling Clinical Risk agent…"); });
    t(6600, () => { setS("clinical", "active");  setT("clinical", true);  addLog("teal", "Clinical Risk confirmed online — severity scoring ready"); });

    // Compliance
    t(7400, () => { setS("compliance", "calling"); addLog("blue", "CPXO → Calling Compliance agent…"); });
    t(8800, () => { setS("compliance", "active");  setT("compliance", true); addLog("teal", "Compliance confirmed online — audit trail active"); });

    // Engagement
    t(9600,  () => { setS("engagement", "calling"); addLog("blue", "CPXO → Calling Engagement agent…"); });
    t(11000, () => { setS("engagement", "active");  setT("engagement", true); addLog("teal", "Engagement confirmed online — patient comms ready"); });

    // Done
    t(11800, () => {
      setSeq("done");
      addLog("gray", "All agents online. Pipeline active — ready to launch.");
    });
  }

  const cpxoPillBg  = cpxoPhase === "Active — orchestrating" ? "#DCFCE7" : "#F4F7FA";
  const cpxoPillCls = cpxoPhase === "Active — orchestrating" ? "s2-green" : "s2-gray";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeIn 0.25s ease" }}>
      <ProgressBar step={2} />

      {/* ── Header + Run button ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
        <div>
          <div className="s2-head" style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>Customise agents</div>
          <div className="s2-muted" style={{ fontSize: 12 }}>Silent delivery delay detection · 5 agents</div>
        </div>
        <button
          onClick={runSequence}
          disabled={seq !== "idle"}
          className="s2-white"
          style={{
            display: "flex", alignItems: "center", gap: 7,
            fontSize: 13, fontWeight: 500,
            backgroundColor: seq === "done" ? "#185FA5" : "#1d9e75",
            border: "none", borderRadius: 8, padding: "9px 16px",
            cursor: seq === "idle" ? "pointer" : "default",
            transition: "background-color 0.3s",
          }}
        >
          {seq === "done"
            ? <><Check size={14} strokeWidth={2.5} color="#FFFFFF" />Pipeline active</>
            : <><Play  size={14} fill="#FFFFFF" strokeWidth={0}   color="#FFFFFF" />Activate agents →</>
          }
        </button>
      </div>

      {/* ── CPXO card (full width) ── */}
      <div style={{ backgroundColor: "#FFFFFF", border: "0.5px solid #E2E8F0", borderRadius: 10, overflow: "hidden" }}>

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
          <div style={{ width: 32, height: 32, borderRadius: 7, backgroundColor: "#EEEAF8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Brain size={16} color="#3B3486" />
          </div>
          <Link href="/agents/cpxo?from=setup" style={{ flex: 1, minWidth: 0, textDecoration: "none", display: "block" }}>
            <div className="s2-head" style={{ fontSize: 13.5, fontWeight: 500 }}>CPXO Agent</div>
            <div className="s2-muted" style={{ fontSize: 11.5 }}>Chief Patient Experience Officer</div>
          </Link>
          <span
            className={cpxoPillCls}
            style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, backgroundColor: cpxoPillBg, flexShrink: 0, transition: "background-color 0.4s" }}
          >
            {cpxoPhase}
          </span>
          <span className="s2-gray s2-it" style={{ fontSize: 11, flexShrink: 0 }}>Always on</span>
        </div>

        {/* Human instruction — prominent input block */}
        <div style={{ borderTop: "0.5px solid #F0F4F5", padding: "14px 16px", backgroundColor: "#FFFFFF" }}>
          <div style={{ marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="s2-muted s2-up" style={{ fontSize: 10, fontWeight: 600 }}>Your instruction to CPXO</span>
            {instrSrc !== "Awaiting human input…" && (
              <span className="s2-green" style={{ fontSize: 10, fontWeight: 500 }}>✓ Sent to agent</span>
            )}
          </div>
          <textarea
            value={instruction}
            onChange={e => seq === "idle" && setInstruction(e.target.value)}
            placeholder="Type your instruction for the CPXO agent…"
            readOnly={seq !== "idle"}
            rows={4}
            className="s2-body"
            style={{
              width: "100%", fontSize: 13, lineHeight: 1.6,
              border: seq !== "idle" ? "1px solid #E2E8F0" : "1px solid #028090",
              borderRadius: 7, padding: "9px 12px",
              backgroundColor: seq !== "idle" ? "#F8FAFC" : "#FFFFFF",
              resize: "none", boxSizing: "border-box",
              cursor: seq !== "idle" ? "default" : "text",
            }}
          />
        </div>

        {/* Config panel — read-only fields */}
        <div style={{ borderTop: "0.5px solid #F0F4F5", padding: "14px 16px", backgroundColor: "#F8FAFC" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>

            {/* Heartbeat */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="s2-muted" style={{ fontSize: 12, width: 150, flexShrink: 0 }}>Heartbeat interval</span>
              <input type="text" defaultValue="30 seconds" readOnly className="s2-body"
                style={{ fontSize: 12, border: "0.5px solid #F0F4F5", borderRadius: 6, padding: "5px 10px", backgroundColor: "#FFFFFF", width: 180 }} />
            </div>

            {/* Primary goal */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="s2-muted" style={{ fontSize: 12, width: 150, flexShrink: 0 }}>Primary goal</span>
              <input type="text" defaultValue="Zero silent delivery failures" readOnly className="s2-body"
                style={{ fontSize: 12, border: "0.5px solid #F0F4F5", borderRadius: 6, padding: "5px 10px", backgroundColor: "#FFFFFF", width: 260 }} />
            </div>
          </div>

          {/* Tools */}
          <div>
            <span className="s2-muted s2-up" style={{ fontSize: 10, fontWeight: 600, display: "block", marginBottom: 7 }}>
              TOOLS
            </span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {CPXO_TOOLS.map(tool => (
                <span key={tool} className="s2-body s2-mono"
                  style={{ fontSize: 11, backgroundColor: "#FFFFFF", border: "0.5px solid #E2E8F0", padding: "3px 8px", borderRadius: 4 }}>
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sub-agent grid ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1px",
        backgroundColor: "#E2E8F0",
        border: "0.5px solid #E2E8F0",
        borderRadius: 10,
        overflow: "hidden",
      }}>
        {SUB_AGENTS.filter(a => !a.fullWidth).map(agent => (
          <SubAgentCard
            key={agent.id}
            agent={agent}
            status={statuses[agent.id as AgentId]}
            toggle={toggles[agent.id as AgentId]}
            editHref={`/agents/${SETUP_AGENT_ROUTES[agent.id] ?? agent.id}?from=setup`}
          />
        ))}
        {SUB_AGENTS.filter(a => a.fullWidth).map(agent => (
          <div key={agent.id} style={{ gridColumn: "1 / -1" }}>
            <SubAgentCard
              agent={agent}
              status={statuses[agent.id as AgentId]}
              toggle={toggles[agent.id as AgentId]}
              editHref={`/agents/${SETUP_AGENT_ROUTES[agent.id] ?? agent.id}?from=setup`}
            />
          </div>
        ))}

        {/* Custom agents */}
        {customAgents.map((ca, i) => (
          <div key={`custom-${i}`} style={{ gridColumn: "1 / -1", backgroundColor: "#FFFFFF" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px" }}>
              <div style={{ width: 32, height: 32, borderRadius: 7, backgroundColor: "#F4F7FA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Bot size={16} color="#64748B" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="s2-head" style={{ fontSize: 13.5, fontWeight: 500 }}>{ca.name}</div>
                <div className="s2-muted" style={{ fontSize: 11.5 }}>{ca.role}</div>
              </div>
              <span className="s2-muted" style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, backgroundColor: "#F4F7FA" }}>Custom</span>
              <Toggle on={false} />
              <button
                onClick={() => setCustomAgents(p => p.filter((_, j) => j !== i))}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 6px", display: "flex", alignItems: "center" }}
              >
                <X size={13} color="#94A3B8" />
              </button>
            </div>
          </div>
        ))}

        {/* Add custom agent row */}
        <div style={{ gridColumn: "1 / -1", backgroundColor: "#FFFFFF" }}>
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 8,
                padding: "13px 14px", background: "none", border: "none",
                borderTop: customAgents.length > 0 ? "none" : "none",
                cursor: "pointer",
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 7, border: "1.5px dashed #CBD5E1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Plus size={15} color="#94A3B8" />
              </div>
              <span className="s2-muted" style={{ fontSize: 13 }}>Add custom agent</span>
            </button>
          ) : (
            <div style={{ padding: "13px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="s2-muted s2-up" style={{ fontSize: 10, fontWeight: 600 }}>New custom agent</div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                  <span className="s2-muted" style={{ fontSize: 11 }}>Agent name</span>
                  <input
                    autoFocus
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") addCustomAgent(); if (e.key === "Escape") setShowAddForm(false); }}
                    placeholder="e.g. Inventory Agent"
                    className="s2-body"
                    style={{ fontSize: 13, border: "1px solid #028090", borderRadius: 6, padding: "7px 10px", backgroundColor: "#FFFFFF", width: "100%" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                  <span className="s2-muted" style={{ fontSize: 11 }}>Role</span>
                  <input
                    type="text"
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") addCustomAgent(); if (e.key === "Escape") setShowAddForm(false); }}
                    placeholder="e.g. Stock level monitoring"
                    className="s2-body"
                    style={{ fontSize: 13, border: "1px solid #E2E8F0", borderRadius: 6, padding: "7px 10px", backgroundColor: "#FFFFFF", width: "100%" }}
                  />
                </div>
                <button
                  onClick={addCustomAgent}
                  className="s2-white"
                  style={{ fontSize: 12, fontWeight: 500, backgroundColor: "#0D1B3E", border: "none", borderRadius: 6, padding: "8px 14px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  Add agent
                </button>
                <button
                  onClick={() => { setShowAddForm(false); setNewName(""); setNewRole(""); }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 4px", flexShrink: 0 }}
                >
                  <X size={15} color="#94A3B8" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Live log ── */}
      <div style={{ backgroundColor: "#F8FAFC", border: "0.5px solid #E2E8F0", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "8px 14px", borderBottom: "0.5px solid #F0F4F5" }}>
          <span className="s2-muted s2-up" style={{ fontSize: 10, fontWeight: 600 }}>Live log</span>
        </div>
        <div ref={logRef} style={{ maxHeight: 160, overflowY: "auto", padding: "6px 0" }}>
          {logs.map((entry, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "3px 14px" }}>
              <span className="s2-gray s2-mono" style={{ fontSize: 10.5, flexShrink: 0, paddingTop: 3, minWidth: 52 }}>
                {entry.time}
              </span>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                backgroundColor: DOT_COLOR[entry.dot],
                display: "inline-block", flexShrink: 0, marginTop: 5,
              }} />
              <span className="s2-body" style={{ fontSize: 11.5, lineHeight: 1.5 }}>{entry.text}</span>
            </div>
          ))}
        </div>
      </div>

      <StepFooter onBack={onBack} nextLabel="Next — review and launch →" onNext={onNext} />

    </div>
  );
}

// ── Step 1 ────────────────────────────────────────────────────────────────────

function Step1({ selected, onSelect, onNext }: {
  selected: string | null; onSelect: (id: string) => void; onNext: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", animation: "fadeIn 0.25s ease" }}>
      <ProgressBar step={1} />
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 6px 0" }}>Set up your intelligence workspace</h2>
        <p style={{ fontSize: 13, margin: 0 }}>Choose a use case and customise your agents — takes 2 minutes</p>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        {USE_CASES.map(card => {
          const isSel = selected === card.id;
          return (
            <div key={card.id} onClick={() => !card.disabled && onSelect(card.id)}
              style={{
                flex: 1, position: "relative",
                backgroundColor: isSel ? "#F0FBF8" : "#FFFFFF",
                border: card.disabled ? "1.5px dashed #F0F4F5" : isSel ? "1.5px solid #028090" : "1.5px solid #F0F4F5",
                borderRadius: 12, padding: isSel ? "36px 20px 20px" : "20px",
                cursor: card.disabled ? "default" : "pointer", opacity: card.disabled ? 0.5 : 1,
                transition: "border-color 0.15s,background-color 0.15s",
              }}>
              {isSel && (
                <div style={{ position: "absolute", top: 12, left: 12, width: 20, height: 20, borderRadius: "50%", backgroundColor: "#028090", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Check size={11} color="#FFFFFF" strokeWidth={2.5} />
                </div>
              )}
              <div style={{ position: "absolute", top: 12, right: 12, fontSize: 10, fontWeight: 600, color: card.badge.color, backgroundColor: card.badge.bg, padding: "3px 8px", borderRadius: 4 }}>
                {card.badge.label}
              </div>
              <div style={{ marginBottom: 12 }}><card.Icon size={24} color={card.iconColor} /></div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{card.name}</div>
              <div style={{ fontSize: 12, lineHeight: 1.65, marginBottom: card.disabled ? 0 : 16 }}>{card.desc}</div>
              {!card.disabled && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {card.agents.map(a => (
                    <span key={a} style={{ fontSize: 10, fontWeight: 500, color: "#028090", backgroundColor: "#E6F4F5", padding: "2px 7px", borderRadius: 4 }}>{a}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {selected && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "#F0FBF8", border: "1px solid #028090", borderRadius: 8, padding: "10px 14px", marginBottom: 20, animation: "fadeIn 0.2s ease" }}>
          <Check size={14} color="#028090" />
          <span style={{ fontSize: 13 }}>Silent delivery delay detection selected · <strong>5 agents will activate</strong></span>
        </div>
      )}
      <StepFooter nextLabel="Next — customise agents →" onNext={onNext} nextDisabled={!selected} />
    </div>
  );
}

// ── Step 3 ────────────────────────────────────────────────────────────────────

function Step3({ onBack, onLaunch }: { onBack: () => void; onLaunch: () => void }) {
  const SUMMARY = [
    { label: "Use case",           value: "Silent delivery delay detection" },
    { label: "Agents active",      value: "5 agents" },
    { label: "CPXO heartbeat",     value: "Every 30 seconds" },
    { label: "SLA threshold",      value: "4 hours (PNH)" },
    { label: "MHRA flag at",       value: "6 hours (PNH)" },
    { label: "Emergency dispatch", value: "Fully automated" },
    { label: "GDPR mode",          value: "Pseudonymise patient IDs" },
    { label: "Human involvement",  value: "Post-action only" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", animation: "fadeIn 0.25s ease" }}>
      <ProgressBar step={3} />
      <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #F0F4F5", borderRadius: 12, padding: "22px 26px", marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>Your configuration — ready to launch</div>
        {SUMMARY.map((row, i) => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < SUMMARY.length - 1 ? "0.5px solid #F0F4F5" : "none" }}>
            <span style={{ fontSize: 13 }}>{row.label}</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{row.value}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {BADGE_META.map(b => (
          <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "#FFFFFF", border: `1.5px solid ${b.color}`, borderRadius: 20, padding: "5px 12px" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: b.color, display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 500 }}>{b.label}</span>
          </div>
        ))}
      </div>
      <div style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
        <p style={{ fontSize: 13, margin: 0, lineHeight: 1.65 }}>
          <strong>Ready to launch.</strong> Your agent stack will activate immediately. The CPXO agent will begin heartbeat scans every 30 seconds.
        </p>
      </div>
      <StepFooter onBack={onBack} nextLabel="▶  Launch agent stack →" onNext={onLaunch} />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SetupPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const stepParam    = searchParams.get("step");
  const [currentStep,     setCurrentStep]     = useState<1 | 2 | 3>(
    stepParam === "2" ? 2 : stepParam === "3" ? 3 : 1
  );
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);
  const [launching,       setLaunching]       = useState(false);

  const handleLaunch = () => {
    setLaunching(true);
    setTimeout(() => router.push("/how-it-works"), 1200);
  };

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", backgroundColor: "#F4F7FA", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        {launching ? (
          <div style={{ display: "flex", alignItems: "center", gap: 14, backgroundColor: "#F0FDF4", border: "1.5px solid #BBF7D0", borderRadius: 14, padding: "22px 36px", animation: "fadeIn 0.3s ease" }}>
            <Check size={22} color="#028090" strokeWidth={2.5} />
            <span style={{ fontSize: 16, fontWeight: 500 }}>Agent stack launched · CPXO agent is now active</span>
          </div>
        ) : (
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #F0F4F5", borderRadius: 12, padding: 28, width: "100%", maxWidth: 820 }}>
            {currentStep === 1 && <Step1 selected={selectedUseCase} onSelect={setSelectedUseCase} onNext={() => setCurrentStep(2)} />}
            {currentStep === 2 && <Step2 onBack={() => setCurrentStep(1)} onNext={() => setCurrentStep(3)} />}
            {currentStep === 3 && <Step3 onBack={() => setCurrentStep(2)} onLaunch={handleLaunch} />}
          </div>
        )}
      </div>
    </>
  );
}

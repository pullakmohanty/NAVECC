"use client";

import { useState, useEffect, useRef } from "react";
import { Brain, Truck, HeartPulse, Shield, Bell } from "lucide-react";
import type { Agent } from "@/data/mockData";
import type { ElementType } from "react";
import { AgentPanel } from "@/components/ui/AgentPanel";

// ── CSS animations ────────────────────────────────────────────────────────────

const INJECTED_CSS = `
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cpxoPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(59,52,134,0); }
    50%       { box-shadow: 0 0 0 6px rgba(59,52,134,0.25); }
  }
  @keyframes agentFlash {
    0%   { background-color: #FFFFFF; }
    30%  { background-color: #000000; }
    100% { background-color: #FFFFFF; }
  }
  @keyframes pulseDot {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }
  .pulse-dot { animation: pulseDot 1.6s ease-in-out infinite; }
`;

// ── Types ─────────────────────────────────────────────────────────────────────

type LogEntry = { id: number; time: string; msg: string; type: "normal" | "warning" | "critical" };
type ToolCall = { badge: string; color: string; bg: string; label: string };
type LedgerEntry = { id: number; time: string; msg: string; type: LogEntry["type"]; category: string; isNew: boolean };

// ── Static data ───────────────────────────────────────────────────────────────

const TOOL_CALLS: Record<string, ToolCall[]> = {
  "delivery-ops": [
    { badge: "READ",  color: '#000000', bg: "#E6F1FB", label: "Courier GPS · DPD-7741882" },
    { badge: "READ",  color: '#000000', bg: "#E6F1FB", label: "Supply chain portal · INC-00934" },
    { badge: "WRITE", color: '#000000', bg: "#FFF8E1", label: "Exception log · delay +7.2h" },
    { badge: "READ",  color: '#000000', bg: "#E6F1FB", label: "M6 traffic data · J7–J8" },
    { badge: "WRITE", color: '#000000', bg: "#FFF8E1", label: "Route risk score · updated" },
  ],
  "clinical-risk": [
    { badge: "READ",        color: '#000000', bg: "#E6F1FB", label: "Patient record · ARV-05934" },
    { badge: "ALERT WRITE", color: "#005EB8", bg: "#FDECEA", label: "PNH threshold breach · 7h SLA" },
    { badge: "READ",        color: '#000000', bg: "#E6F1FB", label: "Clinical urgency score" },
    { badge: "WRITE",       color: '#000000', bg: "#FFF8E1", label: "Risk assessment · CRITICAL" },
    { badge: "ALERT WRITE", color: "#005EB8", bg: "#FDECEA", label: "MHRA severity flag · raised" },
  ],
  "compliance": [
    { badge: "READ",  color: '#000000', bg: "#E6F1FB", label: "MHRA threshold · 6h limit" },
    { badge: "WRITE", color: '#000000', bg: "#FFF8E1", label: "Reasoning Ledger · append" },
    { badge: "WRITE", color: '#000000', bg: "#FFF8E1", label: "PV Flag · INC-00934" },
    { badge: "READ",  color: '#000000', bg: "#E6F1FB", label: "GDPR audit trail" },
    { badge: "WRITE", color: '#000000', bg: "#FFF8E1", label: "SOC 2 log entry · sealed" },
  ],
  "engagement": [
    { badge: "SEND",   color: "#000000", bg: "#EAF3DE", label: "Homecare nurse · St Thomas'" },
    { badge: "NOTIFY", color: "#000000", bg: "#EAF3DE", label: "Alexion ops · delay alert" },
    { badge: "SEND",   color: "#000000", bg: "#EAF3DE", label: "Pharmacist · INC-00928" },
    { badge: "NOTIFY", color: "#000000", bg: "#EAF3DE", label: "DPD escalation · INC-00934" },
    { badge: "SEND",   color: "#000000", bg: "#EAF3DE", label: "Ward coordinator · alert sent" },
  ],
};

const AGENT_ICONS: Record<string, ElementType> = {
  "delivery-ops":  Truck,
  "clinical-risk": HeartPulse,
  "compliance":    Shield,
  "engagement":    Bell,
};

const INITIAL_LOG: LogEntry[] = [
  { id: 1, time: "09:14:00", msg: "Scan complete · 9 exceptions active",      type: "normal"   },
  { id: 2, time: "09:02:44", msg: "MHRA flag generated · ledger updated",      type: "warning"  },
  { id: 3, time: "08:48:00", msg: "Emergency dispatch confirmed · INC-00934",  type: "critical" },
  { id: 4, time: "08:47:31", msg: "Clinical Risk agent raised ALERT",          type: "warning"  },
  { id: 5, time: "08:47:14", msg: "Exception INC-00934 escalated to CRITICAL", type: "critical" },
];

const LOG_CYCLE: { msg: string; type: LogEntry["type"] }[] = [
  { msg: "Heartbeat complete · 9 exceptions active",                type: "normal"   },
  { msg: "INC-00934 courier position · M6 still stationary",       type: "warning"  },
  { msg: "Signal check · all 5 sources responding",                type: "normal"   },
  { msg: "Clinical Risk threshold check complete",                  type: "warning"  },
  { msg: "Reasoning Ledger sync confirmed",                        type: "normal"   },
];

const LEDGER_CYCLE: { msg: string; type: LogEntry["type"]; category: string }[] = [
  { msg: "INC-00934 courier · M6 J7–J8 still stationary",         type: "warning",  category: "EVENT"    },
  { msg: "MHRA threshold · Ultomiris exceeds 6h limit",            type: "warning",  category: "PV CHECK" },
  { msg: "Reasoning Ledger append confirmed · entry locked",       type: "normal",   category: "LEDGER"   },
  { msg: "Clinical Risk · PNH severity score 9.2 / 10",           type: "critical", category: "CLINICAL" },
  { msg: "Signal heartbeat · all 5 sources responding",           type: "normal",   category: "SIGNAL"   },
  { msg: "Courier GPS · DPD-7741882 position broadcast",          type: "warning",  category: "COURIER"  },
  { msg: "Compliance · GDPR audit trail updated · INC-00934",     type: "normal",   category: "AUDIT"    },
  { msg: "Engagement · pharmacist pre-notification queued",       type: "normal",   category: "NOTIFY"   },
];

const CAT_STYLE: Record<string, { color: string; bg: string }> = {
  EVENT:    { color: "#005EB8", bg: "#EEEDFE" },
  "PV CHECK":{ color: '#000000', bg: "#FFF8E1" },
  LEDGER:   { color: '#000000', bg: "#E6F1FB" },
  CLINICAL: { color: "#005EB8", bg: "#FDECEA" },
  SIGNAL:   { color: "#028090", bg: "#E1F3F5" },
  COURIER:  { color: '#000000', bg: "#E6F1FB" },
  AUDIT:    { color: "#000000", bg: "#EAF3DE" },
  NOTIFY:   { color: "#000000", bg: "#EAF3DE" },
};

const INITIAL_AGES: Record<string, number> = {
  "cell-signal": 240, "homecare-checkins": 720,
  "delivery-event-logs": 60, "supply-chain-portal": 480, "email-order-data": 1320,
};
const SIGNAL_INTERVALS: Record<string, number> = {
  "cell-signal": 240, "homecare-checkins": 720,
  "delivery-event-logs": 60, "supply-chain-portal": 480, "email-order-data": 1320,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtAge(sec: number): string {
  if (sec < 10) return "just now";
  if (sec < 60) return `${sec}s ago`;
  return `${Math.floor(sec / 60)} min ago`;
}
function fmtTime(d: Date): string { return d.toTimeString().slice(0, 8); }

const logColor: Record<LogEntry["type"], string> = {
  normal: "#028090", warning: "#028090", critical: "#005EB8",
};

// ── Enable/disable toggle switch ────────────────────────────────────────────

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

// ── Agent card ────────────────────────────────────────────────────────────────

function AgentCard({
  agent, flashing, toolCalls, callIdx, onOpenModal, enabled, onToggleEnabled,
}: {
  agent: Agent; flashing: boolean;
  toolCalls: ToolCall[]; callIdx: number;
  onOpenModal: () => void;
  enabled: boolean; onToggleEnabled: () => void;
}) {
  const isAlert  = agent.status === "ALERT";
  const dotColor = isAlert ? "#005EB8" : "#028090";
  const Icon       = AGENT_ICONS[agent.id] ?? Shield;

  const visible = [0, 1, 2].map(
    offset => toolCalls[(callIdx - offset + toolCalls.length) % toolCalls.length]
  );

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #F0F4F5",
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        opacity: enabled ? 1 : 0.5,
        transition: "opacity 0.3s ease",
        animation: flashing ? "agentFlash 0.8s ease" : undefined,
      }}
    >
      <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Row 1: icon + name/role + status */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={onOpenModal}>
            <Icon size={18} color={agent.color} style={{ flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#005EB8", display: "block", lineHeight: 1.2 }}>{agent.name}</span>
              <span style={{ fontSize: 11, color: "#000000" }}>{agent.role}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0, marginTop: 2 }}>
            <span
              className={isAlert ? "pulse-dot" : undefined}
              style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: dotColor, display: "inline-block" }}
            />
            <span style={{ fontSize: 11, fontWeight: 600, color: dotColor }}>{agent.status}</span>
          </div>
        </div>

        {/* Row 1b: enable/disable badge + toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10,
            backgroundColor: enabled ? "#EAF3DE" : "#F4F7FA",
            color: enabled ? "#000000" : "#64748B",
          }}>
            {enabled ? "Active" : "Inactive"}
          </span>
          <button
            onClick={onToggleEnabled}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}
          >
            <Toggle on={enabled} />
          </button>
        </div>

        {/* Row 2: heartbeat */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 11, color: "#000000" }}>Last heartbeat</span>
          <span style={{ fontSize: 11, color: "#000000", fontFamily: "var(--font-geist-mono), monospace" }}>{agent.lastHeartbeat}</span>
        </div>

        {/* Row 3: current task */}
        <p style={{ fontSize: enabled ? 12 : 11, fontStyle: "italic", color: enabled ? "#000000" : "#64748B", margin: 0, lineHeight: 1.5 }}>
          {enabled ? agent.currentTask : "Waiting for activation"}
        </p>

        {/* Row 4: tool calls */}
        <div>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#000000", display: "block", marginBottom: 6 }}>
            Tool calls
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {visible.map((call, i) => (
              <div
                key={`${callIdx}-${i}`}
                style={{ display: "flex", alignItems: "center", gap: 6, animation: i === 0 ? "slideIn 0.3s ease" : undefined }}
              >
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.04em", color: call.color, backgroundColor: call.bg, padding: "1px 6px", borderRadius: 4, flexShrink: 0, whiteSpace: "nowrap" }}>
                  {call.badge}
                </span>
                <span style={{ fontSize: 11, color: "#000000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {call.label}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AgentsPage() {
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [liveAgents,  setLiveAgents]  = useState<Agent[]>([]);
  const [liveSignals, setLiveSignals] = useState<Array<{ id: string; name: string; type: string; lastPing: string; status: string }>>([]);
  const [signalAges,  setSignalAges]  = useState<Record<string, number>>(INITIAL_AGES);
  const [heartbeatAge,   setHeartbeatAge]   = useState(60);

  const [agentFlash,     setAgentFlash]     = useState(false);
  const [liveLog,        setLiveLog]        = useState<LogEntry[]>(INITIAL_LOG);
  const [ledgerEntries,  setLedgerEntries]  = useState<LedgerEntry[]>([]);
  const [toolCallIdx,    setToolCallIdx]    = useState<Record<string, number>>({ "delivery-ops": 0, "clinical-risk": 0, "compliance": 0, "engagement": 0 });

  const [agentEnabled, setAgentEnabled] = useState<Record<string, boolean>>({
    "delivery-ops": true,
    "clinical-risk": true,
    "compliance": true,
    "engagement": true,
  });
  function toggleAgent(id: string) {
    setAgentEnabled(prev => ({ ...prev, [id]: !prev[id] }));
  }

  const logIdRef    = useRef(100);
  const logCycleRef = useRef(0);
  const ledgerIdxRef= useRef(0);

  // Fetch agents (poll 30s)
  useEffect(() => {
    function load() { fetch("/api/agents").then(r => r.json()).then(setLiveAgents); }
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  // Fetch signals
  useEffect(() => {
    fetch("/api/signals").then(r => r.json()).then(data => {
      setLiveSignals(data);
      setSignalAges(prev => {
        const next = { ...prev };
        for (const src of data) {
          if (src.lastPingAgeMs !== undefined) next[src.id] = Math.floor(src.lastPingAgeMs / 1000);
        }
        return next;
      });
    });
  }, []);

  // 1s tick
  useEffect(() => {
    const id = setInterval(() => {
      setSignalAges(prev => { const next = { ...prev }; Object.keys(next).forEach(k => (next[k] += 1)); return next; });
      setHeartbeatAge(a => a + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Signal source refresh
  useEffect(() => {
    const ids = Object.entries(SIGNAL_INTERVALS).map(([srcId, secs]) =>
      setInterval(() => setSignalAges(prev => ({ ...prev, [srcId]: 0 })), secs * 1000)
    );
    return () => ids.forEach(clearInterval);
  }, []);

  // 30s heartbeat
  useEffect(() => {
    const id = setInterval(() => {
      setHeartbeatAge(0);
      setAgentFlash(true); setTimeout(() => setAgentFlash(false), 800);
      const time = fmtTime(new Date());
      logIdRef.current += 1;
      const entry = LOG_CYCLE[logCycleRef.current % LOG_CYCLE.length];
      logCycleRef.current += 1;
      setLiveLog(prev => [{ id: logIdRef.current, time, ...entry }, ...prev].slice(0, 6));
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  // 4s tool call rotation
  useEffect(() => {
    const id = setInterval(() => {
      setToolCallIdx(prev => {
        const next = { ...prev };
        for (const agentId of Object.keys(TOOL_CALLS)) {
          next[agentId] = ((prev[agentId] ?? 0) + 1) % TOOL_CALLS[agentId].length;
        }
        return next;
      });
    }, 4000);
    return () => clearInterval(id);
  }, []);

  // 8s reasoning ledger entries
  useEffect(() => {
    const id = setInterval(() => {
      const entry = LEDGER_CYCLE[ledgerIdxRef.current % LEDGER_CYCLE.length];
      ledgerIdxRef.current += 1;
      logIdRef.current += 1;
      const time = fmtTime(new Date());
      setLedgerEntries(prev => [
        { id: logIdRef.current, time, ...entry, isNew: true },
        ...prev.map(e => ({ ...e, isNew: false })),
      ].slice(0, 6));
    }, 8000);
    return () => clearInterval(id);
  }, []);


  const cpxo        = liveAgents[0];
  const specialists = liveAgents.slice(1);

  if (!cpxo) return null;

  const heartbeatLabel = heartbeatAge < 10 ? "just now" : fmtAge(heartbeatAge);

  return (
    <>
      <style>{INJECTED_CSS}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── HEADER ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 500, color: "#005EB8", margin: 0 }}>Agent Monitor</h1>
            <p style={{ fontSize: 12, color: "#000000", margin: "4px 0 0 0" }}>
              CPXO orchestration · Silent Delivery Delay Detection · real-time status
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "#F0FDF4", border: "0.5px solid #BBF7D0", borderRadius: 6, padding: "6px 12px" }}>
            <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#028090", display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#028090", letterSpacing: "0.06em" }}>LIVE</span>
          </div>
        </div>

        {/* ── CPXO FULL-WIDTH CARD ── */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            padding: "22px 28px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 24,
            border: "1px solid #F0F4F5",
          }}
        >
          {/* Left */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Brain size={20} color="#005EB8" style={{ flexShrink: 0 }} />
              <div style={{ cursor: "pointer" }} onClick={() => setActivePanel("cpxo")}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#000000", margin: 0, lineHeight: 1.2 }}>{cpxo.name}</h2>
                <span style={{ fontSize: 11, color: "#000000" }}>{cpxo.role} · never executes directly</span>
              </div>
              <div style={{ marginLeft: 12, display: "flex", alignItems: "center", gap: 5 }}>
                <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#028090", display: "inline-block" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#028090", letterSpacing: "0.04em" }}>ACTIVE</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: "#000000" }}>Last heartbeat</span>
              <span style={{ fontSize: 11, color: "#000000", fontFamily: "var(--font-geist-mono), monospace" }}>{heartbeatLabel}</span>
            </div>
            <p style={{ fontSize: 13, fontStyle: "italic", color: "#000000", margin: 0, lineHeight: 1.5 }}>
              &ldquo;{cpxo.currentTask}&rdquo;
            </p>
          </div>

        </div>

        {/* ── 2×2 SPECIALIST AGENT GRID ── */}
        <div>
          <span style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#000000", display: "block", marginBottom: 12 }}>
            Specialist agents
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {specialists.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                flashing={agentFlash}
                toolCalls={TOOL_CALLS[agent.id] ?? []}
                callIdx={toolCallIdx[agent.id] ?? 0}
                onOpenModal={() => setActivePanel(agent.id)}
                enabled={agentEnabled[agent.id] ?? true}
                onToggleEnabled={() => toggleAgent(agent.id)}
              />
            ))}
          </div>
        </div>

        {/* ── THREE BOTTOM PANELS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, alignItems: "flex-start" }}>

          {/* 1. Active data signals */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #F0F4F5", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #F0F4F5", backgroundColor: "#FAFBFC", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#005EB8" }}>Active data signals</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#028090", backgroundColor: "#EAF3DE", padding: "1px 7px", borderRadius: 4 }}>LIVE</span>
            </div>
            {liveSignals.map((src, i) => (
              <div key={src.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: i < liveSignals.length - 1 ? "0.5px solid #F4F7FA" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#028090", display: "inline-block", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "#005EB8" }}>{src.name}</span>
                </div>
                <span style={{ fontSize: 11, color: "#000000", fontFamily: "var(--font-geist-mono), monospace", flexShrink: 0 }}>
                  {fmtAge(signalAges[src.id] ?? 0)}
                </span>
              </div>
            ))}
          </div>

          {/* 2. Heartbeat log */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #F0F4F5", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #F0F4F5", backgroundColor: "#FAFBFC", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#005EB8" }}>Heartbeat log</span>
              <span style={{ fontSize: 11, color: "#000000" }}>Every 30s</span>
            </div>
            {liveLog.map((entry, i) => (
              <div key={entry.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 16px", borderBottom: i < liveLog.length - 1 ? "0.5px solid #F4F7FA" : "none", animation: i === 0 ? "slideIn 0.4s ease" : undefined }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: logColor[entry.type], flexShrink: 0, marginTop: 4 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: "#005EB8", margin: "0 0 2px 0", lineHeight: 1.4 }}>{entry.msg}</p>
                  <span style={{ fontSize: 10, color: "#000000", fontFamily: "var(--font-geist-mono), monospace" }}>{entry.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 3. Reasoning Ledger */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #F0F4F5", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #F0F4F5", backgroundColor: "#FAFBFC", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#005EB8" }}>Reasoning Ledger</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: "#000000", backgroundColor: "#F4F7FA", padding: "1px 7px", borderRadius: 4, letterSpacing: "0.05em" }}>APPEND-ONLY</span>
            </div>

            {ledgerEntries.length === 0 ? (
              <div style={{ padding: "20px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#028090", display: "inline-block", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#000000", fontStyle: "italic" }}>Waiting for next entry…</span>
              </div>
            ) : (
              ledgerEntries.map((entry, i) => {
                const cat = CAT_STYLE[entry.category] ?? { color: "#000000", bg: "#F4F7FA" };
                return (
                  <div
                    key={entry.id}
                    style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 16px", borderBottom: i < ledgerEntries.length - 1 ? "0.5px solid #F4F7FA" : "none", animation: entry.isNew ? "slideIn 0.4s ease" : undefined, backgroundColor: entry.isNew ? "#FAFFFE" : "#FFFFFF", transition: "background-color 1.5s ease" }}
                  >
                    <div style={{ flexShrink: 0, marginTop: 1 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: cat.color, backgroundColor: cat.bg, padding: "1px 5px", borderRadius: 3, whiteSpace: "nowrap" }}>
                        {entry.category}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, color: "#000000", margin: "0 0 2px 0", lineHeight: 1.45 }}>{entry.msg}</p>
                      <span style={{ fontSize: 10, color: "#000000", fontFamily: "var(--font-geist-mono), monospace" }}>{entry.time}</span>
                    </div>
                  </div>
                );
              })
            )}

            {/* Footer pulse */}
            <div style={{ padding: "8px 16px", borderTop: "0.5px solid #F4F7FA", display: "flex", alignItems: "center", gap: 6 }}>
              <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#028090", display: "inline-block" }} />
              <span style={{ fontSize: 10, color: "#000000" }}>CPXO monitoring · {heartbeatLabel}</span>
            </div>
          </div>

        </div>

        {/* ── ARCHITECTURE NOTE ── */}
        <div style={{ padding: "10px 16px", backgroundColor: "#F8FAFC", border: "0.5px dashed #F0F4F5", borderRadius: 8 }}>
          <span style={{ fontSize: 11, color: "#000000" }}>
            All actions are fully automated and policy-matched. Human involvement is post-action only. Review exceptions in the{" "}
            <span style={{ color: "#028090" }}>Audit Log</span>.
          </span>
        </div>

      </div>

      <AgentPanel key={activePanel ?? "closed"} agentId={activePanel} onClose={() => setActivePanel(null)} />

    </>
  );
}

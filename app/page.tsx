"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  Pill, Folder,
  Paperclip, AtSign, ArrowUp, MessageCircle, Minus,
} from "lucide-react";
import type { AuditEntry, Incident, Agent } from "@/data/mockData";
import { pendingApprovals } from "@/data/mockData";

// ─── Brand ─────────────────────────────────────────────────────────────────
const PUR = "#028090";

const REGIONS = [
  {c:"M", n:"Midlands"  },{c:"L",  n:"London"    },
  {c:"N", n:"NW England"},{c:"SE", n:"South East"},
  {c:"Y", n:"Yorkshire" },{c:"SW", n:"South West"},
];


// ─── Helpers ───────────────────────────────────────────────────────────────
function delayColor(h: number) {
  return h >= 6 ? "#dc2626" : h >= 3 ? "#d97706" : "#16a34a";
}
function tagStyle(_src: string) { return {}; }
function dotColor(sev: string) {
  if (sev === "CRITICAL") return "#dc2626";
  if (sev === "HIGH")     return "#d97706";
  return "#3b82f6";
}

// ─── Agent popup config ────────────────────────────────────────────────────
type AgentCfg = {
  initials: string;
  stripBg:  string;
  stats:    { label: string; value: string }[];
  responsibilities: { label: string; detail: string }[];
  workFilter: (e: AuditEntry) => boolean;
};

const AGENT_CONFIG: Record<string, AgentCfg> = {
  "cpxo": {
    initials: "CX",
    stripBg:  "#F5F3FF",
    stats: [
      { label: "Signals active",  value: "5/5"                  },
      { label: "Last heartbeat",  value: "1 min ago"            },
      { label: "Monitoring",      value: "9 open exceptions"    },
    ],
    responsibilities: [
      { label: "Wakes on heartbeat",               detail: "Scans all 5 active data signals every cycle — logistics, scheduling, delivery status" },
      { label: "Correlates 3 signal types",        detail: "Real-time logistics · Treatment scheduling · Delivery status — all five sources read simultaneously" },
      { label: "Detects silent exceptions",        detail: "Identifies delay before NHS staff absorb it — bypasses the silence that hides the 1.3% failure rate" },
      { label: "Scores severity",                  detail: "Classifies every exception as LOW · MEDIUM · LIFE-CRITICAL against clinical urgency thresholds" },
      { label: "Delegates to 4 specialist agents", detail: "Packages full goal ancestry and assigns Delivery Ops, Clinical Risk, Compliance, Engagement — all in parallel" },
      { label: "Never executes directly",          detail: "CPXO is the orchestrator only — every action is taken by a specialist agent or the automated action engine" },
    ],
    workFilter: (e) => e.description.toLowerCase().includes("cpxo"),
  },
  "delivery-ops": {
    initials: "DO",
    stripBg:  "#E6F7F9",
    stats: [
      { label: "Active courier",   value: "DPD-7741882"         },
      { label: "Route",            value: "M6 · J7–J8 Birmingham" },
      { label: "ETA delta",        value: "+7.2h vs window"     },
    ],
    responsibilities: [
      { label: "Reads cell-signal GPS tags",        detail: "Polls live courier position and drug temperature every few minutes via cell-signal tag data" },
      { label: "Detects courier delay",             detail: "Identifies stationary couriers, route deviations, and missed checkpoint scans against expected delivery windows" },
      { label: "Confirms exception from logistics", detail: "Cross-references DPD/DHL live feed with delivery event logs — position freeze + missed scan = confirmed delay" },
      { label: "Calculates ETA delta",             detail: "Computes delay duration against the scheduled infusion window and reports to CPXO for severity scoring" },
      { label: "Maps live courier position",        detail: "Tracks route segment, last known location, and nearest depot for emergency re-dispatch decisions" },
    ],
    workFilter: (e) =>
      e.category === "ROOT_CAUSE" ||
      e.category === "ACTION_TAKEN" ||
      e.description.toLowerCase().includes("delivery ops"),
  },
  "clinical-risk": {
    initials: "CR",
    stripBg:  "#FEF2F2",
    stats: [
      { label: "Active breach",    value: "INC-00934"           },
      { label: "Delay vs SLA",     value: "7.2h (threshold 6h)" },
      { label: "Drug / condition", value: "Ultomiris · PNH"     },
    ],
    responsibilities: [
      { label: "Assesses patient safety severity",  detail: "Scores each exception against the clinical urgency of the patient's condition — PNH, aHUS, HPP have different thresholds" },
      { label: "Flags life-critical breaches",      detail: "Raises LIFE-CRITICAL when delay exceeds the MHRA 6h reporting threshold for PNH or treatment postponement risk is high" },
      { label: "Scores clinical urgency",           detail: "Generates a numeric urgency score that drives the automated action tier — LOW, MEDIUM, or LIFE-CRITICAL" },
      { label: "Monitors treatment postponement",   detail: "Tracks hours postponed against infusion window — determines whether rescheduling is safe or patient is at immediate risk" },
      { label: "Reports to CPXO for action tier",  detail: "Sends severity classification back to CPXO to select the correct automated response — expedite, dispatch, or monitor" },
    ],
    workFilter: (e) =>
      e.category === "PV_FLAG" ||
      e.description.toLowerCase().includes("clinical risk") ||
      e.description.toLowerCase().includes("pnh") ||
      e.description.toLowerCase().includes("threshold") ||
      e.description.toLowerCase().includes("clinical pharmacist"),
  },
  "compliance": {
    initials: "CO",
    stripBg:  "#FFFBEB",
    stats: [
      { label: "Ledger entries",   value: "148 total"           },
      { label: "MHRA flags raised", value: "1 this cycle"       },
      { label: "Standards",        value: "SOC 2 · ISO 27001 · GDPR" },
    ],
    responsibilities: [
      { label: "Logs every exception to the Reasoning Ledger", detail: "Append-only write — every signal, decision, action, and outcome recorded automatically with timestamp" },
      { label: "Generates MHRA pharmacovigilance flags",       detail: "Raises a regulator-facing PV flag when delay exceeds reporting threshold — no manual trigger needed" },
      { label: "Prepares GDPR-compliant audit trail",          detail: "All entries are GDPR-ready, patient-ref anonymised for regulator-facing output, and tamper-proof" },
      { label: "Maintains SOC 2 / ISO 27001 / HIPAA records",  detail: "Ensures every action is logged with enough provenance for an external compliance audit or MHRA inspection" },
      { label: "Zero manual logging",                          detail: "No NHS staff or supply chain team member needs to write anything — Compliance agent handles the full record automatically" },
    ],
    workFilter: (e) =>
      e.isMHRAFlag === true ||
      e.description.toLowerCase().includes("mhra") ||
      e.description.toLowerCase().includes("pharmacovigilance") ||
      e.description.toLowerCase().includes("ledger") ||
      e.description.toLowerCase().includes("audit entry"),
  },
  "engagement": {
    initials: "EN",
    stripBg:  "#EFF6FF",
    stats: [
      { label: "Alerts queued",    value: "3 pending"           },
      { label: "Last action",      value: "5 min ago"           },
      { label: "Notified",         value: "St Thomas pharmacist" },
    ],
    responsibilities: [
      { label: "Drafts homecare nurse alerts",       detail: "Auto-generates a notification to the homecare nurse when a delivery exception is confirmed — includes drug, delay, and rescheduling options" },
      { label: "Notifies Arvion / Alexion ops team", detail: "Sends a structured alert to the manufacturer ops team so they have visibility before any complaint is filed" },
      { label: "Queues pharmacy notifications",      detail: "Schedules pharmacist sign-off request when drug integrity may be affected — cold chain or long delay triggers this path" },
      { label: "Manages treatment rescheduling",     detail: "Coordinates with homecare and hospital teams to find an alternative infusion window and confirms the updated slot" },
      { label: "Sends post-resolution confirmation", detail: "Closes the loop with a final confirmation ping once treatment is completed — outcome written to Reasoning Ledger" },
    ],
    workFilter: (e) =>
      e.description.toLowerCase().includes("pharmacist") ||
      e.description.toLowerCase().includes("ops team") ||
      e.description.toLowerCase().includes("treatment window") ||
      e.description.toLowerCase().includes("ward pharmacist"),
  },
};

// ─── Agent popup ───────────────────────────────────────────────────────────
function AgentPopup({
  agentId, onClose, agents, auditLog,
}: {
  agentId: string;
  onClose: () => void;
  agents: Agent[];
  auditLog: AuditEntry[];
}) {
  const agent = agents.find(a => a.id === agentId);
  const cfg   = AGENT_CONFIG[agentId];
  if (!agent || !cfg) return null;
  const work = auditLog.filter(cfg.workFilter);
  const statusColor = agent.status === "ALERT" ? "#dc2626" : "#a3e635";

  return (
    <div
      onClick={onClose}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center"}}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{width:560,background:"#fff",borderRadius:14,overflow:"hidden",maxHeight:"82vh",display:"flex",flexDirection:"column"}}
      >
        {/* Header */}
        <div style={{background:agent.color,padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:38,height:38,borderRadius:"50%",background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",flexShrink:0}}>
              {cfg.initials}
            </div>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>{agent.name}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.55)",marginTop:2}}>{agent.role} · Navedas Intelligence</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:10,fontWeight:700,background:"rgba(255,255,255,0.12)",color:statusColor,padding:"3px 10px",borderRadius:20,display:"flex",alignItems:"center",gap:5}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:statusColor,flexShrink:0,display:"inline-block"}}/>
              {agent.status}
            </span>
            <button
              onClick={onClose}
              style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:6,width:28,height:28,cursor:"pointer",color:"rgba(255,255,255,0.7)",fontSize:18,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center"}}
            >×</button>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{background:cfg.stripBg,borderBottom:"1px solid #F0F4F5",padding:"8px 20px",display:"flex",gap:24,flexShrink:0,flexWrap:"wrap"}}>
          {cfg.stats.map(s => (
            <div key={s.label} style={{fontSize:10,color:"#000000"}}>
              {s.label}: <strong style={{color:agent.color}}>{s.value}</strong>
            </div>
          ))}
          <div style={{fontSize:10,color:"#000000"}}>
            Last heartbeat: <strong style={{color:agent.color}}>{agent.lastHeartbeat}</strong>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{flex:1,overflowY:"auto",padding:"18px 20px",display:"flex",flexDirection:"column",gap:20}}>
          {/* Responsibilities */}
          <div>
            <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.7px",color:"#000000",marginBottom:10}}>Responsibilities</div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {cfg.responsibilities.map(r => (
                <div key={r.label} style={{display:"flex",gap:10,padding:"9px 12px",background:"#FAFBFC",border:"0.5px solid #F0F4F5",borderRadius:8,alignItems:"flex-start"}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:agent.color,flexShrink:0,marginTop:5}}/>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:"#005EB8"}}>{r.label}</div>
                    <div style={{fontSize:11,color:"#000000",marginTop:1,lineHeight:1.45}}>{r.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent work */}
          <div>
            <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.7px",color:"#000000",marginBottom:10}}>
              Recent work <span style={{fontSize:9,color:"#F0F4F5",fontWeight:400,textTransform:"none",letterSpacing:0}}>— {work.length} events</span>
            </div>
            {work.length === 0 ? (
              <div style={{fontSize:11,color:"#000000",padding:"12px 0"}}>No recent log entries.</div>
            ) : (
              <div style={{border:"0.5px solid #F0F4F5",borderRadius:8,overflow:"hidden"}}>
                {work.map((entry, i) => {
                  const dt   = new Date(entry.timestamp);
                  const time = dt.toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" });
                  const date = dt.toLocaleDateString("en-GB", { day:"numeric", month:"short" });
                  return (
                    <div
                      key={entry.id}
                      style={{display:"flex",gap:12,padding:"10px 14px",borderBottom:i < work.length - 1 ? "0.5px solid #F4F7FA" : "none",alignItems:"flex-start"}}
                    >
                      <div style={{flexShrink:0,textAlign:"right",minWidth:46}}>
                        <div style={{fontSize:10,color:"#000000",fontFamily:"monospace",fontWeight:600}}>{time}</div>
                        <div style={{fontSize:9,color:"#000000",marginTop:1}}>{date}</div>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                          {entry.incidentId && (
                            <span style={{fontSize:9,fontWeight:700,background:"#F0FDF4",color:"#028090",padding:"1px 5px",borderRadius:4}}>{entry.incidentId}</span>
                          )}
                          <span style={{fontSize:11,fontWeight:600,color:"#005EB8"}}>{entry.title}</span>
                        </div>
                        <div style={{fontSize:11,color:"#000000",lineHeight:1.5}}>{entry.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Column header ─────────────────────────────────────────────────────────
function ColHeader({ title }: { title: string }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:6,padding:"10px 14px",borderBottom:"1px solid #F0F4F5",backgroundColor:"#fff",flexShrink:0}}>
      <span style={{width:5,height:5,background:"#a3e635",borderRadius:"50%",display:"inline-block"}}/>
      <span style={{fontSize:10,color:"#aaa",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px"}}>{title}</span>
    </div>
  );
}

// ─── CPXO reply engine ──────────────────────────────────────────────────────
function cpxoReply(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("934") || (q.includes("critical") && !q.includes("cold")) || q.includes("m6") || (q.includes("ultomiris") && q.includes("934")))
    return "INC-00934 is LIFE-CRITICAL. Ultomiris 500mg courier stationary on M6 J7–J8 Birmingham — 7.2h delay. PNH patient infusion window missed. MHRA PV flag generated. Emergency dispatch already executed automatically. Awaiting your governance sign-off in the Review panel.";
  if (q.includes("928") || q.includes("cold chain") || q.includes("leeds"))
    return "INC-00928 — cold chain temperature excursion at Leeds hub. Soliris 300mg held pending pharmacist review. DHL courier DHL-3392041. Clinical Risk agent monitoring. Status: IN REVIEW. Pharmacist sign-off required.";
  if (q.includes("921") || q.includes("ward") || q.includes("thomas") || q.includes("strensiq"))
    return "INC-00921 — Strensiq 80mg delivered to St Thomas' receiving bay but unmanned. Drug held at security desk for 4.1h. Delivery system falsely showing 'Delivered'. Ward notification pending — this is a silent false positive that NavECC caught.";
  if (q.includes("mhra") || q.includes("pharmacovigilance") || q.includes("pv flag"))
    return "MHRA PV flag auto-generated for INC-00934. Ultomiris delay exceeded the 6h MHRA reporting threshold for PNH patients. Entry appended to Reasoning Ledger — tamper-proof, regulator-facing. No manual action required.";
  if (q.includes("agent") || q.includes("running") || (q.includes("status") && !q.includes("incident")))
    return "All 4 specialist agents running. Delivery Ops: tracking M6 route. Clinical Risk: ALERT — PNH threshold breach. Compliance: MHRA flag appended. Engagement: St Thomas pharmacist notification queued. CPXO scan every 2 minutes.";
  if (q.includes("dispatch") || q.includes("automat") || q.includes("action"))
    return "Emergency dispatch for INC-00934 executed automatically — policy-matched, no human approval needed. That's the core principle: action fires first, human governance reviews after. The action already happened.";
  if (q.includes("how many") || q.includes("incidents") || q.includes("exceptions") || q.includes("open"))
    return "9 open exceptions monitored. 3 need immediate attention: INC-00934 (CRITICAL), INC-00928 (HIGH), INC-00921 (HIGH). 1 resolved: INC-00909. All 5 signal sources active. Next CPXO scan in under 2 minutes.";
  if (q.includes("ledger") || q.includes("audit") || q.includes("reasoning"))
    return "Reasoning Ledger is append-only and tamper-proof. Every exception, decision, signal and action is timestamped and locked. 148+ entries. SOC 2 · ISO 27001 · GDPR · MHRA-facing. No manual logging ever needed.";
  if (q.includes("nurse") || q.includes("homecare") || q.includes("check-in"))
    return "Homecare nurse check-in for INC-00934 opened at 08:31 — no confirmation received. This silence was a key detection signal. NavECC caught it before the nurse even knew the delivery was late. That's the 'silent failure' we eliminate.";
  if (q.includes("signal") || q.includes("source") || q.includes("data"))
    return "5 active signal sources: cell-signal GPS tags (4 min ago), homecare check-ins (12 min ago), delivery event logs (1 min ago), supply chain portal (8 min ago), email and order data (22 min ago). All live.";
  if (q.includes("hi") || q.includes("hello") || q.includes("hey"))
    return "hi! i'm your CPXO agent. i'm watching 9 active exceptions across UK homecare right now. ask me about any incident, agent, or signal — or just type 'status' for a summary.";
  if (q.includes("review") || q.includes("sign") || q.includes("approve"))
    return "3 governance reviews pending: INC-00934 dispatch confirm (12 min left), INC-00928 cold chain sign-off, INC-00921 ward notification. Open the incident and use the Review panel on the right — your sign-off goes straight into the Reasoning Ledger.";
  return "i'm monitoring 9 active exceptions right now. all agents running, actions executing automatically. ask me about a specific incident (e.g. 'tell me about INC-00934'), agent status, or signal sources.";
}

// ─── CPXO chat popup ────────────────────────────────────────────────────────
type ChatMsg = { role: "agent" | "user"; text: string; time: string };

function ChatPopup({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMsg[]>([{
    role: "agent",
    time: "09:14",
    text: "hi, i'm your CPXO agent. i'm watching 9 active exceptions right now.\n\nurgent actions needed:\n• INC-00934 · dispatch confirm · 12 min left\n• INC-00928 · cold chain sign-off\n• INC-00921 · ward notification pending\n\nall agents are running. actions execute automatically.",
  }]);
  const [input,    setInput]    = useState("");
  const [typing,   setTyping]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function send() {
    const text = input.trim();
    if (!text) return;
    const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    setMessages(prev => [...prev, { role: "user", text, time }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, {
        role: "agent",
        text: cpxoReply(text),
        time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      }]);
    }, 700);
  }

  return (
    <div style={{position:"fixed",bottom:62,right:18,width:300,background:"#fff",border:"1px solid #e0e0e0",borderRadius:12,overflow:"hidden",display:"flex",flexDirection:"column",zIndex:1000,boxShadow:"0 8px 32px rgba(0,0,0,0.12)"}}>
      {/* Header */}
      <div style={{background:PUR,padding:"11px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:26,height:26,borderRadius:"50%",background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff"}}>CX</div>
          <div>
            <div style={{fontSize:12,fontWeight:600,color:"#fff"}}>CPXO Agent</div>
            <div style={{fontSize:9.5,color:"rgba(255,255,255,0.6)",display:"flex",alignItems:"center",gap:4,marginTop:1}}>
              <span style={{width:5,height:5,background:"#a3e635",borderRadius:"50%",display:"inline-block"}}/>
              Online · Navedas Intelligence
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{background:"transparent",border:"none",color:"rgba(255,255,255,0.5)",cursor:"pointer",display:"flex",alignItems:"center"}}>
          <Minus size={14}/>
        </button>
      </div>

      {/* Messages */}
      <div style={{overflowY:"auto",padding:"12px 13px",display:"flex",flexDirection:"column",gap:10,minHeight:180,maxHeight:280,backgroundColor:"#FAFBFC"}}>
        {messages.map((msg, i) => (
          <div key={i} style={{display:"flex",flexDirection:"column",alignItems:msg.role==="user"?"flex-end":"flex-start"}}>
            {msg.role === "agent" && (
              <div style={{fontSize:9,color:"#bbb",marginBottom:3,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px"}}>CPXO Agent</div>
            )}
            <div style={{
              background: msg.role==="user" ? PUR : "#fff",
              border: msg.role==="user" ? "none" : "1px solid #F0F4F5",
              borderRadius: msg.role==="user" ? "10px 10px 2px 10px" : "2px 10px 10px 10px",
              padding:"8px 11px", fontSize:11,
              color: msg.role==="user" ? "#fff" : "#000000",
              lineHeight:1.6, maxWidth:"88%", whiteSpace:"pre-wrap",
            }}>
              {msg.text}
            </div>
            <div style={{fontSize:8.5,color:"#F0F4F5",marginTop:3}}>{msg.time}</div>
          </div>
        ))}

        {/* Typing indicator */}
        {typing && (
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start"}}>
            <div style={{fontSize:9,color:"#bbb",marginBottom:3,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px"}}>CPXO Agent</div>
            <div style={{background:"#fff",border:"1px solid #F0F4F5",borderRadius:"2px 10px 10px 10px",padding:"8px 14px",display:"flex",gap:4,alignItems:"center"}}>
              {[0,1,2].map(d => (
                <span key={d} style={{width:5,height:5,borderRadius:"50%",backgroundColor:"#F0F4F5",display:"inline-block",animation:`bounce 1s ${d*0.15}s infinite`}}/>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{padding:"9px 12px",borderTop:"1px solid #F0F4F5",background:"#fff",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",background:"#F4F7FA",border:"1px solid #e8e8e8",borderRadius:8,padding:"6px 10px",gap:7}}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }}}
            placeholder="Ask me anything..."
            style={{fontSize:11,color:"#000000",flex:1,border:"none",background:"transparent",outline:"none"}}
          />
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <Paperclip size={13} color="#F0F4F5"/>
            <AtSign size={13} color="#F0F4F5"/>
          </div>
          <div
            onClick={send}
            style={{width:24,height:24,background:input.trim()?PUR:"#F0F4F5",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:input.trim()?"pointer":"default",flexShrink:0,transition:"background 0.15s"}}
          >
            <ArrowUp size={11} color="#fff"/>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router          = useRouter();
  const [chatOpen,      setChatOpen]      = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [incidents,     setIncidents]     = useState<Incident[]>([]);
  const [agentsData,    setAgentsData]    = useState<Agent[]>([]);
  const [auditLog,      setAuditLog]      = useState<AuditEntry[]>([]);
  const [filter,        setFilter]        = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    Promise.all([
      fetch("/api/incidents").then(r => r.json()),
      fetch("/api/agents").then(r => r.json()),
      fetch("/api/audit-log").then(r => r.json()),
    ]).then(([inc, ag, al]) => {
      setIncidents(inc);
      setAgentsData(ag);
      setAuditLog(al);
    });
  }, []);

  // ── Filter config ──────────────────────────────────────────────────────────
  const FILTER_LABEL: Record<string, string> = {
    '7d': 'Last 7 days', '30d': 'Last 30 days', '90d': 'Last 90 days',
  };

  const FILTER_KPI = {
    '7d':  { open: 3,  avg: 5.2, hours: 18.5, approvals: 3,
              sub0: "↑ +1 this period", sub1: "↑ +0.4h vs avg",    sub2: "↗ 5 events",
              sc1: "#d97706", bp: [30, 55, 30, 30] },
    '30d': { open: 9,  avg: 4.8, hours: 42.5, approvals: 3,
              sub0: "↑ +3 this week",   sub1: "↓ −0.9h improving", sub2: "↗ 17 events",
              sc1: "#16a34a", bp: [65, 48, 75, 30] },
    '90d': { open: 17, avg: 4.2, hours: 89.5, approvals: 3,
              sub0: "↑ +8 this period", sub1: "↓ −0.6h improving", sub2: "↗ 31 events",
              sc1: "#16a34a", bp: [90, 42, 100, 30] },
  };

  const fk = FILTER_KPI[filter];

  // ── Incident filtering ─────────────────────────────────────────────────────
  const TODAY = new Date('2026-06-26T00:00:00Z');
  const FILTER_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };

  const filteredIncidents = incidents.filter(inc => {
    const daysAgo = (TODAY.getTime() - new Date(inc.detectedAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= FILTER_DAYS[filter];
  });

  // ── Derived values ─────────────────────────────────────────────────────────
  const DRUGS = [
    { name:"Ultomiris 500mg", open: filteredIncidents.filter(i => i.drug.includes("Ultomiris") && i.status !== "RESOLVED").length },
    { name:"Soliris 300mg",   open: filteredIncidents.filter(i => i.drug.includes("Soliris")   && i.status !== "RESOLVED").length },
    { name:"Strensiq 80mg",   open: filteredIncidents.filter(i => i.drug.includes("Strensiq")  && i.status !== "RESOLVED").length },
  ];

  const METRICS = [
    { label:"Open delay events",    value:`${fk.open}`,     sub:fk.sub0,          sc:"#dc2626", bc:"#dc2626", bb:"#fecaca", bp:fk.bp[0] },
    { label:"Avg delivery delay",   value:`${fk.avg}h`,     sub:fk.sub1,          sc:fk.sc1,    bc:fk.sc1,    bb:"#bbf7d0", bp:fk.bp[1] },
    { label:"NHS staff hours lost", value:`${fk.hours}h`,   sub:fk.sub2,          sc:"#d97706", bc:"#d97706", bb:"#fde68a", bp:fk.bp[2] },
    { label:"Pending approvals",    value:`${fk.approvals}`,sub:"⏱ Action required",sc:"#dc2626",bc:"#dc2626", bb:"#fecaca", bp:fk.bp[3] },
  ];

  const openCount    = filteredIncidents.filter(i => i.status !== "RESOLVED").length;
  const courierWidth = filter === '90d' ? "0.9%" : "0.8%";
  const onTimeWidth  = filter === '90d' ? "97.4%" : "97.5%";

  return (
    <>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>

        {/* ── Page header ──────────────────────────────────────── */}
        <div>
          <h1 style={{fontSize:18,fontWeight:500,color:"#000000",margin:0}}>Dashboard</h1>
          <p style={{fontSize:12,color:"#000000",margin:"4px 0 0 0"}}>{FILTER_LABEL[filter]}</p>
        </div>

        {/* ── Filter pills — fixed in navbar space ─────────────── */}
        <div style={{
          position:"fixed", top:0, right:172, height:48,
          display:"flex", alignItems:"center", gap:4, zIndex:55,
        }}>
          {(['7d','30d','90d'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontSize:12, fontWeight: filter === f ? 600 : 400,
                padding:"4px 12px", borderRadius:6, cursor:"pointer",
                border:`1px solid ${filter === f ? '#005EB8' : '#F0F4F5'}`,
                backgroundColor: '#ffffff',
                color: filter === f ? '#005EB8' : '#000000',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ── Dashboard card ───────────────────────────────────── */}
        <div style={{display:"flex",flexDirection:"column",border:"1px solid #F0F4F5",borderRadius:10,overflow:"hidden",background:"#fff"}}>

          {/* ── Metric strip ─────────────────────────────────────── */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderBottom:"1px solid #F0F4F5",flexShrink:0}}>
            {METRICS.map((m, i) => (
              <div key={m.label} style={{padding:"12px 18px",borderRight:i<3?"1px solid #F0F4F5":"none"}}>
                <div style={{fontSize:9,color:"#bbb",textTransform:"uppercase",letterSpacing:"0.6px",fontWeight:600,marginBottom:4}}>{m.label}</div>
                <div style={{fontSize:20,fontWeight:700,color:'#000000',letterSpacing:"-0.5px",lineHeight:1}}>{m.value}</div>
                <div style={{fontSize:10,marginTop:4,color:m.sc}}>{m.sub}</div>
                <div style={{height:2,marginTop:8,borderRadius:1,backgroundColor:m.bb}}>
                  <div style={{height:"100%",width:`${m.bp}%`,backgroundColor:m.bc,borderRadius:1}}/>
                </div>
              </div>
            ))}
          </div>

          {/* ── Three-column body ────────────────────────────────── */}
          <div style={{display:"flex",minHeight:480,overflow:"hidden"}}>

            {/* LEFT — Operation */}
            <div style={{width:210,flexShrink:0,background:"#fff",borderRight:"1px solid #F0F4F5",display:"flex",flexDirection:"column",overflow:"hidden"}}>
              <ColHeader title="Operation"/>
              <div style={{flex:1,overflowY:"auto",padding:"12px 14px"}}>
                <div style={{fontSize:13.5,fontWeight:700,color:'#000000',marginBottom:10,letterSpacing:"-0.2px"}}>Arvion Biosciences</div>
                <span style={{fontSize:10,background:PUR+"18",color:PUR,border:`1px solid ${PUR}30`,borderRadius:12,padding:"3px 9px",display:"inline-flex",alignItems:"center",gap:4,marginBottom:6,cursor:"pointer"}}>
                  🏢 UK Homecare Ops
                </span>
                <div style={{marginBottom:10,marginTop:4}}>
                  <span style={{fontSize:10,background:"#F4F7FA",color:"#999",border:"1px solid #e8e8e8",borderRadius:12,padding:"3px 9px",display:"inline-flex",alignItems:"center",gap:4,cursor:"pointer"}}>
                    ✦ Improve sensitivity
                  </span>
                </div>
                <p style={{fontSize:11,color:"#999",lineHeight:1.6,marginBottom:14}}>
                  NavECC monitors <strong style={{color:'#000000',fontWeight:500}}>every rare-disease delivery</strong> across NHS homecare pathways, detecting silent delays before they become patient disruptions. Covers PNH, HPP, and aHUS lines.
                </p>

                <div style={{fontSize:9,color:"#ccc",textTransform:"uppercase",letterSpacing:"0.7px",fontWeight:700,marginBottom:7}}>Monitored drugs</div>
                {DRUGS.map(d => (
                  <div key={d.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 7px",borderRadius:5,cursor:"pointer",marginBottom:1}}>
                    <div style={{fontSize:11,color:"#444",display:"flex",alignItems:"center",gap:6}}>
                      <Pill size={12} color="#ccc"/>{d.name}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <span style={{fontSize:8.5,fontWeight:700,background:"#fef2f2",color:'#000000',padding:"1px 5px",borderRadius:8}}>{d.open} open</span>
                      <span style={{fontSize:11,color:"#ddd"}}>›</span>
                    </div>
                  </div>
                ))}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 7px",borderRadius:5,cursor:"pointer"}}>
                  <div style={{fontSize:11,color:"#444",display:"flex",alignItems:"center",gap:6}}>
                    <Folder size={12} color="#ccc"/>Audit logs
                  </div>
                  <span style={{fontSize:11,color:"#ddd"}}>›</span>
                </div>

                <div style={{fontSize:9,color:"#ccc",textTransform:"uppercase",letterSpacing:"0.7px",fontWeight:700,marginBottom:7,marginTop:14}}>NHS regions</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
                  {REGIONS.map(r => (
                    <div key={r.c} style={{display:"flex",alignItems:"center",gap:5,fontSize:10.5,color:"#999",padding:"2px 0"}}>
                      <div style={{width:15,height:15,borderRadius:3,background:PUR+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:PUR,fontWeight:700,flexShrink:0}}>{r.c}</div>
                      {r.n}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* MID — Analytics */}
            <div style={{flex:1,background:"#fff",display:"flex",flexDirection:"column",overflow:"hidden",borderRight:"1px solid #F0F4F5"}}>
              <ColHeader title="Analytics"/>
              <div style={{flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:14}}>

                {/* Performance breakdown */}
                <div>
                  <div style={{fontSize:9,color:"#bbb",textTransform:"uppercase",letterSpacing:"0.6px",fontWeight:700,marginBottom:8}}>Delivery performance breakdown</div>
                  <div style={{background:"#fff",border:"1px solid #F0F4F5",borderRadius:8,padding:"12px 14px"}}>
                    <div style={{marginBottom:9}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontSize:10.5,color:"#999"}}>Baseline — unattributed</span>
                        <span style={{fontSize:10.5,fontWeight:600,color:'#000000'}}>98.7% on-time</span>
                      </div>
                      <div style={{height:12,background:"#F0F4F5",borderRadius:2,overflow:"hidden",display:"flex"}}>
                        <div style={{width:"98.7%",background:PUR}}/>
                        <div style={{width:"1.3%",background:"#ddd"}}/>
                      </div>
                    </div>
                    <div>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontSize:10.5,color:"#999"}}>Current period — {FILTER_LABEL[filter].toLowerCase()}</span>
                        <span style={{fontSize:10.5,fontWeight:600,color:'#000000'}}>1.3% silent delay rate</span>
                      </div>
                      <div style={{height:12,background:"#F0F4F5",borderRadius:2,overflow:"hidden",display:"flex"}}>
                        <div style={{width:onTimeWidth,background:PUR}}/>
                        <div style={{width:courierWidth,background:"#dc2626"}}/>
                        <div style={{width:"0.7%",background:"#3b82f6"}}/>
                        <div style={{width:"0.6%",background:"#f59e0b"}}/>
                        <div style={{width:"0.4%",background:"#000000"}}/>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:8}}>
                      {[
                        {c:"#000000",l:"Courier / Traffic"},
                        {c:"#3b82f6",l:"Cold chain"},
                        {c:"#f59e0b",l:"Hospital receiving"},
                        {c:"#8b5cf6",l:"Homecare scheduling"},
                        {c:"#028090",l:"On-time (98.7%)"},
                      ].map(({c,l}) => (
                        <div key={l} style={{display:"flex",alignItems:"center",gap:4,fontSize:9.5,color:"#bbb"}}>
                          <div style={{width:7,height:7,borderRadius:2,background:c,flexShrink:0}}/>{l}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Incidents table */}
                <div>
                  <div style={{fontSize:9,color:"#bbb",textTransform:"uppercase",letterSpacing:"0.6px",fontWeight:700,marginBottom:8}}>
                    Active exceptions · {FILTER_LABEL[filter].toLowerCase()}
                  </div>
                  <div style={{border:"1px solid #F0F4F5",borderRadius:8,overflow:"hidden"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",background:"#F4F7FA",borderBottom:"1px solid #F0F4F5"}}>
                      <span style={{fontSize:9,color:"#aaa",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px"}}>Incidents</span>
                      <span style={{fontSize:9.5,background:"#fef2f2",color:'#000000',padding:"1px 7px",borderRadius:10,fontWeight:600}}>{openCount} open</span>
                    </div>
                    {filteredIncidents.map((inc, i) => (
                      <div key={inc.id} style={{display:"flex",alignItems:"center",padding:"7px 12px",borderBottom:i<filteredIncidents.length-1?"1px solid #f5f5f5":"none",cursor:"pointer",background:"#fff"}}>
                        <div style={{width:80,flexShrink:0}}>
                          <div style={{fontSize:10,color:"#028090",fontWeight:700,display:"flex",alignItems:"center",gap:4}}>
                            <span style={{width:5,height:5,borderRadius:"50%",background:dotColor(inc.severity),flexShrink:0,display:"inline-block"}}/>
                            {inc.id}
                          </div>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:11,color:"#111",fontWeight:500}}>{inc.drug}</div>
                          <div style={{fontSize:9.5,color:"#ccc",marginTop:1}}>{inc.location}</div>
                        </div>
                        <div style={{width:36,textAlign:"right",flexShrink:0,marginRight:8}}>
                          <span style={{fontSize:11.5,fontWeight:700,color:delayColor(inc.delayHours)}}>{inc.delayHours}h</span>
                        </div>
                        <div style={{width:88,flexShrink:0,marginRight:8}}>
                          <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>
                            {inc.dataSources.map(s => {
                              const ts = tagStyle(s);
                              return <span key={s} style={{fontSize:8,fontWeight:700,padding:"1px 4px",borderRadius:3,...ts}}>{s}</span>;
                            })}
                          </div>
                        </div>
                        <div style={{width:68,textAlign:"right",flexShrink:0}}>
                          <span style={{fontSize:11,fontWeight:500,color:'#000000'}}>{inc.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — Actions awaiting approval */}
            <div style={{width:250,flexShrink:0,background:"#F4F7FA",display:"flex",flexDirection:"column",overflow:"hidden"}}>
              <div style={{display:"flex",flexDirection:"column",padding:"10px 14px 6px",borderBottom:"1px solid #F0F4F5",backgroundColor:"#fff",flexShrink:0,gap:2}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{width:5,height:5,background:"#dc2626",borderRadius:"50%",display:"inline-block"}}/>
                  <span style={{fontSize:10,color:"#aaa",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px"}}>Actions awaiting approval</span>
                </div>
                <span style={{fontSize:9.5,color:"#bbb",paddingLeft:11}}>No action taken without sign-off</span>
              </div>
              <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
                {pendingApprovals.map((action) => {
                  const isCrit = action.severity === "CRITICAL";
                  const barColor = isCrit ? "#dc2626" : "#d97706";
                  const badgeBg  = isCrit ? "#fef2f2" : "#fffbeb";
                  return (
                    <div key={action.id} style={{background:"#fff",borderBottom:"1px solid #F0F4F5",borderLeft:`3px solid ${barColor}`,padding:"10px 12px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
                        <span style={{fontSize:8.5,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.4px",color:barColor,background:badgeBg,padding:"1px 5px",borderRadius:3}}>{action.severity}</span>
                        <span style={{fontSize:9,color:"#bbb",textTransform:"uppercase",letterSpacing:"0.3px"}}>{action.category}</span>
                      </div>
                      <div style={{fontSize:11,fontWeight:600,color:"#111",lineHeight:1.35,marginBottom:3}}>{action.title}</div>
                      <div style={{fontSize:9.5,color:"#999",lineHeight:1.45,marginBottom:7}}>{action.detail}</div>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <span style={{fontSize:9,color:"#bbb",background:"#F4F7FA",border:"0.5px solid #e8e8e8",padding:"2px 7px",borderRadius:8}}>⏱ {action.timeRemaining}</span>
                        <button
                          onClick={() => router.push(`/incidents/${action.incidentId}`)}
                          style={{fontSize:10,fontWeight:600,color:"#028090",background:"transparent",border:"1px solid #028090",borderRadius:4,padding:"2px 9px",cursor:"pointer"}}
                        >Review</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Agent detail popup */}
      {selectedAgent && (
        <AgentPopup
          agentId={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          agents={agentsData}
          auditLog={auditLog}
        />
      )}

      {/* CPXO chat popup */}
      {chatOpen && <ChatPopup onClose={() => setChatOpen(false)}/>}

      {/* FAB */}
      <button
        onClick={() => setChatOpen(c => !c)}
        style={{position:"fixed",bottom:50,right:18,zIndex:100,background:PUR,color:"#fff",border:"none",borderRadius:24,padding:"8px 16px",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:7}}
      >
        <MessageCircle size={15}/>
        Talk to CPXO Agent
      </button>
    </>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Network, Truck, HeartPulse, Shield, Bell, Database } from "lucide-react";

const CSS = `
  @keyframes toolIn   { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes stepIn   { from { opacity:0; transform:translateX(-6px); } to { opacity:1; transform:translateX(0); } }
  @keyframes ledgerIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
`;

type ToolType = "READ"|"WRITE"|"DELEGATE"|"CALC"|"NOTIFY"|"SEND";
interface Step { text: string; detail?: string }
interface Tool { type: ToolType; call: string; result?: string }
interface GoalChain { company: string; department: string; current: string }
interface AgentData { steps: Step[]; tools: Tool[]; task: string; goal?: GoalChain }

const DATA: Record<string, AgentData> = {
  cpxo: {
    task: "Active execution - heartbeat cycle #47",
    steps: [
      { text: "Wake on heartbeat",                   detail: "Cycle initiated · 09:14:00" },
      { text: "Read Signal 1: Real-time logistics",  detail: "DPD-7741882 stationary M6 J7-J8 · 7.2h" },
      { text: "Read Signal 2: Treatment scheduling", detail: "ARV-05934 infusion window: MISSED" },
      { text: "Read Signal 3: Delivery status",      detail: "Portal stale · nurse ping: no response" },
      { text: "Correlate signals · score severity",  detail: "3 sources confirmed · LIFE-CRITICAL" },
      { text: "Delegate to specialist agents",       detail: "All 4 agents assigned simultaneously" },
    ],
    tools: [
      { type:"READ",     call:"logistics.getCourierPosition(ARV-DEL-00934)",   result:"stationary: true · 7.2h · M6 J7-J8 Birmingham" },
      { type:"READ",     call:"schedule.getInfusionWindow(ARV-05934)",          result:"scheduled: 10:00 · MISSED · Ultomiris 500mg" },
      { type:"READ",     call:"portal.getDeliveryStatus(ARV-DEL-00934)",        result:"in_transit · stale: true" },
      { type:"READ",     call:"homecare.getNurseCheckIn(ARV-05934)",            result:"confirmation: null · window_elapsed: true" },
      { type:"WRITE",    call:'exception.create({\n  id: "INC-00934",\n  severity: "LIFE_CRITICAL",\n  signals: 3\n})' },
      { type:"DELEGATE", call:'agents.assign(\n  [delivery-ops, clinical-risk,\n   compliance, engagement],\n  task: "INC-00934"\n)' },
    ],
    goal: {
      company:    "Zero silent delivery failures in rare disease treatment pathways",
      department: "Detect all 1.3% silent exceptions before NHS absorption",
      current:    "Resolve INC-00934 · Ultomiris 500mg · PNH · LIFE-CRITICAL",
    },
  },
  delivery: {
    task: "Track INC-00934 courier - M6 route update",
    steps: [
      { text: "Received task from CPXO",     detail: "INC-00934 · Priority: LIFE-CRITICAL" },
      { text: "Query courier GPS position",  detail: "DPD-7741882 · M6 J7-J8 · stationary 7.2h" },
      { text: "Check alternate routes",      detail: "M6 closed J7-J8 · M42 diversion available" },
      { text: "Calculate ETA delta",         detail: "Original: 08:00 · Current ETA: 17:30 · +9.5h" },
      { text: "Report findings to CPXO",    detail: "Emergency dispatch recommended" },
    ],
    tools: [
      { type:"READ",   call:"gps.getPosition(DPD-7741882)",          result:"lat: 52.4, lng: -1.8 · stationary: true" },
      { type:"READ",   call:"routes.getAlternates(M6, J7, J8)",      result:"M42 available · +45min" },
      { type:"CALC",   call:"eta.compute(current_pos, destination)",  result:"ETA: 17:30 · delta: +9.5h" },
      { type:"WRITE",  call:"report.create(INC-00934, findings)",     result:"report_id: RPT-00934-01" },
      { type:"NOTIFY", call:"cpxo.report(task_complete)",             result:"acknowledged" },
    ],
  },
  clinical: {
    task: "Assess INC-00934 - PNH threshold breach",
    steps: [
      { text: "Received task from CPXO" },
      { text: "Load patient clinical profile",  detail: "ARV-05934 · Diagnosis: PNH · Ultomiris 500mg" },
      { text: "Check SLA threshold",            detail: "PNH SLA: 4h · Delay: 7.2h · BREACH: +3.2h" },
      { text: "Assess patient risk",            detail: "No alternative · Haemolytic crisis risk: HIGH" },
      { text: "Generate MHRA flag",             detail: "Delay > 6h PNH threshold · Regulatory flag required" },
      { text: "Escalate to LIFE-CRITICAL",      detail: "Severity override applied" },
    ],
    tools: [
      { type:"READ",   call:"patient.getProfile(ARV-05934)",       result:"PNH · Ultomiris 500mg · no alternatives" },
      { type:"READ",   call:"sla.getThreshold(PNH, Ultomiris)",    result:"max_delay: 4h · current: 7.2h · BREACH" },
      { type:"CALC",   call:"risk.assess(delay, diagnosis)",        result:"crisis_risk: HIGH · score: 0.94" },
      { type:"WRITE",  call:"mhra.createFlag(INC-00934)",          result:"flag_id: MHRA-PV-00934" },
      { type:"WRITE",  call:"severity.escalate(LIFE_CRITICAL)",    result:"escalated · ledger updated" },
      { type:"NOTIFY", call:"cpxo.alert(LIFE_CRITICAL)",           result:"CPXO notified" },
    ],
  },
  compliance: {
    task: "Log INC-00934 to Reasoning Ledger",
    steps: [
      { text: "Received task from CPXO" },
      { text: "Prepare audit entry",              detail: "Exception · signals · severity · timestamp" },
      { text: "Apply GDPR pseudonymisation",      detail: "ARV-05934 → [REDACTED-PNH-05934]" },
      { text: "Write to Reasoning Ledger",        detail: "LOG-00293 · immutable · appended" },
      { text: "Generate MHRA entry",              detail: "LOG-00293-PV appended" },
      { text: "Notify compliance officer",        detail: "s.mitchell@arvion.com" },
    ],
    tools: [
      { type:"READ",   call:"exception.get(INC-00934)",            result:"full exception object" },
      { type:"WRITE",  call:"gdpr.pseudonymise(ARV-05934)",        result:"token: REDACTED-PNH-05934" },
      { type:"WRITE",  call:'ledger.append({\n  id: "LOG-00293",\n  immutable: true\n})',  result:"tamper_proof: true" },
      { type:"WRITE",  call:"mhra.appendFlag(LOG-00293-PV)",       result:"regulatory_entry: confirmed" },
      { type:"NOTIFY", call:"compliance.alert(s.mitchell)",        result:"email queued" },
    ],
  },
  engagement: {
    task: "Notify homecare and ops team - INC-00934",
    steps: [
      { text: "Received task from CPXO" },
      { text: "Identify notification targets", detail: "Homecare nurse · St Thomas · Arvion ops" },
      { text: "Draft homecare alert",          detail: '"Ultomiris delayed 7h · reschedule required"' },
      { text: "Draft pharmacy notification",   detail: '"ETA updated 17:30 · prep window adjusted"' },
      { text: "Dispatch notifications",        detail: "3 notifications queued" },
    ],
    tools: [
      { type:"READ",  call:"contacts.get(INC-00934)",               result:"nurse · pharmacy · ops_team" },
      { type:"WRITE", call:"alert.draft(nurse, delay)",             result:"draft_id: ALT-001" },
      { type:"WRITE", call:"alert.draft(pharmacy, eta)",            result:"draft_id: ALT-002" },
      { type:"WRITE", call:"alert.draft(ops_team, report)",         result:"draft_id: ALT-003" },
      { type:"SEND",  call:"notifications.dispatch(queue)",         result:"3 queued · sending" },
    ],
  },
};

const LEDGER_FEED = [
  { id:"LOG-00297", time:"09:14:00", cat:"HEARTBEAT",  msg:"Heartbeat complete · 9 exceptions active",         amber:false },
  { id:"LOG-00296", time:"09:02:44", cat:"MHRA-PV",    msg:"MHRA audit entry · INC-00934 · PNH · 7.2h delay",  amber:true  },
  { id:"LOG-00295", time:"08:48:00", cat:"ACTION",     msg:"Emergency dispatch · INC-00934 · no human approval",amber:false },
  { id:"LOG-00294", time:"08:47:31", cat:"ALERT",      msg:"Clinical Risk ALERT · PNH threshold breach",        amber:false },
  { id:"LOG-00293", time:"08:47:14", cat:"EVENT",      msg:"Exception INC-00934 created · 3 sources confirmed", amber:false },
];

const PANEL_ROWS = [
  { id:"cpxo",       Icon:Network,      color:"#005EB8", label:"CPXO Agent",       role:"Chief Patient Experience Officer", dot:"green"  },
  { id:"delivery",   Icon:Truck,      color:"#085040", label:"Delivery Ops",     role:"Logistics & courier tracking",     dot:"green"  },
  { id:"clinical",   Icon:HeartPulse, color:"#005EB8", label:"Clinical Risk",    role:"Patient safety & severity",        dot:"red"    },
  { id:"compliance", Icon:Shield,     color:"#085040", label:"Compliance",       role:"GDPR & pharma audit",              dot:"green"  },
  { id:"engagement", Icon:Bell,       color:"#005EB8", label:"Engagement",       role:"Alerts & comms",                   dot:"green"  },
  { id:"ledger",     Icon:Database,   color:"#005EB8", label:"Reasoning Ledger", role:"Append-only database",             dot:"purple" },
];

const TOOL_STYLE: Record<ToolType,{bg:string;color:string}> = {
  READ:     {bg:"#EFF6FF",color:"#212B32"},
  WRITE:    {bg:"#F5F3FF",color:"#212B32"},
  DELEGATE: {bg:"#E8F1FB",color:"#085040"},
  CALC:     {bg:"#FEF9E7",color:"#212B32"},
  NOTIFY:   {bg:"#FFF1F2",color:"#212B32"},
  SEND:     {bg:"#E8F1FB",color:"#212B32"},
};

function ExecStep({ step, state }: { step:Step; state:"done"|"active"|"pending" }) {
  if (state === "pending") return null;
  return (
    <div style={{display:"flex",gap:10,alignItems:"flex-start",animation:"stepIn 0.3s ease"}}>
      <div style={{width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
        {state==="done"
          ? <span style={{fontSize:13,color:"#085040"}}>✓</span>
          : <span className="animate-pulse-dot" style={{width:8,height:8,borderRadius:"50%",backgroundColor:"#005EB8",display:"inline-block"}}/>}
      </div>
      <div>
        <div style={{fontSize:13,color:"#212B32",fontWeight:state==="active"?500:400}}>{step.text}</div>
        {step.detail && (
          <div style={{fontSize:11,color:"#212B32",marginTop:3,paddingLeft:10,borderLeft:"2px solid #F0F4F5"}}>└─ {step.detail}</div>
        )}
      </div>
    </div>
  );
}

function ToolRow({ tool }: { tool:Tool }) {
  const s = TOOL_STYLE[tool.type];
  return (
    <div style={{animation:"toolIn 0.35s ease",borderBottom:"0.5px solid #F4F7FA",padding:"9px 0"}}>
      <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
        <span style={{fontSize:10,fontWeight:700,color:s.color,backgroundColor:s.bg,padding:"2px 6px",borderRadius:4,flexShrink:0,letterSpacing:"0.04em",marginTop:1}}>{tool.type}</span>
        <pre style={{fontSize:11,color:"#212B32",fontFamily:"var(--font-geist-mono),monospace",margin:0,whiteSpace:"pre-wrap",lineHeight:1.5}}>{tool.call}</pre>
      </div>
      {tool.result && (
        <div style={{marginTop:3,paddingLeft:48,fontSize:11,color:"#212B32",fontFamily:"var(--font-geist-mono),monospace"}}>→ {tool.result}</div>
      )}
    </div>
  );
}

function LedgerExecView() {
  const [entries, setEntries] = useState(LEDGER_FEED);
  const idxRef = useRef(0);
  useEffect(() => {
    const id = setInterval(() => {
      const e = LEDGER_FEED[idxRef.current % LEDGER_FEED.length];
      idxRef.current++;
      setEntries(prev => [{ ...e, id:`LOG-${Date.now()}` } as typeof LEDGER_FEED[number], ...prev].slice(0,6));
    }, 8000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
        <Database size={20} color="#005EB8" />
        <span style={{fontSize:18,fontWeight:600,color:"#212B32"}}>Reasoning Ledger</span>
        <span style={{fontSize:11,fontWeight:600,color:"#005EB8",backgroundColor:"#EFF6FF",padding:"2px 8px",borderRadius:4}}>RECORDING</span>
      </div>
      <p style={{fontSize:12,color:"#212B32",margin:0}}>Append-only database · tamper-proof · GDPR-ready · regulator-facing</p>
      <div style={{display:"flex",gap:10}}>
        {[{l:"Total entries",v:"148"},{l:"Today",v:"12"},{l:"MHRA flags",v:"3"},{l:"Avg write",v:"0.3ms"}].map(({l,v})=>(
          <div key={l} style={{flex:1,backgroundColor:"#F8FAFC",border:"0.5px solid #F0F4F5",borderRadius:8,padding:"10px 12px"}}>
            <div style={{fontSize:10,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.05em",color:"#212B32",marginBottom:4}}>{l}</div>
            <div style={{fontSize:20,fontWeight:700,color:"#212B32"}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{backgroundColor:"#FFFFFF",border:"0.5px solid #F0F4F5",borderRadius:10,overflow:"hidden"}}>
        <div style={{padding:"12px 16px",borderBottom:"0.5px solid #F0F4F5",backgroundColor:"#FAFBFC",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:13,fontWeight:500,color:"#212B32"}}>Recent ledger writes</span>
          <span style={{fontSize:10,fontWeight:600,color:"#212B32",backgroundColor:"#F4F7FA",padding:"2px 8px",borderRadius:4,letterSpacing:"0.05em"}}>APPEND-ONLY · TAMPER-PROOF</span>
        </div>
        {entries.map((e,i)=>(
          <div key={e.id} style={{padding:"11px 16px",borderBottom:i<entries.length-1?"0.5px solid #F4F7FA":"none",borderLeft:e.amber?"3px solid #085040":"3px solid transparent",backgroundColor:e.amber?"#FFFDF5":"#FFFFFF",animation:i===0?"ledgerIn 0.4s ease":undefined}}>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
              <span style={{fontSize:11,color:"#212B32",fontFamily:"var(--font-geist-mono),monospace"}}>{e.time}</span>
              <span style={{fontSize:10,color:"#212B32",fontFamily:"var(--font-geist-mono),monospace",backgroundColor:"#F4F7FA",padding:"1px 5px",borderRadius:3}}>{e.id}</span>
              <span style={{fontSize:10,fontWeight:700,color:"#212B32",backgroundColor:e.amber?"#FEF9E7":"#F4F7FA",padding:"1px 5px",borderRadius:3}}>{e.cat}</span>
            </div>
            <p style={{fontSize:12,color:"#212B32",margin:0,lineHeight:1.5}}>{e.msg}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentExecView({ agentId }: { agentId:string }) {
  if (agentId === "ledger") return <LedgerExecView />;
  const cfg = DATA[agentId];
  const row = PANEL_ROWS.find(r => r.id === agentId)!;
  const [stepIdx,   setStepIdx]   = useState(0);
  const [toolCount, setToolCount] = useState(1);
  useEffect(() => { const id = setInterval(() => setStepIdx(i => (i+1) % cfg.steps.length), 3000); return () => clearInterval(id); }, [cfg.steps.length]);
  useEffect(() => { const id = setInterval(() => setToolCount(c => c >= cfg.tools.length ? 1 : c+1), 4000); return () => clearInterval(id); }, [cfg.tools.length]);
  const isAlert = row.dot === "red";
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
        <row.Icon size={20} color={row.color} />
        <span style={{fontSize:18,fontWeight:600,color:"#212B32"}}>{row.label}</span>
        <span style={{fontSize:11,fontWeight:600,color:"#212B32",backgroundColor:isAlert?"#FEF2F2":"#E8F1FB",padding:"2px 8px",borderRadius:4}}>{isAlert?"⚠ ALERT":"● ACTIVE"}</span>
      </div>
      <p style={{fontSize:12,color:"#212B32",margin:0}}>{row.role} · Last heartbeat: 1 min ago</p>
      <div style={{backgroundColor:"#FFFFFF",border:"0.5px solid #F0F4F5",borderRadius:10,padding:"14px 16px"}}>
        <div style={{fontSize:11,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.05em",color:"#212B32",marginBottom:4}}>CURRENT TASK</div>
        <div style={{fontSize:14,fontWeight:500,color:"#212B32"}}>{cfg.task}</div>
        {agentId==="cpxo" && <div style={{fontSize:11,color:"#212B32",marginTop:2}}>Processing INC-00934 · LIFE-CRITICAL</div>}
      </div>
      <div style={{backgroundColor:"#FFFFFF",border:"0.5px solid #F0F4F5",borderRadius:10,overflow:"hidden"}}>
        <div style={{padding:"12px 16px",borderBottom:"0.5px solid #F0F4F5",backgroundColor:"#FAFBFC",display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:13,fontWeight:500,color:"#212B32"}}>Execution steps</span>
          <span style={{fontSize:10,color:"#212B32",backgroundColor:"#F4F7FA",padding:"2px 8px",borderRadius:4}}>Step {stepIdx+1}/{cfg.steps.length}</span>
        </div>
        <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
          {cfg.steps.map((s,i) => <ExecStep key={i} step={s} state={i<stepIdx?"done":i===stepIdx?"active":"pending"} />)}
        </div>
      </div>
      <div style={{backgroundColor:"#FFFFFF",border:"0.5px solid #F0F4F5",borderRadius:10,overflow:"hidden"}}>
        <div style={{padding:"12px 16px",borderBottom:"0.5px solid #F0F4F5",backgroundColor:"#FAFBFC",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:13,fontWeight:500,color:"#212B32"}}>Tool calls · this cycle</span>
          <div style={{display:"flex",gap:5}}>
            {(["READ","WRITE","DELEGATE","CALC","NOTIFY","SEND"] as ToolType[]).filter(t => cfg.tools.some(tc=>tc.type===t)).map(t=>(
              <span key={t} style={{fontSize:9,fontWeight:700,color:TOOL_STYLE[t].color,backgroundColor:TOOL_STYLE[t].bg,padding:"1px 5px",borderRadius:3}}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{padding:"0 16px"}}>{cfg.tools.slice(0,toolCount).map((t,i)=><ToolRow key={i} tool={t}/>)}</div>
      </div>
      {cfg.goal && (
        <div style={{backgroundColor:"#F8FAFC",border:"0.5px solid #F0F4F5",borderRadius:10,padding:"14px 16px"}}>
          <div style={{fontSize:11,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.06em",color:"#212B32",marginBottom:12}}>Goal ancestry</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <div><div style={{fontSize:10,color:"#212B32",marginBottom:2}}>🎯 COMPANY GOAL</div><div style={{fontSize:12,color:"#212B32"}}>{cfg.goal.company}</div></div>
            <div style={{paddingLeft:16,fontSize:11,color:"#F0F4F5"}}>└─</div>
            <div style={{paddingLeft:24}}><div style={{fontSize:10,color:"#212B32",marginBottom:2}}>🏥 DEPARTMENT GOAL</div><div style={{fontSize:12,color:"#212B32"}}>{cfg.goal.department}</div></div>
            <div style={{paddingLeft:40,fontSize:11,color:"#F0F4F5"}}>└─</div>
            <div style={{paddingLeft:48}}><div style={{fontSize:10,color:"#212B32",fontWeight:600,marginBottom:2}}>⚡ CURRENT TASK</div><div style={{fontSize:12,fontWeight:500,color:"#212B32"}}>{cfg.goal.current}</div></div>
          </div>
        </div>
      )}
    </div>
  );
}

function AgentExecution() {
  const [selected, setSelected] = useState("cpxo");
  return (
    <div style={{display:"flex",minHeight:600,backgroundColor:"#FFFFFF",border:"0.5px solid #F0F4F5",borderRadius:10,overflow:"hidden"}}>
      <div style={{width:300,flexShrink:0,backgroundColor:"#FFFFFF",borderRight:"0.5px solid #F0F4F5"}}>
        <div style={{padding:"14px 16px",borderBottom:"0.5px solid #F0F4F5",backgroundColor:"#FAFBFC"}}>
          <span style={{fontSize:11,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.06em",color:"#212B32"}}>SELECT AGENT</span>
        </div>
        {PANEL_ROWS.map((row) => {
          const isSelected = selected === row.id;
          const isLedger   = row.id === "ledger";
          const isAlert    = row.dot === "red";
          return (
            <div key={row.id}>
              {isLedger && <div style={{borderTop:"0.5px solid #F0F4F5",margin:"4px 0"}}/>}
              <button onClick={()=>setSelected(row.id)} style={{width:"100%",textAlign:"left",padding:"12px 16px",cursor:"pointer",backgroundColor:isSelected?"rgba(8,80,64,0.06)":"transparent",border:"none",borderLeft:isSelected?"3px solid #085040":"3px solid transparent",borderBottom:"0.5px solid #F4F7FA",display:"flex",alignItems:"center",gap:10}}>
                <row.Icon size={16} color={isSelected?row.color:"#212B32"} />
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:isSelected?600:400,color:"#212B32",marginBottom:2}}>{row.label}</div>
                  <div style={{fontSize:11,color:"#212B32",fontStyle:isLedger?"italic":undefined}}>{row.role}</div>
                </div>
                <span className={isAlert?"animate-pulse-dot":undefined} style={{width:7,height:7,borderRadius:"50%",flexShrink:0,display:"inline-block",backgroundColor:row.dot==="red"?"#005EB8":row.dot==="purple"?"#005EB8":"#085040"}}/>
              </button>
            </div>
          );
        })}
      </div>
      <div style={{flex:1,padding:24,overflowY:"auto"}}>
        <AgentExecView key={selected} agentId={selected} />
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  const router = useRouter();
  return (
    <>
      <style>{CSS}</style>
      <div style={{display:"flex",flexDirection:"column",gap:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <h1 style={{fontSize:18,fontWeight:500,color:"#212B32",margin:0}}>How It Works</h1>
            <p style={{fontSize:12,color:"#212B32",margin:"4px 0 0 0"}}>Live agent execution · tool calls · Navedas Intelligence backend</p>
          </div>
          <button
            onClick={() => router.push("/")}
            style={{fontSize:12,fontWeight:500,color:"#005EB8",backgroundColor:"#ffffff",border:"1px solid #005EB8",borderRadius:6,padding:"8px 16px",cursor:"pointer"}}
          >
            Continue to dashboard →
          </button>
        </div>
        <AgentExecution />
      </div>
    </>
  );
}
